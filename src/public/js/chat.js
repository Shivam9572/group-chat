
if (!localStorage.getItem("token")) {
    window.location.href = "/user/login";
};
let s3Url = `https://group-chat-9572.s3.ap-south-1.amazonaws.com/`;
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
var messages = {};
async function recoverMessage() {
    try {
        let response = await axios.post("/api/message/recover-message", {}, {
            headers: {
                authorization: localStorage.getItem("token"),
            }
        });

        response.data.messages.forEach((data) => {

            messageUpdate(data);
            if (data.sender.email === localStorage.getItem("email")) {
                userConnectionUI(data.recieverID);
            } else {
                userConnectionUI(data.senderID);
            }

        });

    } catch (error) {
        console.log(error);
    }
}
recoverMessage();
function messageUpdate(message) {
    if (message.sender.email === localStorage.getItem("email")) {
        if (!messages[message.recieverID]) {
            messages[message.recieverID] = {
                name: message.reciever.name,
                delivered: 0,
                message: []
            };
        }
        let time = formatTimeForIndia(message.createdAt);
        messages[message.recieverID].message.push({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, mediaUrl: message.mediaUrl });
        if (message.status === "delivered") {

            messages[message.recieverID].delivered = messages[message.recieverID].message.length - 1;

        }
    } else {
        if (!messages[message.senderID]) {
            messages[message.senderID] = {
                name: message.sender.name,
                delivered: 0,
                message: []
            };
        }
        let time = formatTimeForIndia(message.createdAt);
        messages[message.senderID].message.push({ content: message.content, type: message.type, time: time, id: message.id, userName: message.ownerName, mediaUrl: message.mediaUrl });
    }
}
function userConnectionUI(id) {
    let connectionUserList = document.getElementById("connection-user-list");

    let divUI = connectionUserList.querySelector(`#msg-${id}`);
    if (divUI) {
        connectionUserList.removeChild(divUI);
    }
    let div = document.createElement("div");
    div.className = "user-list";
    div.id = `msg-${id}`;
    let div2 = document.createElement("div");
    let imgProfile = document.createElement("img");

    imgProfile.src = "/media/profile.png";
    div2.append(imgProfile);
    div.appendChild(div2);
    let div3 = document.createElement("div");
    let p = document.createElement("p");
    p.textContent = `${messages[id].name}`;
    div3.append(p);
    div.append(div3);
    div.addEventListener("click", (e) => {
        window.currentId = id;
        window.chat = "chat";
        chartingStart();
    });
    connectionUserList.prepend(div);
}


const socket = new io("http://localhost:3000", {
    auth: {
        token: localStorage.getItem("token")
    }
});
socket.emit("user-online");

socket.on("new-message", async (message, chat) => {
    let time = formatTimeForIndia(message.createdAt);
   
    try {
        if (chat === "chat") {
            messageUpdate(message);
            if ((message.sender.email === localStorage.getItem("email")) && (window.currentId == message.reciever.id)) {
                messageInChat({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, mediaUrl: message.mediaUrl }, true);
            }
            if (window.currentId == message.sender.id) {
                messageInChat({ content: message.content, type: message.type, time: time, id: message.id, userName: message.ownerName, mediaUrl: message.mediaUrl }, false);
            }
        }
        if (chat === "group") {
            addGroupMessage(message);
            if (window.currentId == message.groupInfo.id) {
                if (message.senderInfo.email === localStorage.getItem("email")) {
                    messageInChat({ id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, mediaUrl: message.mediaUrl, status: message.status, time: time }, true);
                } else {
                    messageInChat({ userName: message.senderInfo.name, id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, mediaUrl: message.mediaUrl, time: time }, false);
                }
            }
        }

    } catch (error) {
        console.log("Error in receiving message via socket:", error);
    }
});



const messageInput = document.getElementById("messageInput");

