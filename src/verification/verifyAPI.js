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
  const discordID = staff[roblox];
  if (!discordID) return res.status(404).send("Not found.");
  res.send({ discordID });
});

router.get("/getuser/:roblox", (req, res) => {
  const roblox = req.params.roblox;
  const discordID = staff[roblox];
  if (!discordID) return res.status(404).send("Not found.");
  res.send({ discordUser: discordID });
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
  if (!staff[roblox]) return res.send("User not verified.");
  res.send("Already verified.");
});

module.exports = router;
