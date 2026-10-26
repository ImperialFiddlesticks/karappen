import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import multer from "multer";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });

const maxImageBytes = 5 * 1024 * 1024;
const extensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, callback) =>
      callback(null, `${randomUUID()}${extensions[file.mimetype]}`),
  }),
  limits: { fileSize: maxImageBytes },
  fileFilter: (req, file, callback) => {
    if (extensions[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new Error("Bilden måste vara JPEG, PNG eller WebP"));
    }
  },
});

export function handleImageUpload(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Bilden får vara högst 5 MB" });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Välj en bild att ladda upp" });
    }
    next();
  });
}

export async function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const fileName = path.basename(imageUrl);
  await unlink(path.join(UPLOAD_DIR, fileName)).catch(() => {});
}
