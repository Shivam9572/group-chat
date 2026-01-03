
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");

function getTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatTimeForIndia(dateString) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}
let fetchMessages = async () => {
    let response = await axios.get('api/message', {
        headers: {
            authorization: localStorage.getItem("token"),
        }
    });
    for (let msg of response.data.messages) {
        const msgDiv = document.createElement("div");
        msgDiv.className = "message sent";
        msgDiv.innerHTML = `
            ${msg.content}
            <span class="timestamp">${formatTimeForIndia(msg.createdAt)}</span>
        `;

        chatMessages.appendChild(msgDiv);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;

};
fetchMessages();

async function sendMessage() {
    try {
        const text = messageInput.value.trim();
        if (!text) {
            alert("Message cannot be empty");
            return;
        }
        // Save message to server
        let response = await axios.post('api/message/save', { content: text }, {
            headers: {
                authorization: localStorage.getItem("token")
            }
        });
        if (response.status !== 201) {
            alert("Failed to send message");
            return;
        }

        const msgDiv = document.createElement("div");
        msgDiv.className = "message sent";
        msgDiv.innerHTML = `
            ${text}
            <span class="timestamp">${getTime()}</span>
        `;

        chatMessages.appendChild(msgDiv);
        messageInput.value = "";

        // Auto-scroll
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        alert("Error sending message: " + error.message);
    }


}

function receiveMessage(text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message received";
    msgDiv.innerHTML = `
            ${text}
            <span class="timestamp">${getTime()}</span>
        `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send on Enter key
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});
