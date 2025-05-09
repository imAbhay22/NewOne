// routes/styleTransferRoutes.js
import express from "express";
import multer from "multer";
import { PythonShell } from "python-shell";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
});

router.post(
  "/",
  upload.fields([
    { name: "content", maxCount: 1 },
    { name: "style", maxCount: 1 },
  ]),
  async (req, res) => {
    // Prepare paths
    const contentPath = join(tmpdir(), `content-${Date.now()}.png`);
    const stylePath = join(tmpdir(), `style-${Date.now()}.png`);
    const outputPath = join(tmpdir(), `output-${Date.now()}.png`);

    // ← define messages & flag outside try
    const messages = [];
    let success = false;

    const cleanup = () => {
      [contentPath, stylePath, outputPath].forEach((p) => {
        if (existsSync(p)) unlinkSync(p);
      });
    };

    try {
      // Validate uploads
      if (!req.files?.content?.[0] || !req.files?.style?.[0]) {
        throw new Error("Both content and style images are required");
      }

      // Write buffers
      writeFileSync(contentPath, req.files.content[0].buffer);
      writeFileSync(stylePath, req.files.style[0].buffer);

      // Run Python
      await new Promise((resolve, reject) => {
        const pyshell = new PythonShell(
          join(__dirname, "../style_transfer.py"),
          {
            mode: "text",
            pythonOptions: ["-u"],
            args: [contentPath, stylePath, outputPath],
            timeout: 120000,
          }
        );

        pyshell.on("message", (msg) => {
          console.log("PYTHON:", msg);
          messages.push(msg);
          if (msg === "SUCCESS") {
            success = true;
            resolve();
          }
        });
        pyshell.on("stderr", (err) => console.error("PYTHON ERR:", err));
        pyshell.on("error", (err) => reject(err));
        pyshell.on("close", () => {
          if (!success)
            reject(new Error("Processing did not complete successfully"));
        });
      });

      // Verify and send
      if (!existsSync(outputPath)) {
        throw new Error("Output file missing");
      }
      const buf = readFileSync(outputPath);
      if (buf.length === 0) throw new Error("Empty output image");

      res.type("png").send(buf);
    } catch (error) {
      console.error("Style transfer error:", error);
      res.status(500).json({
        error: error.message || "Style transfer failed",
        logs: messages,
      });
    } finally {
      // Immediate cleanup on failure, defer on success
      if (!success) cleanup();
      else setTimeout(cleanup, 2 * 60 * 1000);
    }
  }
);

export default router;
