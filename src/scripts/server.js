require("dotenv").config();
const express = require("express");
const ngrok = require("ngrok");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const commandHandler = require("../handlers/commandHandler");
const roblox = require("../modules/roblox");
const tracking = require('../tracking/rblxTracking');
const schedule = require('node-schedule');


const app = express();
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

commandHandler(client);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  schedule.scheduleJob('0 12 * * 0', async () => {
    await tracking.sendWeeklyReport(client);

  client.user.setPresence({
    status: "idle",
    activities: [
      {
        name: "programmed by ayden!",
        type: 0,
      },
    ],
  });
  });

  const url = await ngrok.connect(process.env.PORT);
  console.log(`🌐 Ngrok Tunnel Open: ${url}`);  

  await roblox.initialize();
});

client.login(process.env.DISCORD_TOKEN);

app.listen(process.env.PORT, () => {
  console.log(`Express running on port ${process.env.PORT}`);
});
