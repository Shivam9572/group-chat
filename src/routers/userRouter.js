import express from "express";
import { fileURLToPath } from "url";
import path from 'path';
import { loginUser, createUser } from "../controllers/userController.js";
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/login", loginUser);
router.post("/signup", createUser);
router.get("/login", (req, res)=>{
     res.sendFile(path.join(__dirname,'..','views','login.html'));
});
router.get("/signup", (req, res)=>{
    res.sendFile(path.join(__dirname,'..','views',"signup.html"));
});
export default router;

