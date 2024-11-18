import express from 'express'
import cors from 'cors'
import primaryRouter from './routes/index.js'
import cookiesParser from 'cookie-parser'
import { Request as ExpressRequest } from 'express'
const app = express()

declare global{
    interface RequestCustom extends ExpressRequest {
        user?: any
        userId?: string
    }
}

app.use(express.json())

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(cookiesParser())

app.get('/', async(req, res) => {
    res.send('Hello World!')
})

app.use('/api/v1', primaryRouter)

app.listen(3000, () => {
    console.log('Listening on PORT 3000')
})