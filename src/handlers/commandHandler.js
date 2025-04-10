const fs = require("fs");
const path = require("path");
const ranks = require("../data/ranks.json");

module.exports = (client) => {
  const commandsPath = path.join(__dirname, "../commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const commandPath = path.join(commandsPath, file);
    const command = require(commandPath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    }
  }

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const requiredRank = command.requiredRank;
    const requiredRoleId = ranks[requiredRank];

    if (requiredRank && requiredRoleId) {
      const hasRole = interaction.member.roles.cache.has(requiredRoleId);
      if (!hasRole) {
        await interaction.reply({
          content: "You do not have permission to use this command.",
          ephemeral: true,
        });
        return;
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error in command '${interaction.commandName}':`, error);
      await interaction.reply({
        content: "Something went wrong while executing the command.",
        ephemeral: true,
      });
    }
  });
};
