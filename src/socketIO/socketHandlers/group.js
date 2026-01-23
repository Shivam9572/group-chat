import Group from "../../models/group.js";
import GroupMember from "../../models/groupMember.js";
import GroupMessage from "../../models/groupMessage.js";
import User from "../../models/user.js";

export const createGroup=(socket)=>{
    socket.on("create-group",async(name)=>{
        try {
            let group=await Group.create({name:name,createdBy:socket.user.id});
            group=group.toJSON();
            
            await GroupMember.create({role:"admin",groupID:group.id,userID:socket.user.id});
            socket.emit("create-group-ack",group);

        } catch (error) {
            console.log(error);
        }
    })
}
export const addMember=(socket)=>{
    socket.on("add-member",async(groupId,userId)=>{
        try {
            let user=await GroupMember.findOne({where:{groupID:groupId,userID:userId}});
        if(user){
            user=user.toJSON();
            
            socket.emit("already-exit");
            return;
        }
        let groupMember=await GroupMember.create({groupID:groupId,userID:userId,role:"member"});
           socket.join(groupId);
            
            socket.emit("add-member",userId,groupId);
        
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
            sendmessage=JSON.parse(JSON.stringify(sendmessage));
           
            
            io.to(roomId).emit("new-message",sendmessage,"group");
        } catch (error) {
            console.log(error);
        }
 
}
