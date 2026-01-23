import express from 'express';
import { recoverMessage ,recoverGroupMessage,uploadMedia} from '../controllers/messageController.js';
import  authentication  from '../middleWare/authentication.js';
import upload from "../middleWare/multer.js";
const router = express.Router();

// router.post('/save',authentication,saveMessage);
// router.get('/',authentication,getMessages);
router.post('/recover-message',authentication,recoverMessage);
router.post('/recover-group-message',authentication,recoverGroupMessage);
// router.post('/upload-request',authentication,presingrnedUrl);
router.post("/upload",authentication,upload.single("file"),uploadMedia);
export default router;