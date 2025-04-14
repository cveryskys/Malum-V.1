const express = require("express");
const router = express.Router();
const messagePoster = require("../modules/messagePoster");

router.post("/", async (req, res) => {
  const { channelId, content, embed, formatting } = req.body;

  if (!channelId || (!content && !embed)) {
    return res.status(400).send("Missing message content or embed.");
  }

  try {
    await messagePoster.sendFormattedMessage(channelId, content, embed, formatting);
    res.status(200).send("Message sent!");
  } catch (err) {
    console.error("Message sending failed:", err);
    res.status(500).send("Error sending message.");
  }
});

module.exports = router;
