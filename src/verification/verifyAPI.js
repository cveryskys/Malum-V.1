const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dataPath = path.join(__dirname, "../data/staff-data.json");

if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");

function loadData() {
  return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

router.get("/getid/:roblox", (req, res) => {
  const roblox = req.params.roblox;
  const data = loadData();
  const entry = data[roblox];
  if (!entry) return res.status(404).send("Not found.");
  res.send({ discordID: entry.discordID });
});

router.get("/getuser/:roblox", (req, res) => {
  const roblox = req.params.roblox;
  const data = loadData();
  const entry = data[roblox];
  if (!entry) return res.status(404).send("Not found.");
  res.send({ discordUser: entry.discordTag });
});

router.post("/checkyes", express.json(), (req, res) => {
  const { robloxUsername, discordID } = req.body;
  if (!robloxUsername || !discordID) return res.status(400).send("Missing data.");
  const data = loadData();
  data[robloxUsername] = { discordID, discordTag: "Verified via game" };
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.send("Verified");
});

router.get("/checkno/:roblox", (req, res) => {
  const roblox = req.params.roblox;
  const data = loadData();
  if (!data[roblox]) return res.send("User not verified.");
  res.send("Already verified.");
});

module.exports = router;
