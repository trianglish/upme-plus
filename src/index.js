import Instagram from './instagram'
import History from './instagram/history'
import Confirmator from './instagram/confirmator'
import { initRoom, IPFS, Room, ROOM_NAME } from './ipfs'

window.Instagram = Instagram
window.History = History
window.Confirmator = Confirmator
window.IPFS = IPFS
window.IPFSRoom = Room
window.initRoom = initRoom
