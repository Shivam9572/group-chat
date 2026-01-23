import { boardcastMessage } from "./group.js";
import { personalChat } from "./personalChat.js";

export const chat=(io,socket,connection)=>{
     socket.on("send-message",(text,id,chat)=>{
        if(chat==="chat"){
            personalChat(io,socket,connection,id,text);
        }
        if(chat==="group"){
            boardcastMessage(io,socket,id,text);
        }
     })
}