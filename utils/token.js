const jwt = require("jsonwebtoken");

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  const expiresIn = "1h";

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });

  return { token, expiresIn };
}

module.exports = generateToken;
