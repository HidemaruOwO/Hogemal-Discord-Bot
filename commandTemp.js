module.exports = {
  data: {
    name: "temp",
    description: "this file is temp file",
  },
  async execute(interaction, client) {
    await interaction.reply('Pong!');
  }
}