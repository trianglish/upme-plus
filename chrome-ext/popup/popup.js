const whenLogged = async () => {

  const { user } = await instagram.request({
    method: 'get_user_info',
    params: [ 'instagram' ]
  })

  console.log('@instagram', user.pk, user)

  // const follow = await instagram.callMethod('follow', user.pk)

  // console.log('follow request', follow)

  await updateView()
}

const openControlPanel = () => {
  const WEBSITE_URL = `https://dashboard.gramup.me/`
  window.open(WEBSITE_URL)
}

const updateView = async () => {
  try {
    const { user } = await instagram.request({
      method: 'check_login'
    })

    console.log('update view, user =', user)

    const logged_in = !!user.pk

    setView({
      logged_in,
      user,
    })
  } catch (err) {
    setView({
      logged_in: false,
      user: null,
    })
  }
}

const setView = ({ logged_in, user = {}} = {}) => {
  const changeDisplay = (elem, isShown) => isShown
    ? elem.classList.remove("hide")
    : elem.classList.add("hide")

  if (logged_in) {
    document.querySelectorAll('.logged_in')    .forEach(elem => changeDisplay(elem, true))
    document.querySelectorAll('.not_logged_in').forEach(elem => changeDisplay(elem, false))
  }
  else {
    document.querySelectorAll('.logged_in')    .forEach(elem => changeDisplay(elem, false))
    document.querySelectorAll('.not_logged_in').forEach(elem => changeDisplay(elem, true))
  }

  if (user) {
    document.querySelector('.username-field').innerText = user.username
  }

}

window.onload = async () => {
  const login_form = document.forms.instalogin

  if (!login_form) return

  await updateView()

  document.querySelector('#exit').onclick = async () => {
    await clearCredentials()

    await instagram.request({
      method: 'exit',
    })

    await updateView()
  }

  document.querySelector(".btn-get-cookies").onclick = async (event) => {
    event.preventDefault();

    try {
      const res = await instagram.request({
        method: 'login_via_cookie'
      })

      onLoginSuccess(res)
    } catch (err) {
      console.log('Login Error', err)
      const { error: { response } } = err
      console.error(response)
      onLoginError(res.error.message)
    }
  }

  login_form.onsubmit = async (event) => {
    event.preventDefault()

    const { username, password } = instalogin.elements
    const creds = { username: username.value, password: password.value }

    try {
      const res = await instagram.request({
        method: 'login',
        params: [ username.value, password.value ]
      })

      onLoginSuccess(res, creds)

    } catch (err) {
      console.error(err)

      const { error: { response } } = err || {}

      console.error(response)

      if (response.two_factor_required) {

        const two_factor_data = response
        const two_factor_code = prompt('Input a code for two-factor auth from SMS')

        if (!two_factor_code) {
          return onLoginError(`No code`)
        }

        const res = await instagram.request({
          method: 'login_2fa',
          params: [ username.value, password.value, two_factor_code, two_factor_data ]
        })

        if (res.status === 'ok') {
          onLoginSuccess(res, creds)
        } else {
          onLoginError(res.error.message)
        }

      } else if (response.challenge) {
        onLoginError(response.message)
        window.open(response.challenge.url)
      } else {
        onLoginError(response.message)
      }

      // if (err.message.includes(`status code 400`)) {
      //   alert(`InstagramError: Probably wrong password:` + err.message)
      // } else if (err.message.includes(`status code 400`)) {
      //   alert(`InstagramError: Probably wrong password:` + err.message)
      // } else {
      //   alert(err.message)
      // }
    }
  }

  const onLoginSuccess = async (res, creds) => {
    if (creds) {
      const { username, password } = creds
      await saveCredentials(username, password)
    }

    await whenLogged()
    openControlPanel()
  }

  const onLoginError = async (reason) => {
    alert(reason)
    console.error('LoginError:', reason)
  }
}
