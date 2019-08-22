import IPFS from 'ipfs'
import Room from 'ipfs-pubsub-room'

const ROOM_NAME = 'GRAM_UP_ROOM'

export { Room, IPFS, ROOM_NAME }

export const initRoom = () => new Promise(async (resolve, reject) => {
  const ipfs = await IPFS.create({
    EXPERIMENTAL: {
      pubsub: true,
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
          // '/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-websocket-star',
          // '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/'
        ]
      }
    }
  })

  // IPFS node is ready, so we can start using ipfs-pubsub-room

  const room = Room(ipfs, ROOM_NAME)

  resolve({ ipfs, room })

  room.on('peer joined', (peer) => {
    console.log('Peer joined the room', peer)
  })

  room.on('peer left', (peer) => {
    console.log('Peer left...', peer)
  })

  // now started to listen to room
  room.on('subscribed', () => {
    console.log('Now connected!')
  })

})
