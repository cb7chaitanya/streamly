import express from 'express'
import { signup, signin, signout, refreshToken } from '../controllers/user.js'

const userRouter = express.Router()

userRouter.post('/signup', signup)
userRouter.post('/signin', signin)
userRouter.post('/signout', signout)
userRouter.get('/refresh', refreshToken)

export default userRouter