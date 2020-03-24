import { VERSION, USER_AGENT } from '../shared/constants'

import processMessage from './process'
import getRemoteConfig from './config'

window.connection = null

export const connectWebsocket = async (instagram, config, sec = 1) => {
  if (
    window.connection &&
    window.connection.readyState === window.connection.OPEN
  ) { return console.log('Already running...') }

  const reconnect = () => {
    console.log(`Reconnecting to FAMILY in ${sec} seconds...`)
    setTimeout(() => connectWebsocket(instagram, config, sec * 2), sec * 1000)
  }

  const { familyUrl } = await getRemoteConfig()

  const connection = new WebSocket(familyUrl)

  const sendResponse = (data, req_id) => connection.send(JSON.stringify({ ...data, req_id }))

  window.connection = connection

  connection.onerror = error => {
    console.error(error)

    connection.close()
  }

  connection.onopen = () => {
    sec = 1 // reset error timeout counter
    console.log('Connected to FAMILY', familyUrl)

    updateWSData(instagram, config)
  }

  connection.onclose = () => {
    console.log('Connection to FAMILY closed')
    reconnect()
  }

  connection.onmessage = async event => {
    console.log('event', event)

    try {
      const message = JSON.parse(event.data)

      const { req_id, ...data } = message

      const sendResponse = data => {
        const response = { ...data, req_id }
        console.log('response', response)
        connection.send(JSON.stringify(response))
      }

      console.log('req_id', req_id)
      console.log('message', message)
      console.log('sender', event.origin)

      if (!message.method) {
        throw new Error(
          `Wrong message format: '${event.data}', 'method' expected`,
        )
      }

      if (!config.JOINED_FAMILY && config.NOT_BETA_TEST) {
        console.log(
          `Drop action, JOINED_FAMILY = ${
            config.JOINED_FAMILY
          }, BETA_TEST = ${!config.NOT_BETA_TEST}`,
        )
        throw new Error(
          `FAMILY turned off: JOINED_FAMILY = ${
            config.JOINED_FAMILY
          }, BETA_TEST = ${!config.NOT_BETA_TEST}`,
        )
      }

      await processMessage(instagram, config, data, sendResponse)
    } catch (err) {
      console.error(err, event)

      sendResponse({ status: 'error', error: { message: err.message } })
    }
  }

  return { connection, sendResponse }
}

export const updateWSData = async (instagram, config) => {
  try {
    if (instagram.user) {
      const { user } = await instagram.callMethod(
        'get_user_info',
        instagram.user.pk,
      )
      instagram.user = user
    }

    window.connection.send(
      JSON.stringify({
        status: 'ok',
        type: 'update',
        version: VERSION,
        user_agent: USER_AGENT,
        user: instagram.user,
        device: {
          user_agent: instagram.user_agent,
          phone_id: instagram.phone_id,
          uuid: instagram.uuid,
          // rank_token: instagram.rank_token(),
        },
        constants: instagram.constants,
        config: config,
      }),
    )
  } catch (err) {
    console.error('Error updating WS data', err)
  }
}
