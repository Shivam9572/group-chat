import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const authenticate = async(req, res, next) => {
    
    try {
        const authHeader = req.headers.Authentication || req.headers.authorization;
        if (!authHeader) {
            next(new AppError("unauthorize",401));
            return;
        }
       
          jwt.verify(req.headers.authorization,process.env.JWT_SECRET, async function(err,result){
               if(err){
                   res.send(err);
                   return;
               }
               
               req.userId=result.userId;

               req.name=result.name;
               let resultUser=await User.findOne({where:{id:result.userId}});
               if(!resultUser){
                     next(new AppError("unauthorized",401));
               }
              
               next()
           });
    } catch (error) {
        console.log("unauthorize");
        next(new AppError("unauthorized",401));
    }

}
export default authenticate;