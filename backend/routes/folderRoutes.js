const express = require("express");
const router = express.Router();
const Folder = require("../models/Folder");
const auth = require("../middleware/auth");

// Create Folder
router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;

    const folder = new Folder({
      name,
      userId: req.user.id,
    });

    await folder.save();

    res.json(folder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Folders (user specific)
router.get("/", auth, async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user.id });
    res.json(folders);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.put("/:id/preview", auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // 🔐 security check
    if (folder.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    folder.previewEnabled = !folder.previewEnabled;
    await folder.save();

    res.json(folder);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;