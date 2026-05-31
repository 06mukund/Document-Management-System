const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    previewEnabled: {
      type: Boolean,
      default: true, // 🔥 preview ON by default
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Folder", folderSchema);