import Message from "../models/message.js";
import AppError from "../utils/AppError.js";
import GroupMember from "../models/groupMember.js";
import User from "../models/user.js";
import Group from "../models/group.js";
import GroupMessage from "../models/groupMessage.js";
import { Op } from "sequelize";
import { v4 as uuid } from "uuid";
import Media from "../models/media.js";
import {getUploadUrl,getObjectUrl} from "../service/s3.js";
import { Json } from "sequelize/lib/utils";




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
         },{
            model:Media,
           as:"media"
         }]
         ,
         order: [["createdAt", "ASC"]]
      });
      
       messages=JSON.parse(JSON.stringify(messages));
      
       
      res.status(200).json({ messages: messages });
      messages=messages.map(async(m)=>{
         if((m.recieverID===req.userId)&&(m.status==="sent")){
            await Message.update({status:"delivered"},{where:{id:m.id}});
         }

      });

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

      

      // Build per-group conditions: only messages created after the user joined each group
      const conditions = groups
        .filter((g) => g.groupID)
        .map((g) => ({ groupID: g.groupID, createdAt: { [Op.gt]: new Date(g.createdAt) } }));

      let messages = [];
      if (conditions.length) {
        messages = await GroupMessage.findAll({
          where: { [Op.or]: conditions },
          include: [
            {
              model: User,
              as: "senderInfo",
            },
            {
              model: Group,
              as: "groupInfo",
            },
            { model: Media, as: "groupMedia" },
          ],
          order: [["createdAt", "ASC"]],
        });
      } else {
        messages = [];
      }
      messages = JSON.parse(JSON.stringify(messages));
      messages=messages.map((m)=>{
         if(m.senderInfo){
          
            m={...m,sender:m.senderInfo};
            delete m.senderInfo;
         }
         if(m.groupInfo){
            m={...m,group:m.groupInfo};
            delete m.groupInfo;
         }
         if(m.groupMedia){
            m={...m,media:m.groupMedia}
            delete m.groupMedia;
         }
         return m;
   })
     
      res.status(200).json({ groups: groups, messages: messages });
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
   }
}


export const uploadMedia = async (req, res) => {
  const { fileName, fileType } = req.body;

  const ext = fileName.split(".").pop();
  const key = `chat-media/${uuid()}.${ext}`;
   let uploadUrl=await getUploadUrl(key,fileType);
   
res.status(200).json({uploadUrl,key});
}
export const getMediaUrl=async(req,res)=>{
   let {id}=req.body;
   try {
      let message=await Message.findOne({where:{id:id},include:[{
         model:Media,
         as:"media",
      },{
         model:User,
         as:sender
      }]});
      message=message.toJSON();
      

   } catch (error) {
      console.log(error);
      res.status(500).json({message:"something went wrong"});
   }
}