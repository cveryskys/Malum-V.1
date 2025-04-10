const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const db = require("../modules/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-up")
    .setDescription("Begin your staff tracking verification.")
    .addStringOption((option) =>
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

    await interaction.reply({
      content: "⏳ Saving your data...",
      ephemeral: true,
    });

    try {
      await db.query(
        `INSERT INTO staff_verification (roblox_username, discord_id, discord_tag, verified)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (roblox_username)
         DO UPDATE SET discord_id = $2, discord_tag = $3`,
        [robloxUsername, discordID, discordTag, false]
      );

      console.log(`✅ Logged ${robloxUsername} → ${discordTag}`);
    } catch (err) {
      console.error("❌ Database insert failed:", err);
      return interaction.editReply({
        content: "❌ Could not verify you. Please try again later.",
      });
    }

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
