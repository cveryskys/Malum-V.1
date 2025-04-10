const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const ranks = require("../data/ranks.json");
const { noblox } = require("../modules/roblox");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("observe")
    .setDescription("observe sumbodys roblox profile")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("username of person ur observing")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),

  requiredRank: "HR",

  async execute(interaction) {
    const username = interaction.options.getString("username");
    const memberRoles = interaction.member.roles.cache;
    const requiredRoleId = ranks[module.exports.requiredRank];

    if (!memberRoles.has(requiredRoleId)) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: 1 << 6,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const userId = await noblox.getIdFromUsername(username);
      const [userInfo, groupRank, thumbnail] = await Promise.all([
        noblox.getPlayerInfo(userId),
        noblox.getRankNameInGroup(32993985, userId),
        noblox.getPlayerThumbnail(userId, 420, "png", false, "headshot"),
      ]);

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(userInfo.displayName)
        .setDescription(
          `**Username:** \`${userInfo.username}\`\n**Bio:** \`${
            userInfo.blurb || "No bio set"
          }\`\n**Group Rank:** \`${groupRank}\``
        )
        .setThumbnail(thumbnail[0]?.imageUrl || null)
        .setFooter({ text: `User ID: ${userId}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: "Failed to fetch user data. Make sure the username is valid.",
      });
    }
  },
};
