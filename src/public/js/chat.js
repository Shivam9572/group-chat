
    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");

    function getTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

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

        // Fake reply
        setTimeout(() => receiveMessage("Got it 👍"), 800);
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
