

async function sendMedia(file, url) {

  if (!file) {

    alert("Select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);


  let { progressText, bubble } = showPreviewChat(file, url);
  let chartStartUI = document.getElementById("chatMessages");
  chartStartUI.append(bubble);
  if (window.chat === "chat") {
    userConnectionUI(window.currentId);
    formData.append("chat", window.currentId);

  }
  if (window.chat === "group") {

    addGroupInList({ id: window.currentId, name: groupMessages[window.currentId].name })
    formData.append("group", window.currentId);

  }
  chatUI[window.currentId].push(bubble);


  // 1️⃣ get upload url
  try {
    const res = await axios.post("/api/message/upload-url", {
      fileName: file.name,
      fileType: file.type
    },
      {
        headers: {
          authorization: localStorage.getItem("token")
        },
      });

    const { uploadUrl, key } = res.data;



    // 2️⃣ upload to S3 with progress
    let [resolve, reject] = await uploadWithProgress(progressText, uploadUrl, file, key);


    let chat = (window.chat === "chat") ? "chat" : "group";
    // 3️⃣ emit socket event
    let type;
    if (file.type.startsWith("video")) {
      type = "video";
    } else if (file.type.startsWith("audio")) {
      type = "audio"
    }
    else if (file.type.startsWith("image")) {
      type = "image"
    } else {
      type = "document"
    }

    socket.emit("send-media", {
      mediaType: type,
      mediaKey: key,
    }, chat, window.currentId, (res) => {

      let time = formatTimeForIndia(res.time);
      bubble.id = res.id;
      if (res.delivered === true) {
        progressText.textContent = `${time} ✔✔`;
      } else {
        progressText.textContent = `${time} ✔`;
      }
    });
  } catch (error) {
    console.log(error);
  }
}
function showPreviewChat(file, url) {

  let bubble = document.createElement("div");
  bubble.className = "send-message";
  if (file.type.startsWith("image/")) {
    bubble.innerHTML = `<img src=${url} class="preview-img-chat">`
  }
  else if (file.type.startsWith("video/")) {
    bubble.innerHTML = `<video controls src=${url} class="preview-video-chat">`
  }
  else if (file.type.startsWith("audio/")) {
    bubble.innerHTML = `<audio controls src=${url} class="preview-audio-chat">`
  } else {
    bubble.innerHTML = `<div style="border:1px solid #ccc;padding:10px;width:250px">
        <p>📄<a href=${url} target="_blank"> ${file.name}</a></p>
      </div>`
  }

  const overlay = document.createElement("div");
  overlay.className = "progress-overlay";
  let progressText = document.createElement("div");
  progressText.className = "progress-text";
  progressText.textContent = "0%";
  overlay.append(progressText);


  bubble.appendChild(overlay);

  return { progressText, bubble };


}
async function uploadWithProgress(progressText, uploadUrl, file, key) {
  return new Promise(async (resolve, reject) => {

    try {
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type
        },

        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total

          );
          progressText.textContent = percent + "%"
        },
      });
      resolve(key);
    } catch (error) {
      console.log(error);
      reject("something went wrong")
    }
  });
}
function reciveMediaChat(data) {

  let bubble = document.createElement("div");
  bubble.className = "recieve-message";
  if (data.mediaType.startsWith("image")) {
    bubble.innerHTML = `<img src=${data.thumbUrl} class="preview-img-chat">`
  }
  else if (data.mediaType.startsWith("video")) {
    bubble.innerHTML = `<img  src=${data.thumbUrl} class="preview-video-chat">`
  }
  else if (data.mediaType.startsWith("audio")) {
    bubble.innerHTML = `<audio controls src=${data.thumbUrl} class="preview-audio-chat">`
  } else {
    bubble.innerHTML = `<div style="border:1px solid #ccc;padding:10px;width:250px">
        <p>📄 ${file.name}</p>
      </div>`
  }

  const overlay = document.createElement("div");
  overlay.className = "progress-overlay";
  let progressText = document.createElement("div");
  progressText.className = "progress-text";
  progressText.textContent = "0%";
  overlay.append(progressText);


  bubble.appendChild(overlay);
  chartStartUI.append(bubble);
  return progressText;


}
socket.on("recieve-media", (data, chat) => {

  if (chat === "chat") {




    messageUpdate(data.message);
    userConnectionUI(data.message.sender.id);
  }
  if (chat === "group") {
    if (!groupMessages[data.message.groupID]) {
      groupMessages[data.message.groupID] = {
        name: data.message.group.name,
        message: []
      }
    }
    let time = formatTimeForIndia(data.message.createdAt);

    addGroupMessage({ ...data.message, time: time });
    addGroupInList(data.message.group);

  }

});
async function download(btn) {
  btn.textContent = "0%";
  let id = btn.id;


  dowmloadWithProgress(btn, id);
}
async function dowmloadWithProgress(btn, id) {
  let parent = btn.parentNode;
  let content = parent.getElementsByClassName("content")[0];

  let metadata = await getFileMeta(id);
  let blobUrl;
  let res = await axios.get(id, {
    responseType: "blob",
    onDownloadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );

      btn.textContent = `${percent}%`;
      if (percent === 100) {
        btn.remove();
      }
    },
  });
  blobUrl = URL.createObjectURL(res.data);
  if (metadata.type == "video") {
    content.remove();

    content = document.createElement("video");
    content.className = "chat-video";
    content.controls = true;
    if (parent.firstElementChild) {
      parent.firstElementChild.after(content);
    } else {
      parent.appendChild(content); // if no child exists
    }
    content.src = blobUrl;

  }
  else if (metadata.type == "audio") {
    content.controls = true;
    content.src = blobUrl;
  }
  else if (metadata.type === "image") {
    content.src = blobUrl;
  }
  else {
    content.href = blobUrl;
  }


  content.classList.remove("blurred");



}







