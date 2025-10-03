
// But as for now 
// Your code is mixing Groq SDK with the Instructor library, but instructor doesn’t support Groq yet the same way it supports OpenAI/Anthropic.

import 'dotenv/config'
import Groq from 'groq-sdk'
import Instructor from '@instructor-ai/instructor'
import { z } from 'zod'


// Setup groq client with instructor library
const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const instructor = new Instructor({
    client,
    mode: 'TOOLS'
})


console.log("instructor", instructor)

// Define your schema with zod
const ReceipeIngredientSchema = z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string().describe("The unit of measurement, like cup, tablespoon, etc.")

})

const ReceipeSchema = z.object({
    title: z.string(),
    description: z.string(),
    prep_time_minutes: z.number().int().positive(),
    cook_time_minutes: z.number().int().positive(),
    ingredients: z.array(ReceipeIngredientSchema),
    instructions: z.array(z.string()).describe("Step by step cooking instructions")
})


async function getReceipe() {
    try {
        const receipe = await instructor.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            response_model: {
                name: "Receipe",
                schema: ReceipeSchema
            },
            messages: [
                {
                    role: "user",
                    content: "Give me a receipe for chocolate chip cookies."
                }
            ],
            max_retries: 2,
        })


        // No need for try catch here because we are using instructor library and it will handle the errors for us
        console.log("Receipe:", receipe)
        return receipe

    } catch (error) {
        console.error("Error getting receipe:", error)
    }
}

getReceipe()