import Group from "../../models/group.js";
import Message from "../../models/message.js";
import User from "../../models/user.js";
import {Op} from "sequelize";
import GroupMember from "../../models/groupMember.js";

export const searchUser = (socket) => {
    socket.on("search-user", async (number) => {
        try {
            const users = await User.findAll({
            where: {
                phone:{
                    [Op.like]:`%${number}%`
                }
            },
            attributes:["id","name","phone","email",],
            order: [["createdAt", "DESC"]],
            limit: 10
        });
        socket.emit("user-search",users);
        } catch (error) {
            console.log(error.message);
        }
    })
}

export const searchMember = (socket) => {
    socket.on("search-member", async (number) => {
        try {
            const users = await User.findAll({
            where: {
                phone:{
                    [Op.like]:`%${number}%`
                }
            },
            attributes:["id","name","phone","email",],
            order: [["createdAt", "DESC"]],
            limit: 10
        });
        socket.emit("search-member",users);
        } catch (error) {
            console.log(error.message);
        }
    })
}

export const userOnline=async(socket,connection)=>{
    
         try {
          let groups= await GroupMember.findAll({where:{userID:socket.user.id},include:[{
            model:Group,
            as:"group"
          }]});
          groups=JSON.parse(JSON.stringify(groups));
          groups=groups.map(g=>g.group.id);
          groups.forEach((g)=>{
            socket.join(g);
          });
          await User.update({isOnline:true},{where:{id:socket.user.id}});
          let users=await Message.findAll({where:{senderID:socket.user.id},attributes:["recieverID"]});
            users=JSON.parse(JSON.stringify(users));
            users=[...new Set(users.map(u=>u.recieverID))];
            users.forEach((u)=>{
                if(connection[u]){
                    socket.to(connection[u]).emit("user-online",socket.user.id);
                }
            });

                
          
     } catch (error) {
        console.log(error);
     }
   
}
