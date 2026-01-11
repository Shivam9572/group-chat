let authenticted = async () => {
    try {
        let response = await axios.post('/user/authenticate', {}, {
            headers: {
                authorization: localStorage.getItem("token"),
            }
        });
        if (response.status === 200) {
            return new Promise((resolve, reject) => {
                resolve(true);
            });
        }
        return new Promise((resolve, reject) => {
            resolve(false);
        });

    } catch (error) {
        console.log("Authentication error:", error);
        return new Promise((resolve, reject) => {
            resolve(false);
        });
    }
}
window.onload = async () => {
    let isAuth = await authenticted();
    if (!isAuth) {
        window.location.href = "user/login";
    }

}

if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
};
const socket = new io("http://localhost:3000", {
    auth: {
        token: localStorage.getItem("token")
    }
});

socket.on("new-message", (senderName, message) => {
    try {
        receiveMessage(message, senderName);
    } catch (error) {
        console.log("Error in receiving message via socket:", error);
    }
});


const boardCastMessage = (message) => {
    try {

      
        socket.emit("new-message", message, window.room);
        
        return true;

    } catch (error) {
        console.log("Error in sending message via socket:", error);
        alert("WebSocket connection error. Message not sent.");
        return false;
    }
}


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

        if (msg.isOwnMessage !== true) {
            msgDiv.className = "message received";
            msgDiv.innerHTML = `
           <span class="name">${msg.ownerName}</span>
            ${msg.content}
            <span class="timestamp">${formatTimeForIndia(msg.createdAt)}</span>
        `;
        } else {
            msgDiv.className = "message sent";
            msgDiv.innerHTML = `
            ${msg.content}
            <span class="timestamp">${formatTimeForIndia(msg.createdAt)}</span>
        `;
        }



        chatMessages.appendChild(msgDiv);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;

};
// fetchMessages();

async function sendMessage() {
    try {
        const text = messageInput.value.trim();
        if (!text) {
            alert("Message cannot be empty");
            return;
        }
        if (!boardCastMessage(text)) {
            return;
        }
        // Save message to server



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

function receiveMessage(text, name) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message received";
    msgDiv.innerHTML = `
            <span class="name">${name}</span>
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
let emailInput = document.getElementById("email");
emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        try {
            let email = e.target.value;
            socket.emit("join-room", email);
           
            window.room = email;
            alert("joined room");
             e.target.value="";
        } catch (error) {
          console.log(error);
          alert(error.message);
        }
    }
})
