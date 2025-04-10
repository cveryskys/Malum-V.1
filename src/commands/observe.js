const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const dataPath = path.join(__dirname, "../data/staff-data.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-up")
    .setDescription("Begin your staff tracking verification.")
    .addStringOption(option =>
      option.setName("roblox-user")
        .setDescription("Your Roblox username")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),

  requiredRole: "1155529017718493234",

  async execute(interaction) {
    const memberRoles = interaction.member.roles.cache;
    const requiredRole = module.exports.requiredRole;

    if (!memberRoles.has(requiredRole)) {
      await interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    const robloxUsername = interaction.options.getString("roblox-user");
    const discordID = interaction.user.id;
    const discordTag = `${interaction.user.username}#${interaction.user.discriminator}`;

    // Load + create file if missing
    let data = {};
    if (!fs.existsSync(dataPath)) {
      console.warn("⚠️ staff-data.json not found — creating new file.");
      fs.writeFileSync(dataPath, "{}");
    }

    try {
      const raw = fs.readFileSync(dataPath, "utf-8");
      data = JSON.parse(raw || "{}");
    } catch (err) {
      console.error("❌ Failed to read staff-data.json:", err);
      return interaction.reply({
        content: "Internal error: could not read data file.",
        ephemeral: true,
      });
    }

    // Write updated data
    data[robloxUsername] = { discordID, discordTag };

    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      console.log(`✅ Logged [${robloxUsername}] → [${discordTag}] to staff-data.json`);
    } catch (err) {
      console.error("❌ Failed to write staff-data.json:", err);
      return interaction.reply({
        content: "Internal error: could not save data.",
        ephemeral: true,
      });
    }

    // Embed + button
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("Prove Yourself")
      .setDescription(
        `To begin tracking your shifts, join the game below.\n\n` +
        `**Roblox Username:** \`${robloxUsername}\``
      )
      .setFooter({ text: "Staff Verification Required" });

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Visit Game")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.roblox.com/games/114119023341299/Staff-Verification")
    );

    await interaction.reply({
      embeds: [embed],
      components: [buttonRow],
      ephemeral: true,
    });
  },
};
