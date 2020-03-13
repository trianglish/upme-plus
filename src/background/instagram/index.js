import Instagram from './instagram'
import History from './instagram/history'

window.Instagram = Instagram
window.History = History

export const instagram = new Instagram()

export { Instagram, History }
export default instagram
