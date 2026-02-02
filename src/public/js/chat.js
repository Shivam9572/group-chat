

let awsUrl = "https://group-chat-9572.s3.ap-south-1.amazonaws.com/";
let messages = {};
const chatUI = {};
const lastConversations= new Map();
const getChatDateLabel=(dateString) =>{
  const messageDate = new Date(dateString);
  const today = new Date();
  
  // Reset time to midnight
  const todayMidnight = new Date(today.setHours(0, 0, 0, 0));
  const messageMidnight = new Date(messageDate.setHours(0, 0, 0, 0));

  const diffDays =
    (todayMidnight - messageMidnight) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    return "Today"+" at "+(new Date(dateString)).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
        });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }
}
async function getFileMeta(url) {
    const res = await fetch(url, { method: "HEAD" });
    let type = getMediaType(res.headers.get("content-type"));
    let size = formatSize(res.headers.get("content-length"));
    return {
        type,     // image/png
        size   // bytes
    };
}
function extractShortText(text, limit = 8) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(-limit)
        .join(" ");
}
function storeConversationFIFO(userId, message) {
    const shortText = extractShortText(message, 8);
    if (!shortText) return;

    let chats = lastConversations.get(userId) || "";

    // 👉 Agar limit reach ho chuki hai
     // ✅ current chat add
     chats=message;
    lastConversations.set(userId, chats);
}
function getContextForAI(userId) {
  return (lastConversations.get(userId) || "");
}

