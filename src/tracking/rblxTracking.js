const { EmbedBuilder } = require("discord.js");
const { noblox } = require("../modules/roblox");
const fs = require("fs");
const path = require("path");

const MIN_TRACK_RANK = 60;
const TRACK_CHANNEL = "1163237752549158912";
const ANNOUNCE_CHANNEL = "1143658717263437964";
const ANNOUNCE_ROLE = "<@&1143658717263437964>";

const trackingDataPath = path.join(__dirname, "trackingData.json");
if (!fs.existsSync(trackingDataPath)) fs.writeFileSync(trackingDataPath, "{}");
let trackingData = require(trackingDataPath);

function formatDuration(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return null;
  if (mins < 60) return `${mins} Min${mins === 1 ? "" : "s"}`;
  const hr = Math.floor(mins / 60);
  return `${hr} Hour${hr === 1 ? "" : "s"}`;
}

async function sendShiftEmbed(discordClient, robloxId, sessionMs, messages = 0) {
  const userInfo = await noblox.getPlayerInfo(robloxId);
  const groupRankId = await noblox.getRankInGroup(32993985, robloxId);
  const groupRankName = await noblox.getRankNameInGroup(32993985, robloxId);

  if (groupRankId < MIN_TRACK_RANK) return;

  const shiftTimeStr = formatDuration(sessionMs);
  if (!shiftTimeStr) return;

  if (!trackingData[robloxId]) {
    trackingData[robloxId] = {
      totalMs: 0,
      messages: 0,
    };
  }

  trackingData[robloxId].totalMs += sessionMs;
  trackingData[robloxId].messages = messages;

  fs.writeFileSync(trackingDataPath, JSON.stringify(trackingData, null, 2));

  const weeklyMet = trackingData[robloxId].totalMs >= 3600000;

  const thumbnail = await noblox.getPlayerThumbnail(robloxId, 420, "png", false, "headshot");

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle("SHIFT")
    .setDescription(
      `**User:** \`${userInfo.username}\`\n` +
        `**ID:** \`${robloxId}\`\n\n` +
        `**SESSION INFO**\n` +
        `Shift Time: ${shiftTimeStr}\n` +
        `All Time: ${formatDuration(trackingData[robloxId].totalMs)}\n` +
        `Messages Sent: ${messages}\n` +
        `Met Weekly Requirements: ${weeklyMet ? "✓" : "✕"}\n\n` +
        `**RANK**\n` +
        `Current Rank: \`${groupRankName}\``
    )
    .setThumbnail(thumbnail[0]?.imageUrl || null);

  const channel = await discordClient.channels.fetch(TRACK_CHANNEL);
  if (channel) await channel.send({ embeds: [embed] });
}

async function sendWeeklyReport(discordClient) {
  const channel = await discordClient.channels.fetch(ANNOUNCE_CHANNEL);
  const members = await noblox.getPlayersInGroup(32993985);

  const met = [];
  const notMet = [];

  for (const user of members) {
    const rank = await noblox.getRankInGroup(32993985, user.userId);
    if (rank < MIN_TRACK_RANK) continue;

    const totalMs = trackingData[user.userId]?.totalMs || 0;
    const metReq = totalMs >= 3600000;
    (metReq ? met : notMet).push(user.username);
  }

  const metMsg =
    `**Time to announce those who have met the weekly requirements!**\n${ANNOUNCE_ROLE}\n\n` +
    (met.length
      ? met.map((u) => `• ${u}`).join("\n")
      : "Nobody met the requirements.");

  const notMetMsg =
    `**Now those who have not met the weekly requirements...**\n\n` +
    (notMet.length
      ? notMet.map((u) => `• ${u}`).join("\n")
      : "Everyone did their shifts!");

  await channel.send(metMsg);
  await channel.send(notMetMsg);

  for (const key of Object.keys(trackingData)) {
    trackingData[key].totalMs = 0;
    trackingData[key].messages = 0;
  }

  fs.writeFileSync(trackingDataPath, JSON.stringify(trackingData, null, 2));
}

module.exports = {
  sendShiftEmbed,
  sendWeeklyReport,
};
