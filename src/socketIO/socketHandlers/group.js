import Group from "../../models/group.js";
import GroupMember from "../../models/groupMember.js";
import GroupMessage from "../../models/groupMessage.js";
import User from "../../models/user.js";
import sequelize from "../../utils/DB.js";

export const createGroup=(socket)=>{
    socket.on("create-group",async(name)=>{
        try {
            let t=await sequelize.transaction();
            let group=await Group.create({name:name,createdBy:socket.user.id},{transaction:t});
            group=group.toJSON();
            
            await GroupMember.create({role:"admin",groupID:group.id,userID:socket.user.id},{transaction:t});
            socket.emit("create-group-ack",group);
            await t.commit();

        } catch (error) {
            await t.rollback();
            console.log(error);
        }
    })
}
export const addMember=(socket,connection)=>{
    socket.on("add-member",async(groupId,userId,callBack)=>{
        try {
            let user=await GroupMember.findOne({where:{groupID:groupId,userID:userId}});
        if(user){
            user=user.toJSON();
            callBack("Allready exits");
            
            return;
        }
        let groupMember=await GroupMember.create({groupID:groupId,userID:userId,role:"member"});
            let group=await Group.findOne({where:{id:groupId}});
            group=group.toJSON();
           socket.join(groupId);
            callBack("Add Member");
            socket.to(connection[userId]).emit("add-member",group);
        
        } catch (error) {
            console.log(error);
        } 
    })
}
export const boardcastMessage=async(io,socket,roomId,text)=>{
    
        try {
            let message=await GroupMessage.create({content:text,senderID:socket.user.id,groupID:roomId});
            message=message.toJSON();
            
            let sendmessage=await GroupMessage.findOne({where:{id:message.id},include:[{
                model:User,
                as:"senderInfo"
            },{
                model:Group,
                as:"groupInfo"
            }]});
            sendmessage=sendmessage.toJSON();
             sendmessage.sender=sendmessage.senderInfo;
             sendmessage.group=sendmessage.groupInfo;
             delete sendmessage.senderInfo;
             delete sendmessage.groupInfo;
            
            io.to(roomId).emit("new-message",sendmessage,"group");
        } catch (error) {
            console.log(error);
        }
 
}
