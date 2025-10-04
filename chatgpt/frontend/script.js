console.log("Working on script.js")

const input = document.querySelector("#input")
const chatContainer = document.querySelector("#chat-container")
const askBtn = document.querySelector("#ask-btn")

console.log("input", input)
console.log("chatContainer", chatContainer)

input.addEventListener('keyup', handleEnter)
askBtn.addEventListener('click', handleAsk)

function generate(text) {
    console.log("text", text)
    /**
     * 1. Append message to ui
     * 2. Send it to LLM API
     * 3. Append response to ui
     */

    const msg = document.createElement("div")
    msg.className = "my-6 bg-neutral-700 p-3 rounded-xl ml-auto max-w-fit"

    msg.textContent = text

    chatContainer.appendChild(msg)
    input.value = ""


}


function handleAsk() {

    const text = input.value.trim()
    if (!text) {
        return
    }
    generate(text)

}
function handleEnter(e) {
    if (e.key === "Enter") {
        const text = input.value.trim()
        if (!text) {
            return
        }
        generate(text)
    }
}