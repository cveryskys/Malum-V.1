const noblox = require("noblox.js");
require("dotenv").config();

noblox.setOptions({ show_deprecation_warnings: false });

const initialize = async () => {
  try {
    await noblox.setCookie(process.env.ROBLOX_COOKIE);
    const user = await noblox.getAuthenticatedUser();
    console.log(`🤖 Logged in to Roblox as ${user.username}`);
  } catch (err) {
    console.error("❌ Roblox Login Failed:", err);
  }
};

module.exports = {
  initialize,
  noblox,
};
