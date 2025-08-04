const express = require("express");
const router = express.Router();
const knex = require("../db/config");

router.get("/logs", async (req, res) => {
  try {
    const logs = await knex("activity_logs")
      .select("*")
      .orderBy("created_at", "desc")
      .limit(4);

    res.json({ logs });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;
