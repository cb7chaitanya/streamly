import express from 'express'
import cors from 'cors'
import primaryRouter from './routes/index.js'

const app = express()
app.use(express.json())
app.use(cors())

app.use('/api/v1', primaryRouter)

app.listen(3000, () => {
    console.log('Listening on PORT 3000')
})