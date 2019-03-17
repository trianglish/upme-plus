class InstagramError extends Error {
  constructor(status, message = '') {
    super(message)
    this.status = status

    this.message = `InstagramError ${status}: ${message}`
  }
}

class TimeoutError extends Error {}
class NotInstalledError extends Error {}

class InstagramConnector {
  _currend_id = ""
  _instaweb_dev_id = "kakgeanaigaghemcjhohikiblgnflbfl"
  _instaweb_id = "njonkbhnmmjgancfbncekpgkmidhbbpo"

  isStopped = false
  isConnected = false

  _check_working_id = () => new Promise((resolve, reject) => {

    setTimeout(() => reject(new NotInstalledError(`Cant find any working extension`)), 500)

    chrome.runtime.sendMessage(
      this._instaweb_id,
      { method: 'ping' }, null,
      ({ status, pong } = {}) => status === 'ok' && pong && resolve(this._instaweb_id))

    chrome.runtime.sendMessage(
      this._instaweb_dev_id,
      { method: 'ping' }, null,
      ({ status, pong } = {}) => status === 'ok' && pong && resolve(this._instaweb_dev_id))

  })

  init = async () => {
    try {
      this._currend_id = await this._check_working_id()

      this.isConnected = true
    } catch (err) {
      if (err instanceof TimeoutError) {
        this.isConnected = false
        return
      }

      throw err
    }

  }

  start = () => this.isStopped = false
  kill = () => this.isStopped = true

  request = (data, wake = false) => new Promise((resolve, reject) => {
    const wasWorking = !this.isStopped

    if (wake && !wasWorking) this.start()

    if (this.isStopped) return reject(new Error(`Request was killed`))
    if (!this.isConnected) return reject(new NotInstalledError())

    setTimeout(() => reject(new TimeoutError(`Request timeout`)), 10000)

    const onResponse = (message) => {
      if (!message) return reject(new NotInstalledError())

      const { status, error } = message

      console.log('request', data.method, '->', status, message)

      if (status !== 'ok') {
        reject(new InstagramError(status, error))
      } else {
        resolve(message)
      }
    }

    console.log(`send_message`, this._currend_id, data)
    chrome.runtime.sendMessage(this._currend_id, data, null, onResponse)

    if (wake && !wasWorking) this.kill()
  })

  request_generator = async function * ({ method, params }, limit = Infinity) {
    let _users = []
    let generator = this.page_generator({ method, params })

    do {
      const { users } = generator.next()

      console.log('users', users)

      _users = [ ..._users, ...users ]

      const shouldStop = yield users

      if (_users.length > limit) {
        return _users
      }

    } while(true)

  }

  page_generator = async function * ({ method, params }) {
    let _params = params

    do {
      const payload = { method, params: _params }
      const { big_list, next_max_id, ...rest } = await instagram.request(payload)

      console.log('big_list', big_list, 'next_max_id', next_max_id)

      const shouldStop = yield rest

      if (shouldStop || !next_max_id) {
        return
      }

      _params = [ ...params, next_max_id ]

    } while(true)

  }

}

const instagram = new InstagramConnector()
