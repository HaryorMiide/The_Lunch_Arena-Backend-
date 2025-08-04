const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const {
  loginSchema,
  registerSchema,
} = require("../validations/authValidation");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/signup", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

// Simple logout endpoint
router.post("/logout", (req, res) => {
  res.status(200).json({
    message: "Logged out successfully. Please remove token from client.",
  });
});

module.exports = router;
