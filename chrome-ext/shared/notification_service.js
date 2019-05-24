const initNotifications = () => {
  if (!('Notification' in window)) {
    Promise.reject('This browser does not support system notifications')
  }

  switch (Notification.permission) {
    case 'default':
      return Notification.requestPermission()
    case 'granted':
      return Promise.resolve()
    case 'denied':
      return Promise.reject()
    default:
      return Promise.reject('unknown error')
  }
}



// initNotifications()
//   .then((res) => {
//     console.log('res',res)
//
//     const notification = new Notification("Hi there!");
//     console.log('notif', notification)
//   })
//   .catch(console.error)

const getRandomID = () => {
  return Math.random().toString(36).substring(7)
}

const openURL = url => {
  console.log('opening url', url)
  chrome.tabs.create({ url }, function (tab) {})
}

const onClicked = (id) => {
  openURL("https://dm.gramup.me")
}

const showTestNotification = () => {
  const id = getRandomID()
  const options = { type: 'basic', title: 'hey', iconUrl: 'images/icon.png', message: 'hey dm' }
  console.log('show notif', id, options)
  return chrome.notifications.create(`gramup-${id}`, options)
}

const showNewMessagesNotification = (users = ['@caffeinum', '@ohld'], unique_id = getRandomID()) => {
  const id = `gramup-newmessages-${unique_id}`
  const options = {
    type: 'basic', title: 'You have new message!',
    iconUrl: 'images/icon.png',
    message: `Read ${users.join(', ')} messages at Gram Up! Direct`
  }

  chrome.notifications.create(id, options)
}

chrome.notifications.onClicked.addListener(onClicked)
