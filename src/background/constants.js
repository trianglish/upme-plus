import manifest from "../../chrome-ext/manifest.json";

export const GRAMUP_REMOTE_CONFIG_URL = `https://dashboard.gramup.me/config.json`;
export const VERSION = manifest["version"];
export const USER_AGENT = navigator ? navigator.userAgent : "none";
export const GRAMUP_DEFAULT_WS_URL = `wss://gate.likeup.me/`;

export const DEFAULT_LOCAL_CONFIG = {
  familyUrl: GRAMUP_DEFAULT_WS_URL
};

export const DEFAULT_CONFIG = {
  JOINED_FAMILY: true,
  NOT_BETA_TEST: true,
  CURRENT_TASK: null
};
