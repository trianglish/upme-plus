import Instagram from './src/instagram/';

const instagram = new Instagram()

export const processMessage = async (message, sendResponse) => {

    try {
      const { method, params } = message

      if (method === 'ping') {
        return sendResponse({ status: 'ok', pong: 'pong' })
      }

      if (method === 'version') {
        return sendResponse({ status: 'ok', version: VERSION })
      }

      if (method === 'stats') {
        return sendResponse({ status: 'ok', data: {
          likes: 0,
          follows: 0,

          follower_count: 0,
          following_count: 0,
          average_like_count: 0,

          full: {},
        }})
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
