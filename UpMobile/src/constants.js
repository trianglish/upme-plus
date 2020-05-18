import UserAgent from 'react-native-user-agent';

export const VERSION = '1.7.0.react-native';

console.log('Local User-Agent', UserAgent.getUserAgent())
export const USER_AGENT = UserAgent.getUserAgent();
// export const DEFAULT_EXTENSION_CONFIG = {}
// export const config = {}

export const GRAMUP_REMOTE_CONFIG_URL = 'https://dashboard.upme.plus/config.json'
export const GRAMUP_DEFAULT_WS_URL = 'wss://gate.likeup.me/'

export const DEFAULT_EXTENSION_CONFIG = {
  JOINED_FAMILY: true,
  NOT_BETA_TEST: true,
  CURRENT_TASK: null,
}

export const DEFAULT_REMOTE_CONFIG = {
  familyUrl: GRAMUP_DEFAULT_WS_URL,
}
