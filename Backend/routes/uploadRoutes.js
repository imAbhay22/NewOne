import express from "express";
import path from "path";
import Art from "../models/artModel.js";
import { classifyImage, moveFile } from "../utils/fileUtils.js";

// ← pull in both upload middlewares
import { uploadClassify } from "../middleware/upload.js";

const router = express.Router();

// Parse categories/tags JSON
const parseArtData = (req, res, next) => {
  try {
    if (typeof req.body.categories === "string") {
      req.body.categories = JSON.parse(req.body.categories);
    } else if (!req.body.categories) {
      req.body.categories = [];
    }

    if (typeof req.body.tags === "string") {
      req.body.tags = JSON.parse(req.body.tags);
    } else if (!req.body.tags) {
      req.body.tags = [];
    }

    next();
  } catch (error) {
    console.error("JSON parsing error:", error);
    return res.status(400).json({ error: "Invalid JSON for categories/tags" });
  }
};

// — classify route (image + auto‑categorization) —
router.post(
  "/classify",
  uploadClassify.single("artwork"),
  parseArtData,
  async (req, res) => {
    try {
      const {
        title,
        artist = "Unknown Artist",
        categories = [],
        description = "",
        price = 0,
        tags = [],
        userId,
      } = req.body;

      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      if (!title) return res.status(400).json({ error: "Title is required" });
      if (!userId) return res.status(400).json({ error: "userId is required" });
      if (!categories.length)
        return res
          .status(400)
          .json({ error: "At least one category is required" });

      let finalCategories = [...categories];
      let targetCategory = categories[0];

      try {
        if (categories.includes("Auto")) {
          const autoCategory = await classifyImage(req.file.path);
          if (autoCategory) {
            finalCategories = categories
              .filter((c) => c !== "Auto")
              .concat(autoCategory);
            targetCategory = autoCategory;
          }
        }
      } catch (classifyError) {
        console.error("Classification error:", classifyError);
        // If auto-classification fails, continue with manual categories
        finalCategories = categories.filter((c) => c !== "Auto");
        if (finalCategories.length > 0) {
          targetCategory = finalCategories[0];
        } else {
          targetCategory = "Other"; // Fallback category
          finalCategories.push("Other");
        }
      }

      // Ensure there's at least one valid category
      if (finalCategories.length === 0) {
        finalCategories = ["Other"];
        targetCategory = "Other";
      }

      let movedPath;
      try {
        movedPath = moveFile(req.file.path, targetCategory);
      } catch (moveError) {
        console.error("File move error:", moveError);
        // If moving fails, use the original path
        movedPath = req.file.path;
      }

      const relativePath = path
        .relative(process.cwd(), movedPath)
        .replace(/\\/g, "/");

      const newArt = new Art({
        title,
        artist,
        categories: finalCategories,
        description,
        price: parseFloat(price) || 0, // Ensure price is a number
        tags,
        filePath: relativePath,
        userId,
      });

      await newArt.save();

      return res.status(201).json({
        message: `Artwork uploaded successfully${
          categories.includes("Auto")
            ? ` and categorized as "${targetCategory}"`
            : ""
        }`,
        artwork: {
          id: newArt._id,
          title,
          artist,
          filePath: relativePath,
          categories: finalCategories,
          price: newArt.price,
          userId,
          categorizedAs: targetCategory,
        },
      });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({
        error: "Server error while processing upload",
        details: err.message,
      });
    }
  }
);

export default router;
