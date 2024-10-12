import express from 'express'
import { createStream, getStreamsByUser, getStreamById, streamUpdateStatus, deleteStream, getUserStreams } from '../controllers/stream.js'

const streamRouter = express.Router()

streamRouter.post('/', createStream)
streamRouter.get('/user/:userId', getStreamsByUser)
streamRouter.get('/:streamId', getStreamById)
streamRouter.put('/:streamId', streamUpdateStatus)
streamRouter.delete('/:streamId', deleteStream)
streamRouter.get('/:userId', getUserStreams)

export default streamRouter