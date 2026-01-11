
import { Server } from "socket.io";
import { socketAuth } from "./middleware.js";
import { newMessage } from "./socketHandlers/chat.js";

const connectToServer = async(server) => {
    const io = new Server( server ,{
        cors:{
            origin:process.env.NODE_ENV==="production"?false:['http://localhost:3000','http://localhost:5500']
        }
    });
    socketAuth(io);
   
    io.on("connection", async(socket) => {
           
         newMessage(socket);

    });


}
export default connectToServer;