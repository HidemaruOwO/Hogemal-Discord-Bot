module.exports = {
  data: {
    name: "say",
    description: "Botに好きな文章を発言させる",
    options: [{
      type: "STRING",
      name: "input",
      description: "発言させる一文",
      required: true
    }],
  },
  async execute(interaction, client) {
    interaction.reply(interaction.options.getString('input'));
  }
}