import express from 'express';
import { recoverMessage ,recoverGroupMessage,uploadMedia,getMediaUrl} from '../controllers/messageController.js';
import  authentication  from '../middleWare/authentication.js';
import upload from "../middleWare/multer.js";
const router = express.Router();

// router.post('/save',authentication,saveMessage);
// router.get('/',authentication,getMessages);
router.post('/recover-message',authentication,recoverMessage);
router.post('/recover-group-message',authentication,recoverGroupMessage);

router.post("/upload-url",authentication,uploadMedia);
router.post("/get-url",authentication,getMediaUrl);

export default router;