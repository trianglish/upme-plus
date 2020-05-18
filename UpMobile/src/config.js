import * as constants from '../constants'

const { GRAMUP_REMOTE_CONFIG_URL } = constants

const { DEFAULT_REMOTE_CONFIG } = constants

export const getRemoteConfig = () => {
  return fetch(GRAMUP_REMOTE_CONFIG_URL)
    .then(res => res.json())
    .then(config => config || DEFAULT_REMOTE_CONFIG)
    .catch(err => {
      console.error(err)
      return DEFAULT_REMOTE_CONFIG
    })
}

export default getRemoteConfig
