

export const newMessage=(socket)=>{
     socket.on("chat-message", (message) => {
            try {
                socket.broadcast.emit("chat-message", {
                    content: message,
                    name: socket.user.name});
               

            } catch (error) {
                console.log("Error in saving or broadcasting message:", error);
            }
        });
}