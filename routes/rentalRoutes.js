const express = require("express");
const router = express.Router();
const {
  createRental,
  getRentals,
  updateRental,
  deleteRental,
  getRentalCount,
  getAvailableRentalCount,
} = require("../controllers/rentalsController");
const multer = require("multer");
const auth = require("../middleware/auth");

// Use memory storage for processing before saving
const upload = multer({ storage: multer.memoryStorage() });

// Public route
router.get("/", getRentals); // GET /api/rentals

// Protected routes
router.post("/", auth, upload.single("image"), createRental); // POST /api/rentals
router.put("/:id", auth, upload.single("image"), updateRental); // PUT /api/rentals/:id
router.delete("/:id", auth, deleteRental); // DELETE /api/rentals/:id

// routes/rentalRoutes.js
router.get("/count", getRentalCount);

router.get("/count/available", getAvailableRentalCount);

module.exports = router;
