const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const File = require("../models/File");
const Folder = require("../models/Folder");
const axios = require("axios");
const streamifier = require("streamifier");
const auth = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 1. Upload
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const { folderId, filename } = req.body;

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    const file = new File({
      filename: filename || req.file.originalname,
      originalname: req.file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      folderId,
      userId: req.user.id,
    });

    await file.save();
    res.json(file);

  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 2. Get files by folder  specific routes FIRST
router.get("/folder/:folderId", auth, async (req, res) => {
  try {
    const files = await File.find({
      folderId: req.params.folderId,
      userId: req.user.id,
    }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.log("GET FILES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// 3. Stream PDF specific routes FIRST
// Stream PDF for preview
router.get("/stream/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const response = await axios.get(file.url, { responseType: "arraybuffer" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.send(response.data);

  } catch (err) {
    console.log("STREAM ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 4. Preview File specific routes FIRST
router.get("/preview/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const folder = await Folder.findById(file.folderId);

    if (!folder || !folder.previewEnabled)
      return res.status(403).json({ message: "Preview disabled for this folder" });

    res.json({ url: file.url });

  } catch (err) {
    console.log("PREVIEW ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 5. Download File  specific routes FIRST
router.get("/download/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    res.json({ url: file.url });

  } catch (err) {
    console.log("DOWNLOAD ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 6. Get all files  generic routes LAST
router.get("/", auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Delete  generic routes LAST
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await cloudinary.uploader.destroy(file.public_id);
    await file.deleteOne();

    res.json({ message: "File deleted successfully" });

  } catch (err) {
    console.log("DELETE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;