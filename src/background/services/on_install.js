chrome.runtime.onInstalled.addListener(async function (object) {
  const { username, password } = await getCredentials()

  chrome.tabs.create({ url: "popup.html" }, function (tab) {})
})
