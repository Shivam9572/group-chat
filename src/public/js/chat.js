
    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");

    function getTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async function sendMessage() {
       try {
         const text = messageInput.value.trim();
        if (!text){
            alert("Message cannot be empty");
            return;
        } 
        // Save message to server
       let response = await axios.post('/message/save', { content:text },{headers:{
            authorization:localStorage.getItem("token")
       }});
       if(response.status!==201){
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
