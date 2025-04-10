require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const commandHandler = require("../handlers/commandHandler");
const roblox = require("../modules/roblox");
const tracking = require("../tracking/rblxTracking");
const schedule = require("node-schedule");

const app = express();
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
commandHandler(client);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    status: "idle",
    activities: [
      {
        name: "programmed by ayden!",
        type: 0,
      },
    ],
  });

  schedule.scheduleJob("0 12 * * 0", async () => {
    await tracking.sendWeeklyReport(client);
  });

  await roblox.initialize();
});

client.login(process.env.DISCORD_TOKEN);

app.use(express.json());

app.post("/tracking", async (req, res) => {
  const { robloxId, sessionMs, messages } = req.body;

  if (!robloxId || !sessionMs) {
    return res.status(400).send("Missing required tracking data.");
  }

  try {
    await tracking.sendShiftEmbed(client, robloxId, sessionMs, messages || 0);
    res.status(200).send("Shift data received.");
  } catch (err) {
    console.error("Error in /tracking:", err);
    res.status(500).send("Tracking failed.");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Express running on port ${process.env.PORT || 3000}`);
});
