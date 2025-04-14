require("dotenv").config();
const express = require("express");
const app = express();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const commandHandler = require("../handlers/commandHandler");
const roblox = require("../modules/roblox");
const tracking = require("../tracking/rblxTracking");
const schedule = require("node-schedule");
const verifyAPI = require("../verification/verifyAPI");
const postMessage = require("../routes/postMessage");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/verify", verifyAPI);
app.use("/post-message", postMessage);

app.get("/", (_, res) => res.send("✅ Server online"));

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

app.listen(PORT, () => {
  console.log(`🚀 Express running on port ${PORT}`);
});
