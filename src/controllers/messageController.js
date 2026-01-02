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