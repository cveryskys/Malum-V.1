const express = require("express");
const router = express.Router();
const db = require("../modules/database");

router.post("/verify", async (req, res) => {
  const { robloxUsername } = req.body;

  if (!robloxUsername) {
    return res.status(400).json({ error: "Missing robloxUsername" });
  }

  try {
    const result = await db.query(
      `UPDATE staff_verification SET verified = true WHERE roblox_username = $1`,
      [robloxUsername]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, message: "User marked as verified" });
  } catch (err) {
    console.error("❌ Error updating verification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
