import { VERSION, USER_AGENT } from '../shared/constants'

import processMessage from './process'
import getRemoteConfig from './config'

window.connection = null
window.old_connections = []

export const restartConnection = () => {
  // HACK
  window.connection.close()
}

export const connectWebsocket = async (instagram, config, sec = 1) => {
  window.connection && console.log(
    'Connection OPEN =', window.connection.readyState === window.connection.OPEN,
    ', status =', window.connection.readyState,
  )

  if (
    window.connection &&
    window.connection.readyState === window.connection.OPEN
  ) { return console.log('Already running...') }

  const reconnect = () => {
    console.log(`Reconnecting to FAMILY in ${sec} seconds...`)

    setTimeout(() => {
      const cappedTimeout = Math.min(60, sec * 2)
      connectWebsocket(instagram, config, cappedTimeout)
    }, sec * 1000)
  }

  const { familyUrl } = await getRemoteConfig()

  const connection = new WebSocket(familyUrl)

  const sendResponse = (data, req_id) => connection.send(JSON.stringify({ ...data, req_id }))

  window.connection && window.old_connections.push(window.connection)

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
        const response = { ...data, req_id, type: 'reply' }
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
    if (instagram.user && instagram.user.pk) {
      const { user } = await instagram.callMethod(
        'get_user_info',
        instagram.user.pk,
      )
      instagram.user = user
    }

    window.connection.send(
      JSON.stringify({
        status: 'ok',
        type: 'connect',
        version: VERSION,
        user_agent: USER_AGENT,
        user: instagram.user,
        device: {
          user_agent: instagram.user_agent,
          phone_id: instagram.phone_id,
          uuid: instagram.uuid,
          device_id: instagram.device_id,
        },
        constants: instagram.constants,
        config: config,
      }),
    )
  } catch (err) {
    console.error('Error updating WS data', err)
  }
}