function formatSize(bytes) {
    if (!bytes) return "Unknown";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function getMediaType(mime) {
    if (!mime) return "text";

    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";

    return "text";
}
async function recoverMessage() {
    try {
        let response = await axios.post("/api/message/recover-message", {}, {
            headers: {
                authorization: localStorage.getItem("token"),
            }
        });
       
        for (data of response.data.messages) {
            await messageUpdate(data);

           

        };

    } catch (error) {
        console.log(error);
    }
}
recoverMessage();
async function messageUpdate(message) {

    let currentChatUI = document.getElementById("chatMessages");
    let messageUI;
    if (message.sender.email === localStorage.getItem("email")) {
        if (!messages[message.recieverID]) {
            messages[message.recieverID] = {
                name: message.reciever.name,
                delivered: 0,
                message: []
            };
        }
        if ((message.content !== "") && (message.type === "text")) {
            storeConversationFIFO(message.recieverID, message.content);

        }
        if (!chatUI[message.recieverID]) {
            chatUI[message.recieverID] = [];
        }
        userConnectionUI(message.reciever);

        let time = formatTimeForIndia(message.createdAt);

        if (message.media) {
            messageUI = await messageInChat({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, mediaKey: message.media.mediaKey, thumbKey: message.media.thumbKey }, true);

        } else {
            //  messages[message.recieverID].message.push({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, });
            messageUI = await messageInChat({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, }, true);
        }
        chatUI[message.recieverID].push(messageUI);
        if(message.status==="delivered"){
            messages[message.recieverID].delivered =chatUI[message.recieverID].length-1;
        }
        if (message.recieverID === window.currentId) {
            currentChatUI.append(messageUI);
            currentChatUI.scrollTop = currentChatUI.scrollHeight;
        }
    } else {
        if (!messages[message.senderID]) {
            messages[message.senderID] = {
                name: message.sender.name,
                delivered: 0,
                message: []
            };
        }
        if ((message.content !== "") && (message.type === "text")) {
            storeConversationFIFO(message.senderID, message.content);

        }
        if (!chatUI[message.senderID]) {
            chatUI[message.senderID] = [];
        }
        userConnectionUI(message.sender);
        let time = formatTimeForIndia(message.createdAt);
        if (message.media) {
            // messages[message.senderID].message.push({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, mediaKey: message.media.mediaKey, thumbKey: message.media.thumbKey });

            messageUI = await messageInChat({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, mediaKey: message.media.mediaKey, thumbKey: message.media.thumbKey, userName: message.sender.name }, false);



        } else {
            // messages[message.senderID].message.push({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, });

            messageUI = await messageInChat({ content: message.content, type: message.type, time: time, id: message.id, status: message.status, userName: message.sender.name }, false);

        }
        chatUI[message.senderID].push(messageUI);
        if (message.senderID === window.currentId) {
            currentChatUI.append(messageUI);
            currentChatUI.scrollTop  = currentChatUI.scrollHeight;
        }


    }

}
let scrollBtn=document.getElementById("scroll-top");
scrollBtn.addEventListener("click",()=>{
    let chatMesssages=document.getElementById("chatMessages");
    chatMesssages.scrollTop=chatMesssages.scrollHeight;
})
function userConnectionUI(user) {
    let connectionUserList = document.getElementById("connection-user-list");

    let divUI = connectionUserList.querySelector(`#msg-${user.id}`);
    if (divUI) {
        connectionUserList.removeChild(divUI);
    }
    let div = document.createElement("div");
    div.className = "user-list";
    div.id = `msg-${user.id}`;
    let div2 = document.createElement("div");
    let imgProfile = document.createElement("img");

    imgProfile.src = "/media/profile.png";
    div2.append(imgProfile);
    div.appendChild(div2);
    let div3 = document.createElement("div");
    let p = document.createElement("p");
    p.textContent = `${user.name}`;
    div3.append(p);
    let pStatus = document.createElement("p");
    pStatus.className = "user-status";
    pStatus.textContent = (user.isOnline === true )? "Online" :"Last seen" +getChatDateLabel(user.lastSeen) || "Offline";
    div3.append(pStatus);
    div.append(div3);
    div.addEventListener("click", (e) => {
        window.currentId = user.id;
        window.chat = "chat";
        chartingStart();
    });
    connectionUserList.prepend(div);
}



socket.emit("user-online");

socket.on("new-message", async (message, chat) => {

    try {

        if (chat === "chat") {

            await messageUpdate(message);

        }
        if (chat === "group") {

            addGroupMessage(message);
        }

        // Auto-scroll
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
        messageInput.value = "";
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

async function addContentInChat(message) {


    try {
        let content = "";
        let metadata = { type: "text" };

        if (message.type !== "text") {

            let url = `${awsUrl}${message.mediaKey}`;

            metadata = await getFileMeta(url);

        }


        switch (message.type) {
            case "image":
                content = `<img src="${awsUrl}${message.thumbKey}" class="chat-image content blurred" />
            <button class="overlay-btn" onclick="download(this)" id="${awsUrl}${message.mediaKey}"><span>${message.type}</span> <span>${metadata.size}</span><i class="fa-solid fa-arrow-down"></i></button>
            `;
                break;

            case "video":
                content = `
          <img src="${awsUrl}${message.thumbKey}" class="chat-image content blurred"/>
          <button class="overlay-btn" onclick="download(this)" id="${awsUrl}${message.mediaKey}"><span>${message.type}</span> <span>${metadata.size}</span><i class="fa-solid fa-arrow-down"></i></button>`;
                break;

            case "audio":
                content = `
        <audio controls class="chat-audio content"></audio>
        <button class="overlay-btn" onclick="download(this)" id="${awsUrl}${message.mediaKey}"><span>${message.type}</span> <span>${metadata.size}</span><i class="fa-solid fa-arrow-down"></i></button>`;
                break;

            case "document":
                content = `
        <a  target="_blank" class="chat-file content">
          📎 Download File
        </a><button class="overlay-btn" onclick="download(this)" id="${awsUrl}${message.mediaKey}"><span>${message.type}</span> <span>${metadata.size}</span><i class="fa-solid fa-arrow-down"></i></button>`;
                break;

            default:
                content = `<p>${message.content}</p>`;
        }

        return content;
    } catch (error) {
        console.log(message);
        console.log(error.message);
    }
}
async function messageInChat(data, sent) {

    const msgDiv = document.createElement("div");
    msgDiv.id = data.id;
    let content = await addContentInChat(data);
    if (sent) {
        msgDiv.className = "message sent";
        msgDiv.innerHTML = data.status == "sent" ? `
            ${content}
            
            <span class="timestamp">${data.time}</span>
        `: `
            ${content}
            
            <span class="timestamp">${data.time}</span>
        `;
    } else {
        msgDiv.className = "message received";
        msgDiv.innerHTML = `
            <span class="name">${data.userName}</span>
            ${content}
            
            <span class="timestamp" >${data.time}</span>
        `;
    }

    return msgDiv;
}


// Send on Enter key
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});
let aiSuggest = document.getElementById("ai-suggest");
let aiReplies = [];
let isInputHovered = false;

function renderAiReplies() {
    aiSuggest.innerHTML = "";
    aiReplies.forEach((e) => addReply(e));
    if (aiReplies.length && isInputHovered) {
        aiSuggest.classList.add("visible");
    } else {
        aiSuggest.classList.remove("visible");
    }
}

socket.on("smart_replies", (replies) => {
    if (!Array.isArray(replies) || replies.length === 0) {
        aiReplies = [];
        aiSuggest.classList.remove("visible");
        aiSuggest.innerHTML = "";
        return;
    }

    aiReplies = replies.slice(0, 3);
    renderAiReplies();
});

function addReply(message) {
    let btn = document.createElement("button");
    btn.textContent = message;
    btn.addEventListener("click", (e) => {
        aiReplies = [];
        aiSuggest.classList.remove("visible");
        messageInput.value = e.target.textContent;
        aiSuggest.innerHTML = "";
    });
    aiSuggest.append(btn);
}

messageInput.addEventListener("mouseenter", () => {
    isInputHovered = true;
    if (aiReplies.length) aiSuggest.classList.add("visible");
});

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
const sendTyping = debounce((value) => {
    let lastMessage=getContextForAI(window.currentId);
     socket.emit("typing_input", { currentText: value, lastMessage });
    
    
   
}, 200);

messageInput.addEventListener("input", (e) => {
    sendTyping(e.target.value);
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
            if (!chatUI[window.currentId]) {
                chatUI[window.currentId] = [];
            }
            chartingStart();

        });

        searchUserListUI.append(div);
    });

});
 


