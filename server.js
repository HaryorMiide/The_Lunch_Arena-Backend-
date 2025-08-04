const express = require("express");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const path = require("path");
const rentalRoutes = require("./routes/rentalRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();
const PORT = process.env.PORT;

const cors = require("cors");
app.use(cors({ origin: "http://localhost:8080" }));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api is running...");
});

app.use("/api/v1/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/rentals", rentalRoutes);
app.use("/api/activity", activityRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
