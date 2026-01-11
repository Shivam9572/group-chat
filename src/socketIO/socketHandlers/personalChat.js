
export const personalChat=(socket,io)=>{
    socket.on("join-room",(roomName)=>{
        socket.join(roomName);
    });
    socket.on("new-message",(message,roomName)=>{
        
        socket.to(roomName).emit("new-message",socket.user.name,message);
    });

}