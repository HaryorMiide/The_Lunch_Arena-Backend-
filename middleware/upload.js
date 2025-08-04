const multer = require("multer");
const path = require("path");

const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();

    // Replace spaces with dashes in the food_name
    const foodName = req.body.food_name
      ? req.body.food_name.toLowerCase().replace(/\s+/g, "-")
      : "unknown";

    const finalName = `${foodName}-${timestamp}${ext}`;
    cb(null, finalName);
  },
});

const upload = multer({ storage });

module.exports = upload;
