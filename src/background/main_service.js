import instagram from './instagram'
import ChromeStorage from './storage/chrome_storage'
import ChromeHistory from './storage/chrome_history'

import stats from './storage/instagram_stats'
import { getCredentials, clearCredentials } from '../shared/credentials'

import { DEFAULT_LOCAL_CONFIG } from './constants'

import { connectWebsocket } from './ws'
import processMessage from './process'

window.instagram = instagram
window.instagram.history = new ChromeHistory()
window.stats = stats

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    const { username, password } = await getCredentials() || {}

    const { config = DEFAULT_LOCAL_CONFIG } =
      (await ChromeStorage.get('config')) || {}

    if (!username || !password) {
      console.log('No credentials!')
      const user = await instagram.login_via_cookie()
      console.log('user', user)
    } else {
      try {
        const user = await instagram.login(username, password)
        console.log('user', user)
      } catch (err) {
        console.log('clearing wrong credentials for', username)
        await clearCredentials()
      }
    }

    const replyToRequest = (sender, req_id, data) => {
      console.log('reply to', req_id, data)
      if (sender.tab) {
        return chrome.tabs.sendMessage(sender.tab.id, { req_id, ...data })
      } else {
        return chrome.runtime.sendMessage(sender.id, { req_id, ...data })
      }
    }

    chrome.runtime.onConnectExternal.addListener(async port => {
      console.log('connect', port)

      port.onMessage.addListener(async (message, sender) => {
        console.log('message', message)
        console.log('sender', sender)

        const { req_id } = message

        const sendResponse = data => port.postMessage({ req_id, ...data })

        await processMessage(instagram, config, message, sendResponse)
      })
    })

    chrome.runtime.onMessageExternal.addListener(
      async (message, sender, sendResponse) => {
        console.log('message', message)
        console.log('sender', sender)

        await processMessage(instagram, config, message, sendResponse)
      },
    )

    chrome.runtime.onMessage.addListener(async (message, sender) => {
      console.log('message', message)
      console.log('sender', sender)

      const { req_id } = message

      const sendResponse = data => replyToRequest(sender, req_id, data)

      await processMessage(instagram, config, message, sendResponse)
    })

    const { connection } = await connectWebsocket(instagram, config)

    window.connection = connection
  },
  false,
)
