import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './conf.js'
import { Request } from 'express'
import  { JwtPayload } from 'jsonwebtoken'

interface JwtPayload_custom extends JwtPayload {
    userId: string
}
export const extractUserId = (token: string) => {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload_custom
    return decoded?.userId
}