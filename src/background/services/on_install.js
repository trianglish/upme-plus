import { getCredentials } from '../../shared/credentials'

chrome.runtime.onInstalled.addListener(async function (object) {
  // eslint-disable-next-line no-unused-vars
  const { username, password } = await getCredentials()

  chrome.tabs.create({ url: 'popup.html' }, function (tab) {})
})
