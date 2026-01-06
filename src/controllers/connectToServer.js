import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { saveMessage } from "./messageController.js";
import { Server } from "socket.io";




let clients = [];
const connectToServer = (server) => {
    const io = new Server( server );
    io.on("connection", async(socket) => {
            let token = socket.handshake.query.token;
        if (!token) {
            ws.close();
            return;
        }
        // clients.push(ws);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded==null){
            socket.close();
        }
     
        socket.userId = decoded.userId;
        socket.name=decoded.name;
    


        socket.on("chat-message", (message) => {
            try {
                io.emit("chat-message", {
                    content: message,
                    name: socket.name})

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