import fs from "fs/promises";
import path from "path";



export const TEMP_DIR = path.join(process.cwd(), "tmp");


async function ensureTmpDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

// run once on import
await ensureTmpDir();

export async function cleanTmpFolder() {
  
    
    try {
      
    const files = await fs.readdir(TEMP_DIR);
   
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      
      try {
        await fs.unlink(filePath);
        
      } catch (err) {
        // Windows safe
        if (err.code === "EPERM" || err.code === "EBUSY") {
          await new Promise(r => setTimeout(r, 300));
          await fs.unlink(filePath).catch(() => {});
        }
      }
    }

    
  } catch (err) {
    console.error("❌ tmp cleanup failed:", err);
  }
   
}
