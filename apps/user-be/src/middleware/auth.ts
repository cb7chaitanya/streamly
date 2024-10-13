import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "../conf.js"
import prisma from "@repo/db/client"

export interface AuthRequest extends Request {
    userId?: string
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) : Promise<void> => {
    const token = req.cookies?.token
    if (!token) {
        res.status(401).json({ message: 'Unauthorized, missing token' })
        return;
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET || 'secret') as JwtPayload
        console.log(verified)
        const user = await prisma.user.findUnique({
            where: {
                id: verified['userId']
            }
        })
        if(!user) {
            res.status(401).json({ message: 'Unauthorized, user not found' })
            return;
        }
        req.userId = verified['userId'] 
        next();
    } catch (error) {
        console.log(error)
        res.status(403).json({ message: 'Invalid Token' })
        return;
    }
}