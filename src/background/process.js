import { VERSION, USER_AGENT, DEFAULT_EXTENSION_CONFIG } from '../shared/constants'
import ChromeStorage from './storage/chrome_storage'

import { createNotification } from './services/notifications'
import { getCredentials } from '../shared/credentials'
// eslint-disable-next-line no-unused-vars
import { updateWSData, restartConnection } from './ws'
import stats from './storage/instagram_stats'

export const processMessage = async (instagram, config, message, sendResponse) => {
  try {
    const { method, params = [] } = message

    if (method === 'ping') {
      return sendResponse({ status: 'ok', pong: 'pong' })
    }

    if (method === 'notification') {
      const [ title, otherOptions ] = params
      const options = JSON.parse(otherOptions)
      // otherOptions: { url, message, icon, ... }
      const id = await createNotification({ title, ...options })
      return sendResponse({ status: 'ok', id })
    }

    if (method === 'open_url') {
      const [ url ] = params
      window.open(url)
      return sendResponse({ status: 'ok' })
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
      const { config: current = DEFAULT_EXTENSION_CONFIG } =
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

        // TODO: hack
        restartConnection()
        // updateWSData(instagram, config)

        return sendResponse({ status: 'ok', config: _config })
      } catch (err) {
        return sendResponse({ status: 'error', error: err.message })
      }
    }

    if (method === 'login') {
      const [username, password] = params

      try {
        const user = await instagram.login(username, password, true)

        // TODO: hack
        restartConnection()
        // updateWSData(instagram, config)

        return sendResponse({ status: 'ok', user })
      } catch (err) {
        console.error(err)

        const { message, response = {} } = err
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

        // TODO: hack
        restartConnection()
        // updateWSData(instagram, config)

        return sendResponse({ status: 'ok', user })
      } catch (err) {
        console.error(err)
        const { message, response = {} } = err
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

        const { message, response = {} } = err
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
        console.log('Waiting init')
        await instagram._wait_init
        console.log('Initialized')

        if (instagram.user && instagram.user.username) {
          const info = await instagram.callMethod(
            'get_user_info',
            instagram.user.username,
          )

          instagram.user = info.user
        }
      } catch (error) {
        console.log('Needs relogin', error)

        const { username, password } = await getCredentials() || {}

        if (username) {
          instagram.user = await instagram.login(username, password, true)
        } else {
          // Noop: Can't relogin
          console.log('No credentials saved, cant relogin')
        }
      }

      return sendResponse({ status: 'ok', user: instagram.user })
    }

    if (method === 'try_relogin') {

      // TODO: dont relogin if logged in ?
      // if (instagram.is_logged_in) {
      //   return sendResponse({ status: 'ok', user: instagram.user })
      // }

      const { username, password } = await getCredentials() || {}

      if (username) {
        instagram.user = await instagram.login(username, password, true)
      } else {
        // Noop: Can't relogin
        console.log('No credentials saved, cant relogin')
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

    const { message, response = {} } = err
    const { data, headers } = response

    return sendResponse({
      status: 'error',
      error: { message, response: data, headers },
    })
  }
}

export default processMessage

export const data = { message: 'The password you entered is incorrect. Please try again.', invalid_credentials: true, error_title: 'Incorrect password for neuralcat', buttons: [{ title: 'Try Again', action: 'dismiss' }], status: 'fail', error_type: 'bad_password' }
