
import jwt from "jsonwebtoken";
import { saveMessage } from "./messageController.js";
import { Server } from "socket.io";
import User from "../models/user.js";




let clients = [];
const connectToServer = async(server) => {
    const io = new Server( server );
    io.use(async(socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded == null) {
                return next(new Error("Authentication error"));
            }
            let user=await User.findOne({where:{id:decoded.userId}});
            if(!user){
                return next(new Error("Authentication error"));
            }
            socket.user=user;
            next();
        } catch (error) {
            return next(new Error("Authentication error"));
        }

            
    });
    io.on("connection", async(socket) => {
           
    


        socket.on("chat-message", (message) => {
            try {
                socket.broadcast.emit("chat-message", {
                    content: message,
                    name: socket.user.name});
               

            } catch (error) {
                console.log("Error in saving or broadcasting message:", error);
            }
        });

        // io.on("close", () => {
        //     clients = clients.filter(s => s !== ws);
        // });

    });


}
export default connectToServer;