import express, { Request } from 'express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { RoomManager } from './roomManager.js'
import url from 'url'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { extractUserId } from './auth.js'
import { createWorker } from './lib/worker.js'
import { workerSettings } from './rtc-config.js'
import { Peer } from './peer.js'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })
const roomManager = new RoomManager()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(cookieParser())

wss.on('connection', async function connection(ws, req) {
    console.log('url', req.url)
    const url = new URL(req.url!, `http://${req.headers.host}`)
    const token = url.searchParams.get('token')
    const userId = extractUserId(token!) 
    const worker = await createWorker(workerSettings)
    roomManager.addPeer(new Peer(ws, userId), worker)

    ws.on('close', () => {
        roomManager.removePeer(ws)
    })
})

server.listen(8081, () => {
    console.log('Server listening on port 8081')
})