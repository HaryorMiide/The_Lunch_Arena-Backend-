const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const db = require("../db/config");
const generateToken = require("../utils/token");

// ========== Register User ==========
const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  // Validate required fields
  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email or username already exists
    const existingUser = await db("users")
      .where("email", email)
      .orWhere("username", username)
      .first();

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [insertedId] = await db("users").insert({
      email,
      username,
      password: hashedPassword,
    });

    // Fetch newly created user
    const user = await db("users").where({ id: insertedId }).first();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ========== Login User ==========
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const trimmedEmail = email.trim();

    // Find user
    const [user] = await db("users").where({ email: trimmedEmail });
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid email or password." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid email or password." });
    }

    // Generate token with expiration
    const { token, expiresIn } = generateToken(user); // user or newUser

    // Send token in Authorization header and body
    res
      .status(StatusCodes.OK)
      .setHeader("Authorization", `Bearer ${token}`)
      .json({
        message: "Login successful.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
        expiresIn,
      });
  } catch (error) {
    console.error("Login error:", error); // 👈 log it to terminal
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

module.exports = { registerUser, loginUser };
