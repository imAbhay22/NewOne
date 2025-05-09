// middleware/upload.js
import multer from "multer";
import fs from "fs";

// Create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// 1️⃣ — FILE FILTERS
const imageFileFilter = (_req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  cb(isImage ? null : new Error("Only image files are allowed"), isImage);
};

// 2️⃣ — CLASSIFY ARTWORK (single image upload to /uploads)
const classifyStorage = multer.diskStorage({
  destination: (_, _f, cb) => cb(null, ensureDir("uploads")),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
export const uploadClassify = multer({
  storage: classifyStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// 4️⃣ — PROFILE PICTURE UPLOAD
const profileStorage = multer.diskStorage({
  destination: (_, _f, cb) => cb(null, ensureDir("uploads/profile-pics")),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
export const uploadProfilePic = multer({
  storage: profileStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: imageFileFilter, // now supports all image types
});
