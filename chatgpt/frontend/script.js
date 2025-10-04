console.log("Working on script.js")

const input = document.querySelector("#input")
const chatContainer = document.querySelector("#chat-container")
const askBtn = document.querySelector("#ask-btn")


const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8)

console.log("threadId", threadId)


input.addEventListener('keyup', handleEnter)
askBtn.addEventListener('click', handleAsk)

const loadingElement = document.createElement("div")
loadingElement.className = "my-6 animate-pulse"
loadingElement.textContent = "Thinking..."

async function generate(text) {
    console.log("text", text)
    /**
     * 1. Append message to ui
  
     */

    const msg = document.createElement("div")
    msg.className = "my-6 bg-neutral-700 p-3 rounded-xl ml-auto max-w-fit"

    msg.textContent = text

    chatContainer.appendChild(msg)
    input.value = ""


    chatContainer.appendChild(loadingElement)

    /**
     * 2. Send it to LLM API
     * 
     */

    // Call the LLM API

    const assistantResponse = await callServer(text)
    console.log("Assistant Response :", assistantResponse)

    /** 
     * 3. Append response to ui
     */

    const assistantMsgElement = document.createElement("div")
    assistantMsgElement.className = "max-w-fit "

    assistantMsgElement.textContent = assistantResponse

    loadingElement.remove()
    chatContainer.appendChild(assistantMsgElement)

}



async function callServer(inputText) {
    const response = await fetch("http://localhost:8080/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: inputText, threadId: threadId })
    })


    if (!response.ok) {
        throw new Error("Failed to fetch response from server")
    }

    const result = await response.json()

    console.log("Result :", result)
    return result.message
}
async function handleAsk() {

    const text = input.value.trim()
    if (!text) {
        return
    }
    await generate(text)

}
async function handleEnter(e) {
    if (e.key === "Enter") {
        const text = input.value.trim()
        if (!text) {
            return
        }
        await generate(text)
    }
}