import { VERSION, USER_AGENT, DEFAULT_LOCAL_CONFIG } from './constants'
import ChromeStorage from './storage/chrome_storage'

import { getCredentials } from '../shared/credentials'
import { updateWSData } from './ws'
import stats from './storage/instagram_stats'

export const processMessage = async (instagram, config, message, sendResponse) => {
  try {
    const { method, params = [] } = message

    if (method === 'ping') {
      return sendResponse({ status: 'ok', pong: 'pong' })
    }

    if (method === 'version' || method === 'info') {
      return sendResponse({
        status: 'ok',
        version: VERSION,
        user_agent: USER_AGENT,
        device: {
          user_agent: instagram.user_agent,
          phone_id: instagram.phone_id,
          uuid: instagram.uuid,
          // rank_token: instagram.rank_token(),
        },
        constants: instagram.constants,
        config: config,
      })
    }

    if (method === 'stats') {
      await stats.updateValues()

      const data = await stats.getInfo()

      return sendResponse({ status: 'ok', data })
    }

    if (method === 'config') {
      const { config: current = DEFAULT_LOCAL_CONFIG } =
        (await ChromeStorage.get('config')) || {}
      const [updates] = params

      try {
        // eslint-disable-next-line no-unused-vars
        const new_config = await ChromeStorage.set('config', {
          ...current,
          ...updates,
        })

        const { config: _config } = await ChromeStorage.get('config')

        config = _config

        updateWSData(instagram, config)

        return sendResponse({ status: 'ok', config: _config })
      } catch (err) {
        return sendResponse({ status: 'error', error: err.message })
      }
    }

    if (method === 'login') {
      const [username, password] = params

      try {
        const user = await instagram.login(username, password, true)

        updateWSData(instagram, config)

        return sendResponse({ status: 'ok', user })
      } catch (err) {
        console.error(err)
        const { message, response } = err
        const { data, headers } = response
        return sendResponse({
          status: 'error',
          error: { message, response: data, headers },
        })
      }
    }

    if (method === 'login_via_cookie') {
      try {
        const user = await instagram.login_via_cookie()

        updateWSData(instagram, config)

        return sendResponse({ status: 'ok', user })
      } catch (err) {
        console.error(err)
        const { message, response } = err
        const { data, headers } = response
        return sendResponse({
          status: 'error',
          error: { message, response: data, headers },
        })
      }
    }

    if (method === 'login_2fa') {
      const [username, password, verification_code, two_factor_data] = params

      try {
        const user = await instagram.verify_2fa(
          username,
          password,
          verification_code,
          two_factor_data,
        )

        return sendResponse({ status: 'ok', user })
      } catch (err) {
        console.error(err)
        const { message, response } = err
        const { data, headers } = response
        return sendResponse({
          status: 'error',
          error: { message, response: data, headers },
        })
      }
    }

    if (method === 'exit') {
      // TODO: logout
      instagram.user = {}
      instagram.is_logged_in = false
      return sendResponse({ status: 'ok', user: instagram.user })
    }

    if (method === 'check_login') {
      try {
        if (instagram.user && instagram.user.username) {
          const info = await instagram.callMethod(
            'get_user_info',
            instagram.user.username,
          )

          instagram.user = info.user
        }
      } catch (error) {
        console.log('Needs relogin', error)

        const { username, password } = await getCredentials()

        if (username) {
          instagram.user = await instagram.login(username, password, true)
        } else {
          instagram.user = await instagram.login_via_cookie()
        }
      }

      return sendResponse({ status: 'ok', user: instagram.user })
    }

    // if (method === "get_history") {
    //   const history = await getHistory(...params);

    //   return sendResponse({ status: "ok", history });
    // }

    if (!instagram) {
      return sendResponse({
        status: 'error',
        error: { message: 'Not initialized' },
      })
    }

    const res = await instagram.callMethod(method, ...params)

    return sendResponse(res)
  } catch (err) {
    console.error(err)
    const { message, response } = err
    const { data, headers } = response || {}
    return sendResponse({
      status: 'error',
      error: { message, response: data, headers },
    })
  }
}

export default processMessage
