import Message from "../models/message.js";
import AppError from "../utils/AppError.js";
import GroupMember from "../models/groupMember.js";
import User from "../models/user.js";
import Group from "../models/group.js";
import GroupMessage from "../models/groupMessage.js";
import { Op } from "sequelize";
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from "../utils/awsS3.js";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';




export const recoverMessage = async (req, res) => {

   try {
      let messages = await Message.findAll({
         where: {
            [Op.or]: [
               { senderID: req.userId },
               { recieverID: req.userId },
            ]
         },
         include: [{
            model: User,
            as: "sender"
         },
         {
            model: User,
            as: "reciever",
            required: false
         }]
         ,
         order: [["createdAt", "ASC"]]
      });

      res.status(200).json({ messages: messages });
   } catch (error) {
      console.log(error);
   }


}

export const recoverGroupMessage = async (req, res) => {
   try {
      let groups = await GroupMember.findAll({
         where: { userID: req.userId }, include: [{
            model: Group,
            as: "group"
         }]
      });
      groups = JSON.parse(JSON.stringify(groups));

      let groupsId = groups.map((g) => g.groupID);
      let messages = await GroupMessage.findAll({
         where: { groupID: { [Op.in]: groupsId } },
         include: [{
            model: User,
            as: "senderInfo"
         },
         {
            model: Group,
            as: "groupInfo"
         }], order: [["createdAt", "ASC"]]
      });
      messages = JSON.parse(JSON.stringify(messages));
      res.status(200).json({ groups: groups, messages: messages });
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
   }
}


export const uploadMedia = async (req, res) => {
   let id = (req.body.group) ? req.body.group : req.body.chat;
   
   let type=getType(req.file.mimetype);
   
   if(req.body.chat){
      
      personalChatStore(type,id,req.userId,req.io,req.connection,req.file.location);
   }
   if(req.body.group){
      groupChatStore(type,req.file.location,req.userId,id,req.io);
   }

   res.status(200).json({
      url: req.file.location,  // S3 URL
      type: req.file.mimetype
   });
}
async function personalChatStore(type,id,userId,io,connection,location) {
   
   try {
      let reciever = await User.findOne({ where: { id: id } });
      if (!reciever) {
         return;
      }
      reciever = reciever.toJSON();
     

      let sender = await User.findOne({ where: { id: userId } });
      sender = sender.toJSON();
      
      if (connection[reciever.id]) {
         let message = await Message.create({type:type,mediaUrl:location, senderID: sender.id, recieverID: reciever.id, content: "", ownerName: sender.name, status: "delivered" });
         message = message.toJSON();
         message.reciever = reciever;
         message.sender = sender;
        io.to(connection[sender.id]).emit("new-message", message, "chat");
         io.to(connection[reciever.id]).emit("new-message", message, "chat");
      } else {
         let message = await Message.create({ type:type,mediaUrl:location,senderID: sender.id, recieverID: reciever.id, content: "", ownerName: sender.name });
         message = message.toJSON();
         message.reciever = reciever;
         message.sender = sender;
         io.to(connection[sender.id]).emit("new-message", message, "chat");
      }
     
   } catch (error) {
      console.log(error);
   }
}

async function groupChatStore(type,location,userId,roomId,io){
    try {
            let message=await GroupMessage.create({type:type,mediaUrl:location,content:"",senderID:userId,groupID:roomId});
            message=message.toJSON();
            
            let sendmessage=await GroupMessage.findOne({where:{id:userId},include:[{
                model:User,
                as:"senderInfo"
            },{
                model:Group,
                as:"groupInfo"
            }]});
            sendmessage=JSON.parse(JSON.stringify(sendmessage));
           
            
            io.to(roomId).emit("new-message",sendmessage,"group");
        } catch (error) {
            console.log(error);
        }
}
function getType(mimetype) {
   const mime = mimetype;

   let type = "file";

   if (mime.startsWith("image/")) type = "image";
   else if (mime.startsWith("video/")) type = "video";
   else if (mime.startsWith("audio/")) type = "audio";
    else if (mime.startsWith("application/")) type = "document";
    return type;


}
