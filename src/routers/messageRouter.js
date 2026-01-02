import express from 'express';
import { saveMessage } from '../controllers/messageController.js';
import  authentication  from '../middleWare/authentication.js';
const router = express.Router();

router.post('/save',authentication,saveMessage);

export default router;