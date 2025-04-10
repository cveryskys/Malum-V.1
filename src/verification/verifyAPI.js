const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/verify/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM staff_verification WHERE roblox_username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ verified: false, message: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      verified: user.verified,
      roblox_username: user.roblox_username,
      discord_id: user.discord_id,
      discord_tag: user.discord_tag
    });
  } catch (err) {
    console.error("❌ Error in /verify route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
