import { boardcastMessage } from "./group.js";
import { personalChat } from "./personalChat.js";
import Media from "../../models/media.js";
import Message from "../../models/message.js";
import GroupMessage from "../../models/groupMessage.js";
import Group from "../../models/group.js";
import { createImageThumbnail, getImageThumbPath, getVideoThumbPath, createVideoThumbnail } from "../../service/thumb.js";
import { cleanTmpFolder } from "../../utils/temp.js";
import { downloadFromS3, uploadThumbToS3, getObjectUrl } from "../../service/s3.js";
import sequelize from "../../utils/DB.js";
import getSentencePrediction from "../../service/geimini.js";
export const chat = (io, socket, connection) => {
    socket.on("send-message", (text, id, chat) => {
        if (chat === "chat") {
            personalChat(io, socket, connection, id, text);
        }
        if (chat === "group") {
            boardcastMessage(io, socket, id, text);
        }
    });
    socket.on("send-media", async (data, chat, id, callBack) => {
         let t = await sequelize.transaction();
        try {
            
            let {
                mediaType,
                mediaKey,
            } = data;
            let localPath;
            let thumbKey;
            let thumbPath;
            if ((mediaType === "video") || (mediaType === "image")) {
                localPath = await downloadFromS3(mediaKey);
                thumbKey = mediaKey.replace("media/", "thumb/");
            }


            // 2️⃣ Generate thumbnail
            if (mediaType === "image") {
                thumbPath = await getImageThumbPath(localPath);
                await createImageThumbnail(localPath, thumbPath);
            }

            if (mediaType === "video") {
                thumbPath =await getVideoThumbPath(localPath);
                await createVideoThumbnail(localPath, thumbPath);
            }

            // 3️⃣ Upload thumbnail
            let attributes = { mediaType: data.mediaType, mediaKey: data.mediaKey };

            if ((mediaType === "video") || (mediaType === "image")) {
                await uploadThumbToS3(thumbPath, thumbKey);
                attributes = { ...attributes, thumbKey: thumbKey }
            }



            // 4️⃣ Cleanup

            if (chat === "chat") {

                let status = (connection[id]) ? "delivered" : "sent";
                let media = await Media.create(attributes, { transaction: t });
                media = media.toJSON();
                let message = await Message.create({ mediaID: media.id, type: data.mediaType, content: "", ownerName: socket.user.name, status: status, isDeletedForEveryone: false, senderID: socket.user.id, recieverID: id }, { transaction: t });
                message = message.toJSON();

                message.sender = socket.user;
                message.media = media;
                if (connection[id]) {
                    callBack({ delivered: true, time: message.createdAt, id: message.id });

                    io.to(connection[id]).emit("recieve-media", {
                        message,
                    }, "chat");
                } else {
                    callBack({ delivered: false, time: message.createdAt, id: message.id });
                }


            }
            if (chat === "group") {
                let group = await Group.findOne({ where: { id: id } });
                group = group.toJSON();
                let media = await Media.create({ mediaType: data.mediaType, mediaKey: data.mediaKey, thumbKey: thumbKey },{transaction:t});
                media = media.toJSON();
                let message = await GroupMessage.create({ mediaID: media.id, type: data.mediaType, content: "", ownerName: socket.user.name, status: "sent", isDeletedForEveryone: false, groupID: id, senderID: socket.user.id },{transaction:t});
                message = message.toJSON();
                message.group = group;
                message.sender = socket.user;
                message.media = media;
                callBack({ delivered: false, time: message.createdAt });
                socket.to(id).emit("recieve-media", {
                    message: message,

                }, "group");


            }
            await t.commit();
            
        } catch (error) {
            await t.rollback();
            console.log(error);
        }
       setTimeout(() => {
            cleanTmpFolder();
        } , 3000);
    });
     socket.on("typing_input", async (data) => {
      try {
      const { lastMessage, currentText } = data;
      

      // Avoid AI call for very small input
      if (!currentText) {
        return socket.emit("smart_replies", []);
      }

      const replies = await getSentencePrediction({lastMessage,currentText});

      socket.emit("smart_replies", replies || []);

    } catch (err) {
      console.error(err);
      socket.emit("smart_replies", []);
    }
  });
}