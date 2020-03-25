import {
  API_URL,
  API_URL_v2,
  DEVICE,
  DEVICES,
  USER_AGENT_BASE,
  IG_SIG_KEY,
  REQUEST_HEADERS,
} from './constants'

import axios from 'axios'
import * as methods from './methods'
import { prefixUnsecureHeaders } from './unsecure_headers'
import {
  generate_uuid,
  generate_device_id_from_username,
  generate_signature,
  random_from,
  sleep,
} from './helpers'

import { get_locale } from './get_locale'

const print = console.log

export default class Instagram {
  constructor (username, password) {
    this.is_logged_in = false
    this.user_id = null
    this.user = null
    this.history = null
    this.confirmator = null // new Confirmator()

    this.locale = get_locale()

    this.device = random_from(Object.values(DEVICES)) || DEVICE
    this.user_agent = USER_AGENT_BASE(this.device) // just insert params

    print('USER_AGENT:', this.user_agent)

    this.phone_id = generate_uuid()
    print('PHONE_ID (just another uuid):', this.phone_id)

    this.uuid = generate_uuid()
    print('UUID:', this.uuid)

    this.rank_token = () => `${this.user_id}_${this.uuid}`

    this.username = username
    this.password = password

    this.total_requests = 0
    this.last_response = {}

    this.methods = methods

    this.constants = {
      DEVICE: this.device,
      LOCALE: this.locale,
      IG_SIG_KEY,
    }

    // if (username && password) {
    //   this.login(username, password)
    // }
  }

  async default_data () {
    return {
      _uuid: this.uuid,
      _uid: this.user_id,
    }
  }

  async login_via_cookie () {
    if (this.is_logged_in) {
      throw new Error('Already logged in')
    }

    console.log('login via cookie')

    const { viewer } = await this.send_request('direct_v2/inbox/?', null, { doLogin: true })

    const user_id = viewer.pk

    const { user, status } = await this.send_request(`users/${user_id}/info/`, null, {
      doLogin: true,
    })

    console.log('logged_in', user)

    this.history &&
      this.history.save('login', [user.username, '__from_cookie__'], { status })

    try {
      if (user) {
        this.is_logged_in = true
        this.user_id = user.pk
        this.user = user
        return user
      } else {
        throw new Error('Could not log in from cookie')
      }
    } catch (err) {
      console.error(`LoginError: ${err.message}`)
      throw err
    }
  }

  async login (username, password, forceLogin = false) {
    if (this.is_logged_in && !forceLogin) {
      throw new Error('Already logged in')
    }

    const USERNAME = username || this.username
    const PASSWORD = password || this.password

    try {
      const { logged_in_user, status } = await this._login(USERNAME, PASSWORD)

      const MASKED_PASSWORD = PASSWORD.split('').fill('*').join('')
      this.history && this.history.save('login', [USERNAME, MASKED_PASSWORD], { status })

      if (logged_in_user) {
        this.is_logged_in = true
        this.user_id = logged_in_user.pk
        this.user = logged_in_user
        return logged_in_user
      } else {
        throw new Error(`Could not log in: ${status}`)
      }
    } catch (err) {
      console.error(`LoginError: ${err.message}`)
      throw err
    }
  }

  async verify_2fa (username, password, two_factor_code, two_factor_data) {
    const two_factor_id = two_factor_data.two_factor_info.two_factor_identifier

    if (!this.device_id) {
      console.error('this.device_id uninitialized! You need to call .login first')
      return false
    }

    const data = {
      device_id: this.device_id,
      username,
      password,
      verification_code: two_factor_code,
      two_factor_identifier: two_factor_id,
      ig_sig_key_version: 4,
    }

    try {
      const { logged_in_user, status } = await this.send_request('accounts/two_factor_login/', data, { doLogin: true })

      const MASKED_PASSWORD = password.split('').fill('*').join('')
      this.history && this.history.save('login', [username, MASKED_PASSWORD], { status })

      if (logged_in_user) {
        this.is_logged_in = true
        this.user_id = logged_in_user.pk
        this.user = logged_in_user
        return logged_in_user
      } else {
        throw new Error(`Could not log in: ${status}`)
      }
    } catch (err) {
      console.error(`LoginError: ${err.message}`)
      throw err
    }
  }

  async _logout () {
    // console.error(err.message)
    // console.log(err)
    // console.log(JSON.stringify(err))

    // TODO: Analytics
    // TODO: Check if banned

    this.user = null
    this.user_id = null
    this.is_logged_in = false
  }