function formatTimeForIndia(dateString) {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

async function sendMessage() {
    try {
        const text = messageInput.value.trim();
        if (!text) {
            alert("Message cannot be empty");
            return;
        }

        // Save message to server
        if (window.chat === "chat") {
            socket.emit("send-message", text, window.currentId, "chat");

        }
        if (window.chat === "group") {
            socket.emit("send-message", text, window.currentId, "group");

        }


    } catch (error) {
        alert("Error sending message: " + error.message);
    }
}

function addContentInChat(message) {


    let content = "";

    switch (message.type) {
        case "image":
            content = `<img src="${message.mediaUrl}" class="chat-image" />`;
            break;

        case "video":
            content = `
        <video controls class="chat-video">
          <source src="${message.mediaUrl}" />
        </video>`;
            break;

        case "audio":
            content = `
        <audio controls class="chat-audio">
          <source src="${message.mediaUrl}" />
        </audio>`;
            break;

        case "document":
            content = `
        <a href="${message.mediaUrl}" target="_blank" class="chat-file">
          📎 Download File
        </a>`;
            break;

        default:
            content = `<p>${message.content}</p>`;
    }

    return content;
}
function messageInChat(data, sent) {
    let chartStartUI = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.id = data.id;
    let content = addContentInChat(data);
    if (sent) {
        msgDiv.className = "message sent";
        msgDiv.innerHTML = data.status == "sent" ? `
            ${content}
            <span class="timestamp">${data.time}✔</span>
        `: `
            ${content}
            <span class="timestamp">${data.time}✔✔</span>
        `;
    } else {
        msgDiv.className = "message received";
        msgDiv.innerHTML = `
            <span class="name">${data.userName}</span>
            ${content}
            <span class="timestamp" >${data.time}</span>
        `;
    }
    chartStartUI.appendChild(msgDiv);
    messageInput.value = "";
    // Auto-scroll
    chartStartUI.scrollTop = chartStartUI.scrollHeight;
}


// Send on Enter key
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});
let newChatButton = document.getElementById("new-chat");
newChatButton.addEventListener("click", (e) => {
    let connectionUserUI = document.getElementById("connection-user");
    let searchUserUI = document.getElementById("search-user");
    connectionUserUI.style.display = "none";
    searchUserUI.style.display = "flex";
});
let searchBack = document.getElementById("search-back");
searchBack.addEventListener("click", (e) => backFromSearchUser());
let backFromSearchUser = () => {
    let searchUserListUI = document.getElementById("search-user-list");
    searchUserListUI.innerHTML = "";
    searchUserInput.value = "";
    let searchUserUI = document.getElementById("search-user");
    let connectionUserUI = document.getElementById("connection-user");
    connectionUserUI.style.display = "flex";
    searchUserUI.style.display = "none";
}
let searchUserInput = document.getElementById("search");
searchUserInput.addEventListener("input", async (e) => {

    socket.emit("search-user", e.target.value);
});
socket.on("user-search", (users) => {
    let searchUserListUI = document.getElementById("search-user-list");
    searchUserListUI.innerHTML = "";
    users.forEach(user => {

        let div = document.createElement("div");
        div.className = "user-list";
        div.id = user.phone;
        let div2 = document.createElement("div");
        let imgProfile = document.createElement("img");

        imgProfile.src = "/media/profile.png";
        div2.append(imgProfile);
        div.appendChild(div2);
        let div3 = document.createElement("div");
        let p = document.createElement("p");
        p.textContent = `${user.name}`;
        div3.append(p);
        div.append(div3);
        div.addEventListener("click", (e) => {

            backFromSearchUser();
            window.chat = "chat";
            window.currentId = user.id;
            if (!messages[user.id]) {
                messages[user.id] = {
                    name: user.name,
                    delivered: 0,
                    message: []
                };
            }
            chartingStart();

        });

        searchUserListUI.append(div);
    });

});

function chartingStart() {
    let chartUI = document.getElementById("chat-start");
    chartUI.style.display = "flex";
    let chartStartUI = document.getElementById("chatMessages");
    chartStartUI.innerHTML = "";

    let pName = document.getElementById("chat-user-name");

    if (window.chat === "chat") {
        pName.textContent = messages[window.currentId].name;
        messages[window.currentId].message.forEach((m) => {
            if (m.userName) {
                messageInChat(m, false);
            } else {
                messageInChat(m, true);
            }
        });
    }
    if (window.chat === "group") {
        pName.textContent = groupMessages[window.currentId].name;
        groupMessages[window.currentId].message.forEach((m) => {
            if (m.userName) {
                messageInChat(m, false);
            } else {
                messageInChat(m, true);
            }
        })
    }

}

