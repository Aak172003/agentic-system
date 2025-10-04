
import 'dotenv/config'
import Groq from 'groq-sdk'
import webSearch from './utils/web-search.js'
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateResponse(userMessage) {
    const message = [
        {
            role: "system",
            content: `
            You are a smart personal assistant who answers questions. 
            You have access to the following tools to answer questions:
            1. webSearch({query}: {query: string}) // Search the latest information and realtime data on the internet.
            Current date and time is ${new Date()}`
        }
    ]

    message.push({
        role: "user",
        content: userMessage
    })

    while (true) {
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0,
            messages: message,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "webSearch",
                        description: "Search the latest information and realtime data on the internet.",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query to perform on the internet"
                                }
                            },
                            required: ["query"]
                        }
                    }
                }
            ],
            tool_choice: "auto"
        })

        const msg = completion.choices[0].message
        console.log("Model Response:", JSON.stringify(msg, null, 2))

        message.push(msg)

        // 1. Check if tool_calls object exists
        const toolCall = msg.tool_calls

        if (!toolCall) {
            console.log(`Assistant Response: ${msg.content}`)
            return msg.content
        }

        // 3. Structured tool call (normal OpenAI-style)
        for (const tool of toolCall) {
            const functionName = tool.function.name
            const functionParams = JSON.parse(tool.function.arguments)

            if (functionName === "webSearch") {
                const toolResult = await webSearch(functionParams)
                message.push({
                    tool_call_id: tool.id,
                    role: "tool",
                    name: functionName,
                    content: toolResult
                })
            }
        }
    }
}
