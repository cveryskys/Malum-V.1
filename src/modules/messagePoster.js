module.exports = {
  async sendFormattedMessage(channelId, content, embedData, formatting = {}) {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) throw new Error("Invalid channel");

    const formatted = formatContent(content, formatting);

    await channel.send({
      content: formatted,
      embeds: embedData ? [embedData] : [],
    });
  },
};

function formatContent(text, options) {
  if (!text) return "";

  if (options.bold) text = `**${text}**`;
  if (options.italic) text = `*${text}*`;
  if (options.code) text = `\`${text}\``;
  if (options.underline) text = `__${text}__`;

  return text;
}
