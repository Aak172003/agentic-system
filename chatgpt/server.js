import 'dotenv/config'
import express from 'express'
import { generateResponse } from './chatbot.js'


const app = express()

app.use(express.json())



app.get('/', (req, res) => {
    res.send('Hello World')
})

app.post("/query", async (req, res) => {
    const { message } = req.body
    console.log("message", message)

    const response = await generateResponse(message)


    res.json({ message: response })

})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