  async _login (username, password) {
    this.device_id = generate_device_id_from_username(username)
    print('DEVICE_ID:', this.device_id)

    const data = JSON.stringify({
      phone_id: this.phone_id,
      username: username,
      guid: this.uuid,
      device_id: this.device_id,
      password: password,
      login_attempt_count: '0',
    })

    print('Final POST DATA before signing:\n', data)
    const signed_data = generate_signature(data)
    print('Final POST DATA after signing:\n', signed_data)

    const response = await this.send_request('accounts/login/', data, { doLogin: true })

    if (response.message === 'checkpoint_required') {
      // In case of 'suspicious activity'
      console.log('Checkpoing required:', response.checkpoint_url)
    }

    return response
  }

  async _request (endpoint, method = 'GET', post_data, extra_headers = {}, { v2 = false, form = false } = {}) {
    const headers = prefixUnsecureHeaders({
      'User-Agent': this.user_agent,
      ...REQUEST_HEADERS,
      ...extra_headers,
    }, 'replace')

    if (form) {
      const bodyFormData = new FormData()

      Object.keys(post_data).forEach(key => {
        bodyFormData.set(key, post_data[key])
      })

      post_data = bodyFormData
    }

    const root = v2 ? API_URL_v2 : API_URL

    const response = await axios({
      url: root + endpoint,
      method,
      data: post_data,
      headers,
      // We handle errors manually, down there
      validateStatus: (status) => true,
    })

    const { data, status } = response

    if (status === 200) {
      this.last_response = response
      return data
    }

    console.error(`Request returns error! Status: ${status}`)

    console.error('Error Data', data)
    // Analytics.send Error

    // See ERRORS.md
    // TODO: have InstagramError class

    if (status === 405) {
      // Empty data
      throw new Error('Empty response 405')
    }

    if (!data) {
      const err = new Error(`No JSON response ${status}`)
      throw err
    }

    if (data.message.includes('feedback_required')) {
      console.error('ATTENTION! \'feedback_required\', your action could have been blocked')
      throw new Error('feedback_required')
    }

    if (status === 429) {
      const sleep_seconds = 30

      console.error(
        `That means 'too many requests'. I'll go to sleep
        for ${sleep_seconds} seconds`)

      await sleep(sleep_seconds * 1000)
    } else if (status === 400) {
      const error_message = data.message
      const error_type = data.error_type

      console.log(`Instagram's error message: ${error_message}, Error type: ${error_type}`)
      throw new Error(`InstagramError: ${error_type}: ${error_message}`)
    } else if (status === 403) {
      console.log('Error 403')

      const error_message = data.message
      const error_title = data.error_title

      if (error_message === 'login_required') {
        this._logout()
      }

      throw new Error(`InstagramError: ${error_message}: ${error_title}`)
    } else {
      const error_message = data.message
      const err = new Error(`Unknown error ${error_message}`)
      err.response = data
      err.status = status
      throw err
    }

    return false
  }

  _get (endpoint, extra_headers = {}, options = {}) {
    return this._request(endpoint, 'GET', null, extra_headers, options)
  }

  _post (endpoint, data, extra_headers = {}, options = {}) {
    return this._request(endpoint, 'POST', data, extra_headers, options)
  }

  async send_request (endpoint, data = null, { doLogin = false, with_signature = true, ...options } = {}) {
    if (!this.is_logged_in && !doLogin) {
      throw new Error(`Not logged in! Tried to call ${endpoint}`)
    }

    if (!this.user_id && !doLogin) {
      console.warn('\'user_id\' is undefined! Endpoints that need rank_token will not work. Try to relogin.')
    }

    const _data = with_signature ? generate_signature(data) : data

    try {
      if (data) {
        return await this._post(endpoint, _data, {}, { ...options })
      } else {
        return await this._get(endpoint, {}, { ...options })
      }
    } catch (err) {
      console.error('Request failed: ', endpoint, 'Data:', data, err)
      throw err
    }
  }

  async callMethod (name, ...args) {
    const _method = methods[name]

    if (typeof _method !== 'function') {
      throw new Error(`No method: ${name}. Available methods: ${Object.keys(methods).join()}`)
    }

    if (this.confirmator) {
      const ok = await this.confirmator.confirm(`${name} ${args.join(' ')}?`)

      if (!ok) throw new Error('User rejected request')
    }

    const result = await _method(this, ...args)

    this.history && this.history.save(name, args, result)

    return result
  }
}
