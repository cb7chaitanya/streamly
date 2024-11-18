import dotenv from 'dotenv'

dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID