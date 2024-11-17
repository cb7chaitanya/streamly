import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './conf.js'
import { Request } from 'express'

export const extractUserId = (cookies: any) => {
    const token = cookies['auth-token']
    const decoded = jwt.verify(token, JWT_SECRET!)
    return decoded?.userId
}