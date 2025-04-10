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

    // Step 1: Show "loading" to the user
    await interaction.reply({
      content: "⏳ Loading and verifying your info...",
      ephemeral: true,
    });

    // Step 2: Safely load and update staff-data.json
    let data = {};
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, "{}");
      console.log("🆕 Created staff-data.json");
    }

    try {
      const raw = fs.readFileSync(dataPath, "utf-8");
      data = JSON.parse(raw || "{}");
    } catch (err) {
      console.error("❌ Error reading staff-data.json:", err);
      return interaction.editReply({
        content: "⚠️ Internal error while loading data file.",
      });
    }

    data[robloxUsername] = { discordID, discordTag };

    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      console.log(`✅ Logged ${robloxUsername} → ${discordTag}`);
    } catch (err) {
      console.error("❌ Failed to write staff-data.json:", err);
      return interaction.editReply({
        content: "⚠️ Failed to save your verification. Please try again.",
      });
    }

    // Step 3: Send final embed
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("Prove Yourself")
      .setDescription(
        `To begin tracking your shifts, join the verification game below.\n\n` +
        `**Roblox Username:** \`${robloxUsername}\``
      )
      .setFooter({ text: "Staff Verification Required" });

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Visit Game")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.roblox.com/games/114119023341299/Staff-Verification")
    );

    await interaction.editReply({
      content: "",
      embeds: [embed],
      components: [buttonRow],
    });
  },
};
