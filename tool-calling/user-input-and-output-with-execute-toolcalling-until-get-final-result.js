import readline from 'node:readline/promises'

import 'dotenv/config'
import Groq from 'groq-sdk'
import webSearch from './utils/web-search.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// console.log("groq", groq)

async function main() {


    // Create a readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const message = [
        {
            role: "system",
            content: `
            You are a smart personal assistant who answer the asked questions. 
            You have access to following tools to answer the questions:
            1.webSearch({query}: {query: string}) // Search the latest information and realtime data on the internet.
            current date and time is ${new Date()}
            `
        },
        // Dynamically Questions Added when user ask 
    ]


    // This is for user input 
    while (true) {


        const question = await rl.question("Enter your question: ")

        if (question.toLowerCase() === "exit") {
            console.log("Exiting the program...")
            break;
        }


        message.push({
            role: "user",
            content: question
        })



        // Here we will execute tool calling until get the final result
        while (true) {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
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
                                        description: "The search query to perform search on the internet"
                                    }
                                },
                                required: ["query"]

                            }
                        }
                    }
                ],
                tool_choice: "auto"
            })

            console.log("Model Response :", JSON.stringify(completion.choices[0].message, null, 2))


            message.push(completion.choices[0].message)
            const toolCall = completion.choices[0].message.tool_calls

            if (!toolCall) {
                console.log(`Assistant Response : ${completion.choices[0].message.content}`)
                // return
                break;

            }


            for (const tool of toolCall) {

                // console.log("Tool Call :", tool)
                const functionName = tool.function.name
                const funstionParams = tool.function.arguments


                if (functionName === "webSearch") {
                    const toolResult = await webSearch(JSON.parse(funstionParams));
                    // console.log("Tool Result :", toolResult)
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
    rl.close()
}

main()