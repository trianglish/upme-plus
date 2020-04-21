import { DASHBOARD_URL } from '../../shared/constants'

export const getPermissions = () => new Promise(resolve => {
  chrome.notifications.getPermissionLevel(resolve)
})

export const create = (options) => new Promise(resolve => {
  console.log('create notification', options)
  chrome.notifications.create(null, options, resolve)
})

export const onClicked = (notificationId) => new Promise(resolve => {
  const listener = id => {
    if (id === notificationId) {
      chrome.notifications.onClicked.removeListener(listener)
      resolve(id)
    } else {
      // skip
    }
  }
  chrome.notifications.onClicked.addListener(listener)
})

export const createNotification = async ({ title = '', message = '', url = DASHBOARD_URL, ...others }) => {
  const options = {
    type: 'basic',
    title,
    message,
    iconUrl: 'images/icon.png',
    ...others,
  }

  const notificationId = await create(options)

  onClicked(notificationId).then(id => {
    window.open(url)
  })

  return notificationId
}

window.createNotification = createNotification
