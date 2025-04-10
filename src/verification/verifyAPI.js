const express = require("express");
const router = express.Router();
const db = require("../modules/database");

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await db.query(
      "SELECT discord_id, discord_tag FROM staff_verification WHERE roblox_username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found in data list" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("verifyAPI GET error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /verify/:username/confirm
router.post("/:username/confirm", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await db.query(
      "UPDATE staff_verification SET verified = true WHERE roblox_username = $1 RETURNING *",
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Username not found" });
    }

    res.status(200).json({ message: "Verified successfully" });
  } catch (err) {
    console.error("verifyAPI POST error:", err);
    res.status(500).json({ error: "Could not update verification status" });
  }
});

module.exports = router;
