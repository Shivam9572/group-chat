import Message from "../models/message.js";
import AppError from "../utils/AppError.js";

export const saveMessage = async (req, res, next) => {


   try {
      let userId = req.userId;
      const { content } = req.body;
   
      
      Message.create({ userId, content });
      res.status(201).json({ message: "Message saved successfully", success: true });

   } catch (error) {
      console.log(error);
      next(new AppError("Failed to save message", 500));
   }
};  

export const getMessages = async (req, res, next) => {
   try {
      const messages = await Message.findAll({ order: [['createdAt', 'ASC']],where:{userId:req.userId},attributes:['content','createdAt','userId'] });
      res.status(200).json({ messages, success: true });
   } catch (error) {
      console.log(error);
      next(new AppError("Failed to retrieve messages", 500));
   }

}