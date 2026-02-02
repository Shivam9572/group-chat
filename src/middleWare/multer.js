import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuid } from "uuid";
import s3 from "../utils/awsS3.js";

const upload = multer({
  storage: multerS3({
    s3:s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = file.originalname.split(".").pop();
      cb(null, `chat/${uuid()}.${ext}`);
    }
  })
});

 export const uploads = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export default upload;


