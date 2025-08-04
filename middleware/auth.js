const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // can use this to check roles later
    next();
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid token.",
    });
  }
};

module.exports = auth;
