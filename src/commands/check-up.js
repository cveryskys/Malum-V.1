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
      option.setName("roblox-user").setDescription("Your Roblox username").setRequired(true)
    ),

  async execute(interaction) {
    const robloxUsername = interaction.options.getString("roblox-user");
    const discordId = interaction.user.id;
    const discordTag = `${interaction.user.username}#${interaction.user.discriminator}`;

    await interaction.reply({ content: "Verifying and saving your data...", ephemeral: true });

    try {
      await db.query(
        `INSERT INTO staff_verification (roblox_username, discord_id, discord_tag, verified)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (roblox_username)
         DO UPDATE SET discord_id = $2, discord_tag = $3, verified = false`,
        [robloxUsername, discordId, discordTag, false]
      );
    } catch (err) {
      console.error("❌ DB Error:", err);
      return interaction.editReply({ content: "❌ Something went wrong saving your data." });
    }

    const embed = new EmbedBuilder()
      .setTitle("You're Registered!")
      .setDescription(
        `You’ve been added to the system.\n\nRoblox Username: \`${robloxUsername}\`\n\nNow join the verification game.`
      )
      .setColor(0x2ecc71);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Join Game")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.roblox.com/games/114119023341299/Staff-Verification")
    );

    await interaction.editReply({ content: "", embeds: [embed], components: [row] });
  },
};
