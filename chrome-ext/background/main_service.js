const GRAMUP_CONFIG_URL = `https://insta.gramup.me/config.json`
const GRAMUP_WS_URL = `wss://socket.gramup.me/`
const VERSION = '1.4.10'

const DEFAULT_CONFIG = {
  familyUrl: GRAMUP_WS_URL,
}

const getConfig = () => {
  return fetch(GRAMUP_CONFIG_URL)
    .then(res => res.json())
    .then(config => config || DEFAULT_CONFIG)
    .catch(err => {
      console.error(err)
      return DEFAULT_CONFIG
    })
}

const replyToRequest = (sender, req_id, data) => {
  console.log('reply to', req_id, data)
  if (sender.tab) {
    return chrome.tabs.sendMessage(sender.tab.id, { req_id, ...data })
  } else {
    return chrome.runtime.sendMessage(sender.id, { req_id, ...data })
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const { username, password } = await getCredentials()

  window.instagram = new Instagram()
  window.instagram.history = new ChromeHistory()
  window.instagram.confirmator = new AllowAll()
  window.stats = new InstagramStats(window.instagram)

  if (!username || !password) {
    console.log(`No credentials!`)
  } else {
    const user = await instagram.login(username, password)
  }

  const processMessage = async (message, sendResponse) => {

    try {
      const { method, params } = message

      if (method === 'ping') {
        return sendResponse({ status: 'ok', pong: 'pong' })
      }

      if (method === 'version') {
        return sendResponse({ status: 'ok', version: VERSION })
      }

      if (method === 'stats') {
        await stats.updateValues()

        const data = await stats.getInfo()

        return sendResponse({ status: 'ok', data })
      }

      if (method === 'login') {
        const [ username, password ] = params || []

        try {
          const user = await instagram.login(username, password, true)

          return sendResponse({ status: 'ok', user })
        } catch (err) {
          console.error(err)
          const { message, response } = err
          const { data, headers } = response
          return sendResponse({ status: 'error', error: { message, response: data, headers }})
        }
      }

      if (method === 'login_2fa') {
        const [ username, password, verification_code, two_factor_data ] = params || []

        try {
          const user = await instagram.verify_2fa(username, password, verification_code, two_factor_data)

          return sendResponse({ status: 'ok', user })
        } catch (err) {
          console.error(err)
          const { message, response } = err
          const { data, headers } = response
          return sendResponse({ status: 'error', error: { message, response: data, headers }})
        }
      }

      if (method === 'exit') {
        // TODO: logout
        instagram.user = {}
        return sendResponse({ status: 'ok', user: instagram.user })
      }

      if (method === 'check_login') {
        try {
          if (instagram.user && instagram.user.username) {
            const info = await instagram.callMethod('get_user_info', instagram.user.username)

            instagram.user = info.user
          }
        } catch (error) {
          console.log(`Needs relogin`, error)

          const { username, password } = await getCredentials()
          instagram.user = await instagram.login(username, password, true)
        }

        return sendResponse({ status: 'ok', user: instagram.user })
      }

      if (method === 'get_history') {
        const history = await getHistory(...params)

        return sendResponse({ status: 'ok', history })
      }

      if (!instagram) {
        return sendResponse({ status: 'error', error: { message: 'Not initialized' } })
      }

      const res = await instagram.callMethod(method, ...params)

      return sendResponse(res)
    } catch (err) {
      console.error(err)
      const { message, response } = err
      const { data, headers } = response || {}
      return sendResponse({ status: 'error', error: { message, response: data, headers }})
    }

  }

  const connectWebsocket = async (sec = 1) => {
    if (window.connection && window.connection.readyState === window.connection.OPEN) return console.log('Already running...')

    const reconnect = () => {
      console.log(`Reconnecting to FAMILY in ${sec} seconds...`)
      setTimeout(() => connectWebsocket(sec * 2), sec * 1000)
    }

    const { familyUrl } = await getConfig()

    const connection = new WebSocket(familyUrl)

    const sendResponse = data => connection.send(JSON.stringify(data))

    window.connection = connection

    connection.onerror = error => {
      console.error(error)

      connection.close()
    }

    connection.onopen = () => {
      sec = 1 // reset error timeout counter
      console.log('Connected to FAMILY', familyUrl)
      sendResponse({ status: 'ok', version: VERSION, user: instagram.user })
    }

    connection.onclose = () => {
      console.log(`Connection to FAMILY closed`)
      reconnect()
    }

    connection.onmessage = async event => {
      console.log('event', event)

      try {
        const message = JSON.parse(event.data)

        console.log('message', message)
        console.log('sender', event.origin)

        if (!message.method) throw new Error(`Wrong message format: '${event.data}', 'method' expected`)

        await processMessage(message, sendResponse)
      } catch (err) {
        console.error(err, event)

        sendResponse({ status: 'error', error: { message: err.message } })
      }
    }
  }

  connectWebsocket()

  chrome.runtime.onConnectExternal.addListener(async (port) => {
    console.log('connect', port)

    port.onMessage.addListener(async (message, sender) => {
      console.log('message', message)
      console.log('sender', sender)

      const { req_id } = message

      const sendResponse = (data) => port.postMessage({ req_id, ...data })

      await processMessage(message, sendResponse)
    })
  })

  chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {

    console.log('message', message)
    console.log('sender', sender)

    await processMessage(message, sendResponse)
  })

  chrome.runtime.onMessage.addListener(async (message, sender) => {
    console.log('message', message)
    console.log('sender', sender)

    const { req_id } = message

    const sendResponse = data => replyToRequest(sender, req_id, data)

    await processMessage(message, sendResponse)
  })

}, false)
