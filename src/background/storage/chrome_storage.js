/* eslint-disable prefer-promise-reject-errors */
export class ChromeStorage {
  static set (key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(value)
        }
      })
    })
  }

  static get (...keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, obj => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(obj)
        }
      })
    })
  }

  static async append (key, newValue) {
    const { [key]: arr } = await ChromeStorage.get(key)

    const newArr = [...(arr || []), newValue]

    return ChromeStorage.set(key, newArr)
  }
}

export default ChromeStorage
