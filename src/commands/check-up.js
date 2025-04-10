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

if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");

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
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    const robloxUsername = interaction.options.getString("roblox-user");
    const discordID = interaction.user.id;
    const discordTag = `${interaction.user.username}#${interaction.user.discriminator}`;

    const currentData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    currentData[robloxUsername] = {
      discordID,
      discordTag
    };
    fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("Prove Yourself")
      .setDescription(
        `To begin tracking all your shift data properly, please join the verification game below so we can link your Roblox account to you!\n\n` +
        `**Roblox Username Provided:** \`${robloxUsername}\``
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
