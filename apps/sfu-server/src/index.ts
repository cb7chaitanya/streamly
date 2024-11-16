import express from 'express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

app.use(express.json())

server.listen(8081, () => {
    console.log('Server listening on port 8081')
})