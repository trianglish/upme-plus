export const changeDisplay = (elem, isShown) => isShown
  ? elem.classList.remove('hide')
  : elem.classList.add('hide')

export const setView = ({ is_loading, logged_in, user = {}, creds } = {}) => {
  const login_form = document.forms.instalogin

  if (logged_in) {
    document.querySelectorAll('.logged_in').forEach(elem => changeDisplay(elem, true))
    document.querySelectorAll('.not_logged_in').forEach(elem => changeDisplay(elem, false))
  } else {
    document.querySelectorAll('.logged_in').forEach(elem => changeDisplay(elem, false))
    document.querySelectorAll('.not_logged_in').forEach(elem => changeDisplay(elem, true))
  }

  if (user) {
    document.querySelector('.username-field').innerText = user.username
  }

  console.log('creds', creds)
  if (creds !== undefined && creds !== {} && creds !== null) {
    login_form.elements.username.value = creds.username
    login_form.elements.password.value = creds.password
  }

  console.log('is loading', is_loading)
  if (is_loading) {
    document.querySelectorAll('.loading').forEach(elem => changeDisplay(elem, true))
  } else {
    document.querySelectorAll('.loading').forEach(elem => changeDisplay(elem, false))
  }
}
