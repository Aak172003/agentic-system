import 'dotenv/config'
console.log("Welcome to Generation AI")
import Groq from 'groq-sdk'

// console.log(process.env.GROQ_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// console.log("groq", groq)

async function main() {
    const completion = await groq.chat.completions.create({
        // What sampling temperature to use, between 0 and 2. 
        // Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
        temperature: 1,

        // An alternative to sampling with temperature, called nucleus sampling, 
        // where the model considers the results of the tokens with top_p probability mass.So 0.1 means only the tokens comprising the top 10% probability mass are considered.

        // less probability mass means less random output -> so this will consider less random output and more focused and deterministic output.
        // top_p: 1,

        /**
         * 1. item1
         * 2. item2
         * 3. item3
         * ...
         * 10. item10
         * 11. item11
         * it reaches 11 then it will stop
         */

        // stop: "11",

        // stop: "ve",

        // max_completion_tokens: 50,
        // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, 
        // decreasing the model's likelihood to repeat the same line verbatim.
        // frequency_penalty: 1,

        // Number between - 2.0 and 2.0.Positive values penalize new tokens based on whether they appear in the text so far,
        // increasing the model's likelihood to talk about new topics.
        // presence_penalty: 1,


        model: "llama-3.3-70b-versatile",
        messages: [
            // This is system prompt -> this is how we can set model persona or behavior or nature 
            {
                role: "system",
                // content: "You are Jarvis, a smart personal assistant. Be always polite and helpful."
                content: `You are Jarvis, smart review grader. Your task is to analyse given review and return the sentiments. 
                Classify the review as positive , neutral or negative. Output must be single word `

            },
            {
                role: "user",
                // content: "Who are you?"
                content: `Review: These headphones arrived quickly and look great, but the left earcup stopped working after a week.
                Sentiment:
                `
            }
        ]
    })
    console.log("Model Response :", completion.choices[0].message.content)
}

main()