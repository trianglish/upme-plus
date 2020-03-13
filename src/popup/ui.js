import instagram from './instagram_connector'
import {
  getCredentials,
  saveCredentials,
  clearCredentials,
} from '../shared/credentials'
import { logEvent } from '../shared/amplitude'
import { setView } from './view'

const whenLogged = async () => {
  const { user } = await instagram.request({
    method: 'get_user_info',
    params: ['instagram'],
  })

  console.log('@instagram', user.pk, user)

  // const follow = await instagram.callMethod('follow', user.pk)

  // console.log('follow request', follow)

  await updateView()
}

const openControlPanel = () => {
  const WEBSITE_URL = 'https://dashboard.gramup.me/'
  window.open(WEBSITE_URL)
}

const checkLogin = async () => {
  const { user } = await instagram.request({
    method: 'check_login',
  })

  console.log('update view, user =', user)

  const logged_in = !!user.pk

  return { logged_in, user }
}

const updateView = async () => {
  const creds = await getCredentials()

  try {
    const { logged_in, user } = await checkLogin()

    setView({
      logged_in,
      user,
      creds,
    })
  } catch (err) {
    setView({
      logged_in: false,
      user: null,
      creds,
    })
  }
}

const onLoginSuccess = async (res, creds) => {
  openControlPanel()
  await whenLogged()

  logEvent('Login Success', { isCookie: !creds })

  if (creds) {
    const { username, password } = creds
    await saveCredentials(username, password)
  }
}

const onLoginError = async (reason) => {
  logEvent('Login Error', { reason })

  alert(reason)
  console.error('LoginError:', reason)
}

window.onload = async () => {
  logEvent('App Loaded')

  const login_form = document.forms.instalogin

  if (!login_form) return

  // try {
  //   setView({ is_loading: true })

  //   const res = await instagram.request({
  //     method: 'login_via_cookie',
  //   })

  //   onLoginSuccess(res)
  // } catch (err) {
  //   console.log('Login Error', err)
  //   onLoginError(err.message)
  //   const { error: { response } } = err
  //   console.error(response)
  // } finally {
  //   setView({ is_loading: false })
  // }

  document.querySelector('#exit').onclick = async () => {
    await clearCredentials()

    logEvent('Logout')

    await instagram.request({
      method: 'exit',
    })

    await updateView()
  }

  document.querySelector('.btn-get-cookies').onclick = async (event) => {
    event.preventDefault()

    try {
      setView({ is_loading: true })

      const res = await instagram.request({
        method: 'login_via_cookie',
      })

      onLoginSuccess(res)
    } catch (err) {
      console.log('Login Error', err)
      onLoginError(err.message)
      const { error: { response } } = err
      console.error(response)
    } finally {
      setView({ is_loading: false })
    }
  }

  login_form.onsubmit = async (event) => {
    event.preventDefault()

    const { username, password } = document.forms.instalogin.elements
    const creds = { username: username.value, password: password.value }

    try {
      setView({ is_loading: true })

      const res = await instagram.request({
        method: 'login',
        params: [username.value, password.value],
      })

      onLoginSuccess(res, creds)
    } catch (err) {
      console.error(err)

      const { message, response } = err || {}

      console.error(response)

      if (response.two_factor_required) {
        const two_factor_data = response
        const two_factor_code = prompt('Input a code for two-factor auth from SMS')

        if (!two_factor_code) {
          return onLoginError('No code')
        }

        const res = await instagram.request({
          method: 'login_2fa',
          params: [username.value, password.value, two_factor_code, two_factor_data],
        })

        if (res.status === 'ok') {
          onLoginSuccess(res, creds)
        } else {
          onLoginError(res.error.message)
        }
      } else if (response.challenge) {
        onLoginError(response.message)
        window.open(response.challenge.url)
      } else if (response) {
        onLoginError(response.message)
      } else {
        onLoginError(message)
      }

      // if (err.message.includes(`status code 400`)) {
      //   alert(`InstagramError: Probably wrong password:` + err.message)
      // } else if (err.message.includes(`status code 400`)) {
      //   alert(`InstagramError: Probably wrong password:` + err.message)
      // } else {
      //   alert(err.message)
      // }
    } finally {
      setView({ is_loading: false })
    }
  }

  // INIT
  setView({ is_loading: true })

  setTimeout(async () => {
    await updateView()
  }, 1000)
}
