import 'dotenv/config'

import { tavily } from "@tavily/core";


const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });



export default async function webSearch({ query }) {

    console.log("Calling Web Search........")

    // console.log("Query :", query)
    const response = await tvly.search(query,
        // {
        //     maxResults: 1
        // }
    );

    // console.log("Response :", response)


    const finalResult = response.results.map(result => result.content).join("\n\n")

    // console.log("Final Result :", finalResult)

    // Here we will do tavily api call to search the web and return the result

    return finalResult
}
