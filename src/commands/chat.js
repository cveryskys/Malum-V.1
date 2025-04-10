const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ranks = require("../data/ranks.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("sends a msg")
    .addStringOption((option) =>
      option.setName("msg").setDescription("the msg").setRequired(true)
    )
    .setDefaultMemberPermissions(0),

  requiredRank: "HR",

  async execute(interaction) {
    const memberRoles = interaction.member.roles.cache;
    const requiredRoleId = ranks[module.exports.requiredRank];

    if (!memberRoles.has(requiredRoleId)) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    const message = interaction.options.getString("msg");

    await interaction.reply({ content: "sent.", ephemeral: true });

    const reference = interaction.options.getMessage
      ? interaction.options.getMessage("message")
      : null;
    const repliedMessage = interaction.channel.messages.cache.get(
      interaction.targetId
    );

    const targetMessage =
      interaction?.options?.resolved?.messages?.first() ||
      interaction?.options?.targetMessage;
    const replyTo = interaction?.options?.message || interaction?.targetMessage;

    const original = await interaction.fetchReply();

    if (interaction.channel && interaction.channel.messages) {
      const referencedMessage =
        interaction.options.getMessage?.("message") ??
        interaction?.options?.message;

      const interactionReply = await interaction.fetchReply();
      const repliedTo = await interaction.channel.messages
        .fetch(interaction?.targetId)
        .catch(() => null);

      if (interaction.message?.reference?.messageId) {
        const target = await interaction.channel.messages
          .fetch(interaction.message.reference.messageId)
          .catch(() => null);
        if (target) {
          return target.reply(message);
        }
      }
    }

    await interaction.channel.send(message);
  },
};