let selectChatBtn = document.getElementById("select-chat-btn");
let selectGroupChatBtn = document.getElementById("select-group-chat-btn");
let userListUI = document.getElementById("connection-user-list");
let groupListUI = document.getElementById("group-connection-list");
selectChatBtn.addEventListener("click", (e) => {
    selectChatBtn.style.borderBottom = "3px solid rgb(6, 235, 101)";
    selectGroupChatBtn.style.borderBottom = "none";
    groupListUI.style.display = "none";
    userListUI.style.display = "block";
});
selectGroupChatBtn.addEventListener("click", (e) => {
    selectGroupChatBtn.style.borderBottom = "3px solid rgb(6, 235, 101)";
    selectChatBtn.style.borderBottom = "none";
    userListUI.style.display = "none";
    groupListUI.style.display = "block";
});

let createGroupBtn = document.getElementById("create-group-btn");
let createGroupDiv = document.getElementById("create-group-div");
let createGroupInput = document.getElementById("create-group-input");
createGroupBtn.addEventListener("click", (e) => {
    if (createGroupDiv.style.display === "none") {
        createGroupDiv.style.display = "flex";
        return;
    }
    createGroupDiv.style.display = "none";
})
let createGroup = document.getElementById("create-group");
createGroup.addEventListener("click", (e) => {
    let name = createGroupInput.value;
    createGroupDiv.style.display = "none";
    createGroupInput.value = "";
    selectGroupChatBtn.style.borderBottom = "3px solid rgb(6, 235, 101)";
    selectChatBtn.style.borderBottom = "none";
    userListUI.style.display = "none";
    groupListUI.style.display = "block";
    socket.emit("create-group", name);
});
let addMemberBtn = document.getElementById("add-member");
const groupMessages = {};
socket.on("create-group-ack", (group) => {
    try {
        groupMessages[group.groupID] = {
            name: group.name,
            message: []
        }
        addGroupInList({ id: group.groupID, name: group.name });
        addMemberBtn.style.display = "flex";
        window.chat = "group";
        window.currentId = group.id;
        let chatUI = document.getElementById("chat-start");
        chatUI.style.display = "flex";
        if (!groupMessages[group.id]) {
            groupMessages[group.id] = {
                name: group.name,
                message: []
            }
        }
        chartingStart();
    } catch (error) {
        console.log(error);
    }
});
function addGroupMessage(message) {

    if (!groupMessages[message.groupID]) {
        groupMessages[message.groupID] = {
            name: message.groupInfo.name,
            message: []
        }
    }
    let time = formatTimeForIndia(message.createdAt);
    if (message.senderInfo.email === localStorage.getItem("email")) {
        groupMessages[message.groupID].message.push({ id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, mediaUrl: message.mediaUrl, status: message.status, time: time });
    } else {
        groupMessages[message.groupID].message.push({ userName: message.senderInfo.name, id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, mediaUrl: message.mediaUrl, time: time });
    }
    addGroupInList(message.groupInfo);
}
function addGroupInList(group) {

    let groupListUI = document.getElementById("group-connection-list");
    let divUI = groupListUI.querySelector(`#gro-${group.id}`);
    if (divUI) {
        groupListUI.removeChild(divUI);
    }
    let div = document.createElement("div");
    div.className = "user-list";
    div.id = `gro-${group.id}`;
    let div2 = document.createElement("div");
    let imgProfile = document.createElement("img");

    imgProfile.src = "/media/profile.png";
    div2.append(imgProfile);
    div.appendChild(div2);
    let div3 = document.createElement("div");
    let p = document.createElement("p");
    p.textContent = `${group.name}`;
    div3.append(p);
    div.append(div3);
    div.addEventListener("click", (e) => {
        addMemberBtn.style.display = "flex";
        window.chat = "group";
        window.currentId = group.id;
        let chatUI = document.getElementById("chat-start");
        chatUI.style.display = "flex";
        chartingStart();
    });
    groupListUI.prepend(div);
}


