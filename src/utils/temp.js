import { error } from "console";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TEMP_DIR = path.join(__dirname, "..","..", "tmp");


if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function cleanupFiles(...paths) {
  for (const filePath of paths) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.log(error);
    }
  }
}
