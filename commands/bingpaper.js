const { readFileSync } = require("fs");

module.exports = {
  data: {
    name: "bingpaper",
    description: "日毎に変わるBing壁紙を送信する",
  },
  async execute(interaction, client) {
    var bingWallPaperUrl = readFileSync("./data/bingWallPaperUrl.txt", "utf-8")
    interaction.reply({
      embeds: [{
        title: "今日のBing Wall Paper",
        url: 'https://github.com/hidemaruowo/getbingwallpaper',
        color: "RANDOM",
        image: {
          url: bingWallPaperUrl
        },
        timestamp: new Date()
      }]
    });
  }
}