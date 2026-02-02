import User from "../models/user.js";
import { Server } from "socket.io";
import { socketAuth } from "./middleware.js";
import Message from "../models/message.js";
import { searchUser, userOnline, searchMember } from "./socketHandlers/user.js";
import { createGroup, addMember } from "./socketHandlers/group.js";
import { chat } from "./socketHandlers/chat.js";
var connection = {};
const connectToServer = async (server, app) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "production" ? false : ['http://localhost:3000', 'http://localhost:5500']
        }
    });

    socketAuth(io);

    io.on("connection", async (socket) => {

        try {
            connection[socket.user.id] = socket.id;

            userOnline(socket,connection);
            chat(io, socket, connection);
            //     newMessage(socket);
            createGroup(socket);

            searchUser(socket);
            searchMember(socket);

            addMember(socket,connection);
            socket.on("disconnect", async () => {
                delete connection[socket.user.id];

                await User.update(
                    { lastSeen: new Date(), isOnline: false },
                    { where: { id: socket.user.id } }
                );
                let users = await Message.findAll({ where: { senderID: socket.user.id }, attributes: ["recieverID"] });
                users = JSON.parse(JSON.stringify(users));
                users = [...new Set(users.map(u => u.recieverID))];
                users.forEach((u) => {
                    if (connection[u]) {
                        socket.to(connection[u]).emit("user-offline", socket.user.id, new Date());
                    }
                });

            });

        } catch (error) {
            console.log(error);
        }


    });
    app.use((req, res, next) => {
        req.io = io;
        req.connection = connection;
       
        next();
    })



}
export default connectToServer;