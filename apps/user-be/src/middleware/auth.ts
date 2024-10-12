import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "../conf"
import prisma from "../../../../packages/db/db"

export interface AuthRequest extends Request {
    userId?: string
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, missing token' })
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET || 'secret') as JwtPayload
        const user = await prisma.user.findUnique({
            where: {
                id: verified.id
            }
        })
        if(!user) {
            return res.status(401).json({ message: 'Unauthorized, user not found' })
        }
        req.userId = verified.id
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Token' })
    }
}