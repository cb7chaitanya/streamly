import { WebSocketServer } from 'ws'
import { extractUserId } from './utils/auth.js'
import { SFU } from './SFU.js'
import { createWorker } from './utils/worker.js'
import { sendMessage } from './utils/socketMsg.js'
import { SFUMessageType } from '@repo/common/client'
import { Peer } from './Peer.js'
const sfu = new SFU()

const wss = new WebSocketServer({ port: 8081 })

wss.on('connection', async (ws, req) => {
    console.log("Peer connected")
    const requestUrl = new URL(req.url!, `http://${req.headers.host}`)
    const token = requestUrl.searchParams.get('token')
    if(!token){
        sendMessage(ws, {
            type: SFUMessageType.UNAUTHORIZED,
            payload: {
                message: "Unauthorized request, missing token"
            }
        })
        return;
    }
    const userId = extractUserId(token)
    const worker = await createWorker()
    const newPeer = new Peer(userId, ws)
    sfu.addPeer(newPeer, worker)

    ws.on('close', () => {
        console.log("Peer disconnected")
        sfu.removePeer(ws)
    })
})