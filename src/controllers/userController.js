import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";
import {Op} from "sequelize";
import sequelize from "../utils/DB.js";



export const createUser = async (req, res, next) => {
    const t=sequelize.transaction();
    try {

         
        const { name, email, phone, password } = req.body;
        

        if (!name || !password || (!email && !phone)) {
            return next(new AppError("Name or Email or phone and password required", 400));
        }
        const existingUser = await User.findOne({ where: {[Op.or]: [{ email:email }, { phone :phone}] } });
        if (existingUser) {
            return next(new AppError("User with this email or phone already exists", 409));
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        
        res.status(201).json({ message: "User created successfully", success:true });
        




    } catch (error) {
       
        next(error);
    }

};

export const loginUser = async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;
        if ((!email && !phone) || !password) {
            return next(new AppError("Email or phone and password required", 400));
        }
        let user = await User.findOne({ where: {[Op.and]: [{ email:email }, { phone :phone}] } });
        if (!user) {
            return next(new AppError("User not found", 404));
        }
        user=user.toJSON();
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(new AppError("Invalid password", 401));
        }
        
        let token = jwt.sign(
            { userId: user.id,name:user.name },
            process.env.JWT_SECRET);
        res.status(200).json({ token, success:true ,name:user.name,email:user.email,phone:user.phone});
    } catch (error) {
        next(error);
    }
};



