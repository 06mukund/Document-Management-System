const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    filename: String,
    url: String,
    public_id: String,
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("File", fileSchema);