const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const File = require("../models/File");

// Multer setup (store file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📤 Upload File
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      async (error, result) => {
        if (error) return res.status(500).json(error);

        const file = new File({
          filename: result.original_filename,
          url: result.secure_url,
          public_id: result.public_id,
        });

        await file.save();
        res.json(file);
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 📥 Get All Files
router.get("/", async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 🗑️ Delete File
router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    await cloudinary.uploader.destroy(file.public_id);
    await file.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;