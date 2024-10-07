import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())


app.listen(3000, () => {
    console.log('Listening on PORT 3000')
})