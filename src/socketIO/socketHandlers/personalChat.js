import User from "../../models/user.js";
import Message from "../../models/message.js";
export const personalChat=async(io,socket,connection,id,content)=>{ 
       try {
           let reciever=await User.findOne({where:{id:id}});
           if(!reciever){
             return;
           }
           reciever=reciever.toJSON();
           
           
           if(connection[reciever.id]){
            let message=await Message.create({senderID:socket.user.id,recieverID:reciever.id,content:content,ownerName:socket.user.name,status:"delivered"});
              message=message.toJSON();
              message.reciever=reciever;
            message.sender=socket.user;
             socket.emit("new-message",message,"chat");
              io.to(connection[reciever.id]).emit("new-message",message,"chat");
           }else{
            let message=await Message.create({senderID:socket.user.id,recieverID:reciever.id,content:content,ownerName:socket.user.name});
            message=message.toJSON();
            message.reciever=reciever;
            message.sender=socket.user;
             socket.emit("new-message",message,"chat");
           }
          
       } catch (error) {
          console.log(error);
       }
    

}