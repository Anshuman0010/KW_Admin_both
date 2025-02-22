
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  filename: String,
  branch: String,
  semester: String,
  category: String,
  path: String, // Stores the file path
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Resource", resourceSchema);
