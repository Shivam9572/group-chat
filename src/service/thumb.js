import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobe from "ffprobe-static";

export const createImageThumbnail=async(input,output)=>{
    await sharp(input).resize(300).jpeg({quality:60}).toFile(output);
}

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobe.path);
export function createVideoThumbnail(videoPath, output) {
 try {
   return new Promise(resolve => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        filename: output,
        size: "320x?"
      })
      .on("end", resolve);
  });
 } catch (error) {
  console.log(error);
 }
}
export function getImageThumbPath(originalPath) {
  return originalPath.replace(/\.(jpg|jpeg|png|webp)$/i, "-thumb.jpg");
}

export function getVideoThumbPath(videoPath) {
  return videoPath.replace(/\.(mp4|mov|mkv)$/i, "-thumb.jpg");
}



