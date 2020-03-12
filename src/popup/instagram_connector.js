export class InstagramError extends Error {
  constructor (status, error = '') {
    super(error)
    this.status = status
    this.error = error
    this.message = `InstagramError ${status}: ${error.response ? error.response.message : error}`
    this.response = error.response
  }
}

export class TimeoutError extends Error {}

export class InstagramConnector {
  constructor () {
    this.isStopped = false
    this.isConnected = false

    this.init = async () => {
      try {
        const ping = await this.request({
          method: 'ping',
        })

        console.log('ping', ping)

        this.isConnected = ping.status === 'ok' && Boolean(ping.pong)
      } catch (err) {
        if (err instanceof TimeoutError) {
          this.isConnected = false
          return
        }

        throw err
      }
    }

    this.start = () => (this.isStopped = false)
    this.kill = () => (this.isStopped = true)
  }

  request (data) {
    return new Promise((resolve, reject) => {
      if (this.isStopped) return reject(new Error('Request was killed'))

      // { method, params } = method

      const req_id = Date.now()

      const handler = (message, sender) => {
        const { status, error } = message

        if (message.req_id && req_id !== message.req_id) return

        chrome.runtime.onMessage && chrome.runtime.onMessage.removeListener(handler)

        console.log('request', data.method, '->', status, message)

        console.log(status, error)

        if (status !== 'ok') {
          reject(new InstagramError(status, error))
        } else {
          resolve(message)
        }
      }

      setTimeout(() => reject(new TimeoutError('Request timeout')), 10000)

      chrome.runtime.onMessage && chrome.runtime.onMessage.addListener(handler)

      console.log('send_message', null, { req_id, ...data })
      chrome.runtime.sendMessage(null, { req_id, ...data })
    })
  }
}

export const instagram = new InstagramConnector()
export default instagram
