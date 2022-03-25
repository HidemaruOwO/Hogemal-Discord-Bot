const { readFileSync, writeFileSync } = require("fs");
var globalchatChannels = JSON.parse(readFileSync("./data/globalchat.json"));

module.exports = {
  data: {
    name: "global",
    description: "グローバルチャット関連の設定",
    options: [
      {
        type: "SUB_COMMAND",
        name: "enable",
        description: "実行したチャンネルでグローバルチャットを有効化する",
      },
      {
        type: "SUB_COMMAND",
        name: "disable",
        description: "実行したチャンネルでグローバルチャットを無効化する",
      },
    ],
  },
  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === "enable") {
      if (globalchatChannels.includes(interaction.channel.id)) {
        await interaction.reply({
          content:
            "このチャンネルはグローバルチャット用のチャンネルとして設定されています。",
          ephemeral: true,
        });
        return;
      }
      globalchatChannels.push(interaction.channel.id);
      globalchatChannels = Array.from(new Set(globalchatChannels));
      writeFileSync(
        "./data/globalchat.json",
        JSON.stringify(globalchatChannels),
        "utf-8"
      );
      await interaction.reply(
        "このチャンネルをグローバルチャット用のチャンネルとして設定しました。"
      );
    }
    if (subCommand === "disable") {
      if (!globalchatChannels.includes(interaction.channel.id)) {
        await interaction.reply({
          content:
            "このチャンネルはグローバルチャット用のチャンネルではありません。",
          ephemeral: true,
        });
        return;
      }
      channelIndex = globalchatChannels.indexOf(interaction.channel.id);
      globalchatChannels.splice(channelIndex, 1);
      writeFileSync(
        "./data/globalchat.json",
        JSON.stringify(globalchatChannels),
        "utf-8"
      );
      await interaction.reply(
        "このチャンネルをグローバルチャット用のチャンネルとして除外しました。"
      );
    }
  },
};
