const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const staffPath = path.join(__dirname, "staff.json");
if (!fs.existsSync(staffPath)) fs.writeFileSync(staffPath, "{}");
let staff = require(staffPath);

function saveStaff() {
  fs.writeFileSync(staffPath, JSON.stringify(staff, null, 2));
}

router.get("/getid/:roblox", (req, res) => {
  const roblox = req.params.roblox;
  const discordId = staff[roblox];
  if (!discordId) return res.status(404).send("User not found.");
  res.send({ discordID: discordId });
});

router.get("/getuser/:roblox", (req, res) => {
  const roblox = req.params.roblox;
  const discordId = staff[roblox];
  if (!discordId) return res.status(404).send("Not found.");
  res.send({ discordUser: discordId }); 
});

router.post("/checkyes", express.json(), (req, res) => {
  const { robloxUsername, discordID } = req.body;
  if (!robloxUsername || !discordID) return res.status(400).send("Missing data.");
  staff[robloxUsername] = discordID;
  saveStaff();
  res.send("Verified");
});

router.get("/checkno/:roblox", (req, res) => {
  const roblox = req.params.roblox;
  if (!staff[roblox]) return res.send("User not verified. You will be kicked.");
  res.send("Already verified.");
});

module.exports = router;
