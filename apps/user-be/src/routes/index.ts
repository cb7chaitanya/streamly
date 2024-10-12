import express from 'express'
import userRouter from './user.js'
import streamRouter from './stream.js'

const primaryRouter = express.Router()

primaryRouter.use('/user', userRouter)
primaryRouter.use('/stream', streamRouter)

export default primaryRouter