function chartingStart() {
    const chartUI = document.getElementById("chat-start");
    const chartStartUI = document.getElementById("chatMessages");
    chartStartUI.innerHTML = "";

    const pName = document.getElementById("chat-user-name");

    if (window.chat === "chat") {
        pName.textContent = messages[window.currentId].name;
        addMemberBtn.style.display = "none";
        chatUI[window.currentId].forEach((e) => {
            chartStartUI.append(e);
        });
    }
    if (window.chat === "group") {
        pName.textContent = groupMessages[window.currentId].name;

        if (!chatUI[window.currentId]) {
            chatUI[window.currentId] = [];
        }
        chatUI[window.currentId].forEach((e) => {
            chartStartUI.append(e);
        });
    }

    // Mobile behavior: hide lists and show chat view with back button
    if (window.matchMedia('(max-width:768px)').matches) {
        document.getElementById('connection-user').style.display = 'none';
        document.getElementById('group-connection-list').style.display = 'none';
        chartUI.style.display = 'flex';
        chartUI.classList.add('chat-visible');
    } else {
        chartUI.style.display = 'flex';
        chartUI.classList.remove('chat-visible');
    }
}

// Back button handler (mobile)
const chatBackBtn = document.getElementById('chat-back');
if (chatBackBtn) {
    chatBackBtn.addEventListener('click', () => {
        const chartUI = document.getElementById('chat-start');
        chartUI.style.display = 'none';
        chartUI.classList.remove('chat-visible');
        // Show the user list by default; group list will show if user switches
        document.getElementById('connection-user').style.display = 'flex';
        document.getElementById('group-connection-list').style.display = 'none';
    });
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

const menuDropdown = document.getElementById('menu-dropdown');
const menuBtn = document.getElementById('menu-btn');
const menuCreateGroupBtn = document.getElementById('menu-create-group');
const menuLogoutBtn = document.getElementById('menu-logout');
let createGroupDiv = document.getElementById("create-group-div");
let createGroupInput = document.getElementById("create-group-input");

// Toggle menu dropdown
menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle('open');
    const open = menuDropdown.classList.contains('open');
    menuDropdown.setAttribute('aria-hidden', (!open).toString());
});

// Close menu on outside click
document.addEventListener('click', (e) => {
    if (!menuDropdown.contains(e.target) && !menuBtn.contains(e.target)) {
        menuDropdown.classList.remove('open');
        menuDropdown.setAttribute('aria-hidden', 'true');
    }
});

// Create Group action
menuCreateGroupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.remove('open');
    if (createGroupDiv.style.display === "none" || createGroupDiv.style.display === "") {
        createGroupDiv.style.display = "flex";
        return;
    }
    createGroupDiv.style.display = "none";
});

// Back on create form
const createBackBtn = document.getElementById('create-group-back');
if (createBackBtn) {
  createBackBtn.addEventListener('click', (e) => {
    createGroupDiv.style.display = 'none';
    createGroupInput.value = '';
  });
}

