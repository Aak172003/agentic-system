import 'dotenv/config'
import express from 'express'
import { generateResponse } from './chatbot.js'
import cors from 'cors'


const app = express()

app.use(express.json())
app.use(cors())



app.get('/', (req, res) => {
    res.send('Hello World')
})

app.post("/query", async (req, res) => {
    const { message, threadId } = req.body

    if(!threadId || !message){
        return res.status(400).json({ error: "Thread ID and message are required" })
    }

    console.log("message", message)
    console.log("threadId", threadId)

    const response = await generateResponse(message, threadId)


    res.json({ message: response })

})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
