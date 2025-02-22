const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Resource = require("../models/res");
const router = express.Router();
// const PDF = require("../models/PDFModel");

const branchMapping = {
  "Computer Science": "cs",
  "Mechanical": "mech",
  "Electrical": "eee",
  "Electronics": "ece",
  "Civil": "civil",
  "Information Technology": "it",
  "Biotechnology": "bio"
};
router.post("/test", multer().none(), (req, res) => {
  console.log("✅ Test Route - Received req.body:", req.body);
  res.json({ success: true, data: req.body });
});

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Extract original extension
    cb(null, file.fieldname + "-" + Date.now() + ext); // Keep file extension
  },
});

const upload = multer({ storage: storage });
// const upload = multer({ dest: "uploads/" });

router.post("/upload/pdf", upload.fields([{ name: "pdf", maxCount: 1 }]), async (req, res) => {
  console.log("✅ Received req.body:", req.body);  // Should contain branch, semester, category
  console.log("✅ Received file:", req.files);  // Should contain file details

  if (!req.body.branch || !req.body.semester || !req.body.category) {
    return res.status(400).json({ error: "❌ Missing branch, semester, or category" });
  }

  if (!req.files || !req.files.pdf) {
    return res.status(400).json({ message: "❌ No file uploaded" });
  }

  try {
    let { branch, semester, category } = req.body;
    branch = branchMapping[branch] || branch.toLowerCase().replace(/\s+/g, "_");
    
    const file = req.files.pdf[0];  // ✅ Correctly access the file

const uploadPath = path.join(__dirname, `../uploads/${branch}/semester_${semester}/${category}`);
fs.mkdirSync(uploadPath, { recursive: true });

const newPath = path.join(uploadPath, file.filename);
fs.renameSync(file.path, newPath); // ✅ Move the file correctly

    // const uploadPath = path.join(__dirname, `../uploads/${branch}/semester_${semester}/${category}`);
    // fs.mkdirSync(uploadPath, { recursive: true });

    // const file = req.files.pdf[0];
    // const newPath = path.join(uploadPath, file.filename);
    // fs.renameSync(file.path, newPath);

    const newResource = new Resource({
      filename: file.filename,
      branch,
      semester,
      category,
      path: newPath
    });

    await newResource.save();

    res.status(201).json({
      message: "✅ File uploaded successfully",
      file: file.filename,
      path: newPath
    });
  } catch (error) {
    console.error("❌ Error saving file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get All PDFs (with Filters) from mongodb
router.get("/pdfs", async (req, res) => {
  try {
    const { branch, semester, category } = req.query;
    const filters = {};

    if (branch) filters.branch = branch;
    if (semester) filters.semester = semester;
    if (category) filters.category = category;

    const pdfs = await Resource.find(filters);
    res.json(pdfs);
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// get pdfs from server(uploads)
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Function to get PDFs from a directory structure
const getPDFs = (dirPath, branch = "", semester = "", category = "") => {
  const results = [];

  console.log(`Checking directory: ${dirPath}`);

  // Ensure uploads directory exists
  if (!fs.existsSync(dirPath)) {
    console.log(`Uploads directory does not exist: ${dirPath}`);
    return results;
  }

  const branches = branch
    ? [branch]
    : fs.readdirSync(dirPath).filter(b => fs.statSync(path.join(dirPath, b)).isDirectory());

  branches.forEach((branchName) => {
    const semesterPath = path.join(dirPath, branchName);

    if (!fs.existsSync(semesterPath) || !fs.statSync(semesterPath).isDirectory()) {
      console.log(`Skipping missing or invalid semester path: ${semesterPath}`);
      return;
    }

    const semesters = semester
      ? [semester]
      : fs.readdirSync(semesterPath).filter(s => fs.statSync(path.join(semesterPath, s)).isDirectory());

    semesters.forEach((semesterName) => {
      const semesterDir = path.join(semesterPath, semesterName);

      if (!fs.existsSync(semesterDir) || !fs.statSync(semesterDir).isDirectory()) {
        console.log(`Skipping missing semester directory: ${semesterDir}`);
        return;
      }

      // Ensure categoryBasePath is defined correctly
      const categories = category
        ? [category]
        : fs.readdirSync(semesterDir).filter(c => fs.statSync(path.join(semesterDir, c)).isDirectory());

      categories.forEach((categoryName) => {
        const categoryPath = path.join(semesterDir, categoryName);

        if (!fs.existsSync(categoryPath) || !fs.statSync(categoryPath).isDirectory()) {
          console.log(`Skipping missing or invalid category path: ${categoryPath}`);
          return;
        }

        console.log(`Checking PDF files in: ${categoryPath}`);

        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".pdf"));

        if (files.length === 0) {
          console.log(`No PDFs found in: ${categoryPath}`);
        }

        files.forEach((file) => {
          results.push({
            filename: file,
            path: `/uploads/${branchName}/${semesterName}/${categoryName}/${file}`,
            branch: branchName,
            semester: semesterName,
            category: categoryName,
          });
        });
      });
    });
  });

  return results;
};

// API to fetch PDFs from uploads folder
router.get("/uploads/pdfs", async (req, res) => {
  try {
    const { branch, semester, category } = req.query;
    const pdfs = getPDFs(UPLOADS_DIR, branch, semester, category);
    res.json(pdfs);
  } catch (error) {
    console.error(" 1 Error fetching PDFs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;


