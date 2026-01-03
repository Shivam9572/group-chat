import express from 'express';
import { saveMessage,getMessages } from '../controllers/messageController.js';
import  authentication  from '../middleWare/authentication.js';
const router = express.Router();

router.post('/save',authentication,saveMessage);
router.get('/',authentication,getMessages);

export default router;