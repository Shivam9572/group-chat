import Message from "../models/message.js";
import AppError from "../utils/AppError.js";

export const saveMessage = async (ownerName,userId, content) => {


   try {
      
      
    
      
      await Message.create({ userId, content,ownerName });
      return true;

   } catch (error) {
      console.log(error);
      return false;
   }
};  

export const getMessages = async (req, res, next) => {
   try {
      let messages = await Message.findAll({ order: [['createdAt', 'ASC']],attributes:['content','createdAt','userId','ownerName'] });
      messages=JSON.stringify(messages);
      messages=JSON.parse(messages);
     for(let msg of messages){
            if(msg.userId===req.userId){
                  msg.isOwnMessage=true;
            }
         
     }
     
      res.status(200).json({ messages, success: true });
   } catch (error) {
      console.log(error);
      next(new AppError("Failed to retrieve messages", 500));
   }

}