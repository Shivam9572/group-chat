import User from "../models/user.js";
import jwt from "jsonwebtoken";


export const socketAuth=(io)=>{
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
            socket.user=user.toJSON();
            next();
        } catch (error) {
            return next(new Error("Authentication error"));
        }

            
    });
}