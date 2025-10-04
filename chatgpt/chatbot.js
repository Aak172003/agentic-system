
import 'dotenv/config'
import Groq from 'groq-sdk'
import webSearch from './utils/web-search.js'
import NodeCache from 'node-cache';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const cache = new NodeCache({
    stdTTL: 60 * 60 * 24 // 24 hours
});



export async function generateResponse(userMessage, threadId) {
    // const message = [
    //     {
    //         role: "system",
    //         // content: `
    //         // You are a smart personal assistant who answers questions. 
    //         // You have access to the following tools to answer questions:
    //         // 1. webSearch({query}: {query: string}) // Search the latest information and realtime data on the internet.
    //         // Current date and time is ${new Date()}
    //         // `

    //         content: `You are a smart personal assistant.
    //         If you know the answer to a question, answer it direly in plain english.
    //         If the answer requires real-time, local, or up to date information, or if you don't know the answer, use the availabel tools to find it .
    //         You have access to the following tools:
    //         webSearch(query: string) : Use this to research the internet for current or unknown information.

    //         Decide when to use your own knowlegde and when to use the tools.
    //         Do not mention the tools in unless needed.

    //         Example:
    //         Q: What is the capital of France?
    //         A: The capital of France is Paris.

    //         Q: What is the weather in Mumbai?
    //         A: (Use the search tool to find the latest weather in Mumbai).

    //         Q: Who is the current Prime Minister of India?
    //         A: (Use the search tool to find the latest information about the current Prime Minister of India).

    //         Q: Tell me the latest IT news?
    //         A: (Use the search tool to find the latest IT news).

    //         current date and time is ${new Date().toUTCString()}
    //         `
    //     }
    // ]


    const baseMessages = [
        {
            role: "system",
            // content: `
            // You are a smart personal assistant who answers questions. 
            // You have access to the following tools to answer questions:
            // 1. webSearch({query}: {query: string}) // Search the latest information and realtime data on the internet.
            // Current date and time is ${new Date()}
            // `

            content: `You are a smart personal assistant.
            If you know the answer to a question, answer it direly in plain english.
            If the answer requires real-time, local, or up to date information, or if you don't know the answer, use the availabel tools to find it .
            You have access to the following tools:
            webSearch(query: string) : Use this to research the internet for current or unknown information.

            Decide when to use your own knowlegde and when to use the tools.
            Do not mention the tools in unless needed.

            Example:
            Q: What is the capital of France?
            A: The capital of France is Paris.

            Q: What is the weather in Mumbai?
            A: (Use the search tool to find the latest weather in Mumbai).

            Q: Who is the current Prime Minister of India?
            A: (Use the search tool to find the latest information about the current Prime Minister of India).

            Q: Tell me the latest IT news?
            A: (Use the search tool to find the latest IT news).

            current date and time is ${new Date().toUTCString()}
            `
        }
    ]


    const message = cache.get(threadId) ?? baseMessages;


    message.push({
        role: "user",
        content: userMessage
    })

    const MAX_RETIRES = 10;
    let count = 0
    while (true) {

        if (count >= MAX_RETIRES) {
            return "Sorry, I am unable to answer your question. Please try again later."

        }

        count++
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
            cache.set(threadId, message)

            console.log("cahche --------------------------- ", cache)

            console.log("cache data ", JSON.stringify(cache.data, null, 2))
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
