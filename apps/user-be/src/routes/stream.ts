import express from 'express'
import { createStream, getStreamsByUser, getStreamById, streamUpdateStatus, deleteStream, getUserStreams } from '../controllers/stream.js'
import { authMiddleware } from '../middleware/auth.js'
const streamRouter = express.Router()

streamRouter.get('/:userId', authMiddleware, getUserStreams)
streamRouter.post('/', authMiddleware, createStream)
streamRouter.get('/user/:userId', getStreamsByUser)
streamRouter.get('/:streamId', getStreamById)
streamRouter.put('/:streamId', authMiddleware, streamUpdateStatus)
streamRouter.delete('/:streamId', authMiddleware, deleteStream)

export default streamRouter