import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from "url";

import express from 'express';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import db from "./utils/DB.js";
import connectToWebSocket from  "./socketIO/connectToServer.js";
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routers/userRouter.js';
import messageRoutes from './routers/messageRouter.js';



const app = express();


app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, "src", "pages"));
app.use(express.static(path.join(__dirname, 'public')));


const PORT = process.env.PORT||3000;
const server = http.createServer(app);
connectToWebSocket(server);

app.use('/user', userRoutes);
app.use('/api/message', messageRoutes);
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname,'.', 'views',"chat.html"));
});



app.use(errorHandler);
db.sync({force:false}).then(()=>{
    
    server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err)=>{
    console.log(err.message);
});