async function recoverGroupMessage() {
    try {
        let response = await axios.post("/api/message/recover-group-message", {}, {
            headers: {
                authorization: localStorage.getItem("token"),
            }
        });

        response.data.groups.forEach((g) => {
            groupMessages[g.group.id] = {
                name: g.group.name,
                message: []
            }
            addGroupInList(g.group);
        });
        response.data.messages.forEach((m) => {
            addGroupMessage(m);
            addGroupInList(m.groupInfo);
        })
    } catch (error) {
        console.log(error);
    }
}
recoverGroupMessage();

let chatMessagesUI = document.getElementById("chatMessages");
let addMemberUI = document.getElementById("add-member-search");
let addMemberInput = document.getElementById("add-member-input");
let addMemberListUI = document.getElementById("member-search-list");
addMemberBtn.addEventListener("click", () => {
    if (addMemberUI.style.display === "block") {
        addMemberUI.style.display = "none";
        chatMessagesUI.style.display = "block";

    } else {
        chatMessagesUI.style.display = "none";
        addMemberUI.style.display = "block";
    }
});

addMemberInput.addEventListener("input", (e) => {

    socket.emit("search-member", e.target.value);
});
socket.on("search-member", (users) => {
    addMemberListUI.innerHTML = "";
    users.forEach((u) => {
        let div = document.createElement("div");
        let imgProfile = document.createElement("img");

        imgProfile.src = "/media/profile.png";
        div.append(imgProfile);
        let p = document.createElement("p");
        p.textContent = u.phone;
        p.style.padding = "5px";
        p.style.borderBottom = "3px solid black";
        div.appendChild(p);
        div.addEventListener("click", (e) => {
            socket.emit("add-member", window.currentId, u.id);
            addMemberInput.value = "";
            addMemberListUI.innerHTML = "";
            addMemberUI.style.display = "none";
            chatMessagesUI.style.display = "block";
        })
        addMemberListUI.append(div);
    })
})
socket.on("already-exit", () => {
    alert("This member already exits");
});
socket.on("add-member", (userID, groupID) => {
    alert("add Member");
});

let selectedFile = null;
function openPicker() {
    const options = document.getElementById("options");
    options.style.display = options.style.display === "none" ? "flex" : "none";
}

function selectType(type) {
    const input = document.getElementById("mediaInput");
    input.accept = type;
    input.click();
    document.getElementById("options").style.display = "none";
}

document.getElementById("mediaInput").addEventListener("change", (e) => {
    let sendBtn = document.getElementById("sendMedia");
    sendBtn.style.display = "flex";
    selectedFile = e.target.files[0];
    const preview = document.getElementById("preview");
    preview.innerHTML = "";

    if (!selectedFile) return;

    let previewURL = null;

    if (previewURL) URL.revokeObjectURL(previewURL);
    url = URL.createObjectURL(selectedFile);


    if (selectedFile.type.startsWith("image/")) {
        preview.innerHTML = `<img src="${url}" width="200" />`;
    }
    else if (selectedFile.type.startsWith("video/")) {

        preview.innerHTML = `<video src="${url}" controls width="250"></video>`;
    }
    else if (selectedFile.type.startsWith("audio/")) {

        preview.innerHTML = `<audio src="${url}" controls></audio>`;
    }
    else {
        // DOCUMENT PREVIEW

        preview.innerHTML = `
      <div style="border:1px solid #ccc;padding:10px;width:250px">
        <p>📄 ${selectedFile.name}</p>
        <p>Size: ${(selectedFile.size / 1024).toFixed(2)} KB</p>
      </div>
    `;
    }
});

async function send() {
    let sendBtn = document.getElementById("sendMedia");
    sendBtn.style.display = "none";
    if (!selectedFile) {
        alert("Select a file first");
        return;
    }

     const formData = new FormData();
      formData.append("file", selectedFile);
      if(window.chat==="chat"){
        formData.append("chat",window.currentId);
      }
      if(window.chat==="group"){
        formData.append("group",window.currentId);
      }
     let response=await axios.post("api/message/upload",formData,{
        headers: {
          authorization: localStorage.getItem("token")
       }
     });
     console.log(response.data.url);
   




    selectedFile = null;
    document.getElementById("preview").innerHTML = "";
}

