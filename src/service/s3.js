import s3Client from "../utils/awsS3.js";
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; 
import fs from "fs";
import path from "path";
import {TEMP_DIR} from "../utils/temp.js";

export async function getUploadUrl(key,fileType){
   

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
   const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });
  return uploadUrl;
}


export async function downloadFromS3(key) {
  const localPath = path.join(TEMP_DIR, path.basename(key));

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  });

  const data = await s3Client.send(command);

  const writeStream = fs.createWriteStream(localPath);

  await new Promise((resolve, reject) => {
    data.Body.pipe(writeStream)
      .on("finish", resolve)
      .on("error", reject);
  });

  return localPath; // ✅ THIS is localPath
}



export async function uploadThumbToS3(localThumbPath, thumbKey) {
  const fileBuffer = fs.createReadStream(localThumbPath);

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: thumbKey,
    Body: fileBuffer,
    ContentType: "image/jpeg"
  }));
    fileBuffer.destroy();
}
export async function getObjectUrl(key,fileType){
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
   const getUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });
  return getUrl;
}

