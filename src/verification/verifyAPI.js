const express = require("express");
const db = require("../modules/db");

const router = express.Router();

router.get("/verify/get/:robloxUsername", async (req, res) => {
  const username = req.params.robloxUsername;
  try {
    const result = await db.query(
      "SELECT discord_id, discord_tag FROM staff_verification WHERE roblox_username = $1",
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
