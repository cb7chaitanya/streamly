import express from 'express'
import { signup, signin, signout } from '../controllers/user.js'

const userRouter = express.Router()

userRouter.post('/signup', signup)
userRouter.post('/signin', signin)
userRouter.post('/signin', signout)

export default userRouter