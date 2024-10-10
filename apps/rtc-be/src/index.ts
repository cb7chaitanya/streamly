import express from 'express'
import WebSocket from 'ws'
import { Request, Response } from 'express'
import handleStream from './ffmpeg'
import { Message } from './types'
import { Readable } from 'stream'


const app = express()
const port = 8080

const wss = new WebSocket.Server({ noServer: true })

app.use(express.json())

wss.on('connection', (ws) => {
    console.log('Client connected')

    ws.on('message', (message: Message) => {
        const { rtmpUrl, streamData } = message
        console.log('Received stream data from client:', streamData)
        const readableStream = new Readable()
        readableStream.push(streamData)
        readableStream.push(null)
        handleStream(streamData, rtmpUrl)
    })

    ws.on('close', () => {
        console.log('Client disconnected')
    })
})

app.use((req: Request, res: Response) => {
    res.send('Streaming server is up and connected')
})

const server = app.listen(port, () => {
    console.log(`Streaming server listening on port ${port}`)
})

server.on('upgrade', (req:Request, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
    })
})