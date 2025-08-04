const express = require("express");
const router = express.Router();
const {
  createFood,
  getFoods,
  updateFood,
  deleteFood,
  getFoodCount,
} = require("../controllers/foodController");
const multer = require("multer");
const auth = require("../middleware/auth");

// Use memory storage for processing before saving
const upload = multer({ storage: multer.memoryStorage() });

// Public route
router.get("/", getFoods); // GET /api/foods

// Protected routes
router.post("/", auth, upload.single("image"), createFood); // POST /api/foods
router.put("/:id", auth, upload.single("image"), updateFood); // PUT /api/foods/:id
router.delete("/:id", auth, deleteFood);

// routes/foodRoutes.js
router.get("/count", getFoodCount);

module.exports = router;