// Logout action
menuLogoutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.classList.remove('open');
    try {
        // disconnect socket and clear token
        if (typeof socket !== 'undefined' && socket) {
            try { socket.disconnect(); } catch (err) {}
        }
        localStorage.removeItem('token');
    } catch (err) {}
    window.location.href = '/user/login';
});
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
        groupMessages[group.id] = {
            name: group.name,
            message: []
        }



        addGroupInList({ id: group.id, name: group.name });
        addMemberBtn.style.display = "flex";
        window.chat = "group";
        window.currentId = group.id;
        let chatUI = document.getElementById("chat-start");
        chatUI.style.display = "flex";
        chartingStart();
    } catch (error) {
        console.log(error);
    }
});
async function addGroupMessage(message) {
    if (!groupMessages[message.group.id]) {
        groupMessages[message.group.id] = {
            name: message.group.name,
            message: []
        }
    }
    if (!chatUI[message.group.id]) {
        chatUI[message.group.id] = [];
    }
    if ((message.content !== "") && (message.type === "text")) {
                storeConversationFIFO(message.group.id, message.content);

            }
    let time = formatTimeForIndia(message.createdAt);
    let currentChatUI = document.getElementById("chatMessages");
    let messageUI;
    if (message.sender.email === localStorage.getItem("email")) {
        if (message.media) {

            //groupMessages[message.groupID].message.push({ id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, mediaKey: message.groupMedia.mediaKey, thumbKey: message.groupMedia.thumbKey, status: message.status, time: time });
            messageUI = await messageInChat({ id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, mediaKey: message.media.mediaKey, thumbKey: message.media.thumbKey, status: message.status, time: time }, true)

        } else {
            
            messageUI = await messageInChat({ id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, status: message.status, time: time }, true);

        }


    } else {
        if (message.media) {
            messageUI = await messageInChat({ userName: message.sender.name, id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, mediaKey: message.media.mediaKey, thumbKey: message.media.thumbKey, time: time }, false);

        } else {
             
            messageUI = await messageInChat({ userName: message.sender.name, id: message.id, content: message.content, type: message.type, isDeleted: message.isDeleted, time: time }, false)
        }

    }
    chatUI[message.groupID].push(messageUI);
    if (message.groupID === window.currentId) {
        currentChatUI.append(messageUI);
        currentChatUI.scrollTop=currentChatUI.scrollHeight;
    }
    addGroupInList(message.group);
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
            if (!groupMessages[g.group.id]) {
                groupMessages[g.group.id] = {
                    name: g.group.name,
                    message: []
                }
            }
            if (!chatUI[g.group.id]) {
                chatUI[g.group.id] = [];
            }
            addGroupInList(g.group);
        });

        for (const m of response.data.messages) {

            addGroupMessage(m);

        }
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
            socket.emit("add-member", window.currentId, u.id, (res) => {
                alert(res);
            });
            addMemberInput.value = "";
            addMemberListUI.innerHTML = "";
            addMemberUI.style.display = "none";
            chatMessagesUI.style.display = "block";
        })
        addMemberListUI.append(div);
    })
})

socket.on("add-member", (group) => {
    groupMessages[group.id] = {
        name: group.name,
        message: []
    }
    chatUI[group.id] = [];
    addGroupInList(group);
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
let sendBtn = document.getElementById("sendMedia");
let url;
document.getElementById("mediaInput").addEventListener("change", (e) => {

    sendBtn.style.display = "flex";
    let cancelBn = document.getElementById("cancelMedia");
    cancelBn.style.display = "flex";
    selectedFile = e.target.files[0];
    const preview = document.getElementById("preview");
    preview.innerHTML = "";
    selectedFile = e.target.files[0];
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
sendBtn.addEventListener("click", (e) => {


    sendMedia(selectedFile, url);
    deletePreview();

});
function deletePreview() {
    let sendBtn = document.getElementById("sendMedia");
    sendBtn.style.display = "none";
    let cancelBn = document.getElementById("cancelMedia");
    cancelBn.style.display = "none";
    const preview = document.getElementById("preview");
    preview.innerHTML = "";
    selectedFile = null;
}
let openPickerBtn = document.getElementById("open-picker");
openPickerBtn.addEventListener("click", (e) => {
    const preview = document.getElementById("preview");
    if (preview.innerHTML !== "") {
        deletePreview();
    } else {
        openPicker();
    }
});

socket.on("user-online", (userId) => {
    let connectionUserList = document.getElementById("connection-user-list");
    let divUI = connectionUserList.querySelector(`#msg-${userId}`);
    if (divUI) {
        let pStatus = divUI.querySelector(".user-status");
        pStatus.textContent = "Online";

    }
    // chatUI[userId].forEach((msgUI, index) => {
    //     let statusSpan = msgUI.querySelector(".timestamp span:last-child");
    //     if (statusSpan && statusSpan.textContent === "✔") {

    //     }
    // });

});
socket.on("user-offline", (userId, lastSeen) => {
    let connectionUserList = document.getElementById("connection-user-list");
    let divUI = connectionUserList.querySelector(`#msg-${userId}`);
    if (divUI) {
        let pStatus = divUI.querySelector(".user-status");
        pStatus.textContent = "Last seen at " + getChatDateLabel(lastSeen);
    }
});
