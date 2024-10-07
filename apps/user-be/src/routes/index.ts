import express from 'express'
import userRouter from './user'
import streamRouter from './stream'

const primaryRouter = express.Router()

primaryRouter.use('/user', userRouter)
primaryRouter.use('/stream', streamRouter)

export default primaryRouter