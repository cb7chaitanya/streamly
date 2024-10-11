import express from 'express'
import WebSocket from 'ws'
import { Request, Response } from 'express'
import handleStream from './ffmpeg.ts'
import { Message } from './types.ts'
import { Readable } from 'stream'
import { ChildProcessWithoutNullStreams } from 'child_process'
import { messageSchema } from '@repo/validator/client'

const app = express()
const port = 8080

const wss = new WebSocket.Server({ noServer: true })

app.use(express.json())

wss.on('connection', (ws) => {
    console.log('Client connected')
    let ffmpegProcess: ChildProcessWithoutNullStreams | null = null

    ws.on('message', (message: Message) => {
        const { success } = messageSchema.safeParse(message)
        if(!success) {
            console.error('Invalid message:', message)
            process.exit(1);
        }
        const { rtmpUrl, streamData } = message
        console.log('Received stream data from client:', streamData)
        const readableStream = new Readable()
        readableStream.push(streamData)
        readableStream.push(null)
        ffmpegProcess = handleStream(streamData, rtmpUrl)
    })

    ws.on('close', () => {
        console.log('Client disconnected')
        if(ffmpegProcess) {
            ffmpegProcess.kill()
            console.log('FFmpeg process killed')
        }
    })

    ws.on('error', (error) => {
        console.error('WebSocket error:', error)
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