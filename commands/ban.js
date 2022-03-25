const moment = require("moment");
const { readFileSync } = require("fs");

module.exports = {
  data: {
    name: "ban",
    description: "ユーザーをBANする",
    options: [
      {
        type: "SUB_COMMAND",
        name: "normal",
        description: "指定したユーザーを永久BANする",
        options: [{
          type: "USER",
          name: "target",
          description: "ユーザー選択",
        }],
      },
      {
        type: "SUB_COMMAND",
        name: "id",
        description: "IDで指定したユーザーを永久BANする",
        options: [{
          type: "STRING",
          name: "id",
          description: "ユーザーのID",
        }],
      },
      {
        type: "SUB_COMMAND",
        name: "user",
        description: "オプション付きでユーザーをBANする",
        options: [{
          type: "USER",
          name: "target",
          description: "ユーザー選択",
        },
        {
          type: "STRING",
          name: "reason",
          description: "BAN理由"
        },
        {
          type: "NUMBER",
          name: "day",
          description: "BANする期間"
        }
        ],
      }
    ],
  },
  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();
    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      await interaction.reply("あなたにはユーザーをBANする権限がありません");
      return;
    }
    if (subCommand === "normal" || subCommand === "user") {
      const user = interaction.options.getUser("target");
      const member = interaction.options.getMember("target");
      if (subCommand === "user") {
        const day = interaction.options.getNumber("day");
        const reason = interaction.options.getString("reason");
        try {
          if (!day && !reason) {
            interaction.guild.members.ban(member);
          } else if (!day) {
            interaction.guild.members.ban(member, { reason: reason });
          } else if (!reason) {
            interaction.guild.members.ban(member, { days: day });
          }
          interaction.guild.members.ban(member, { reason: reason, days: day });
        } catch (err) {
          await interaction.reply({
            embeds: [{
              title: "Error",
              description: `<@!${user.id}>` + "さんのBANに失敗しました。\nBotより権限が高級な可能性があります。"
            }]
          });
          return;
        }
      } else {
        try {
          interaction.guild.members.ban(member);
        } catch (err) {
          await interaction.reply({
            embeds: [{
              title: "Error",
              description: `<@!${user.id}>` + "さんのBANに失敗しました。\nBotより権限が高級な可能性があります。"
            }]
          });
          return;
        }
      }

      var accountCreateDate = moment(user.createdAt);
      var dayOfWeekEmoji = ["🌙", "🔥", "💧", "🌳", "💰", "🪐", "☀️"];
      accountCreateDateMsg = accountCreateDate.format("YYYY年MM月DD日 HH:mm") + " ";
      accountCreateDateOfWeek = accountCreateDate.format("dddd");
      if (accountCreateDateOfWeek === "Monday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[0];
      } else if (accountCreateDateOfWeek === "TuesDay") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[1];
      } else if (accountCreateDateOfWeek === "Wednesday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[2];
      } else if (accountCreateDateOfWeek === "Thursday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[3];
      } else if (accountCreateDateOfWeek === "Friday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[4];
      } else if (accountCreateDateOfWeek === "Saturday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[5];
      } else if (accountCreateDateOfWeek === "Sunday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[6];
      }
      const userTag = user.tag.replace(user.username, "");
      var isBot = "🧑 HUMAN";
      var bannerURL;
      if (user.bot) {
        isBot = "🤖 ROBOT";
      }
      try {
        bannerURL = user.bannerURL();
      } catch (e) {
        bannerURL = "https://raw.githubusercontent.com/HidemaruOwO/MyDesigns/main/Image/NO%20BERNER.png";
      }
      const memberRoleId = member.roles.cache.map(data => data.id);
      var hasRoles = "";
      memberRoleId.forEach((id) => {
        hasRoles = hasRoles + `<@&${id}>,`
      });
      hasRoles = hasRoles.substring(0, hasRoles.length - 1);
      const period = Math.round((Date.now() - member.joinedAt) / 86400000);
      var periodMsg;
      if (period === 0) {
        periodMsg = "今日参加しました";
      } else {
        periodMsg = `${period}日`;
      }
      var score = JSON.parse(readFileSync("./data/score.json", "utf-8"));
      score = score;
      var userScore;
      try {
        userScore = parseInt(score[user.id]);
      } catch (error) {
        userScore = 10;
      }
      if (Number.isNaN(userScore)) {
        userScore = 10;
      }
      var scoreMsg = "";
      if (userScore > 8) {
        scoreMsg = scoreMsg + "<:check:945640044591476808> ";
      } else if (userScore < 8 && userScore > 0) {
        scoreMsg = scoreMsg + "<:cyuii:945640085712420934> ";
      } else if (userScore < 0) {
        scoreMsg = scoreMsg + "<:batu:945640026232987659> ";
      }
      scoreMsg = scoreMsg + userScore + "点";
      await interaction.reply({
        embeds: [{
          title: "User BAN!!",
          description: `<@!${user.id}>` + "さんをBANしました",
          thumbnail: {
            url: user.avatarURL() ?? "https://pbs.twimg.com/profile_images/1393003090308075520/Ko5FceZ4_400x400.jpg"
          },
          image: {
            url: bannerURL
          },
          fields: [
            { name: "ユーザー名", value: user.username, inline: true },
            { name: "タグ", value: userTag, inline: true },
            { name: "ID", value: user.id, inline: true },
            { name: "評価", value: scoreMsg, inline: true },
            { name: "アカウントの種類", value: isBot, inline: true },
            { name: "アカウント作成日時", value: accountCreateDateMsg, inline: true },
            { name: "サーバー参加期間", value: periodMsg, inline: true },
            { name: "所持役職", value: hasRoles }
          ],
        }]
      })
    } else if (subCommand === "id") {
      const id = interaction.options.getString("id");
      try {
        interaction.guild.members.ban(id);
      } catch (err) {
        await interaction.reply({
          embeds: [{
            title: "Error",
            description: `<@!${user.id}>` + "さんのBANに失敗しました。\nBotより権限が高級な可能性があります。"
          }]
        });
        return;
      }
      const user = await client.users.fetch(id);
      const userTag = user.tag.replace(user.username, "");
      var isBot = "🧑 HUMAN";
      var bannerURL;
      if (user.bot) {
        isBot = "🤖 ROBOT";
      }
      try {
        bannerURL = user.bannerURL();
      } catch (e) {
        bannerURL = "https://raw.githubusercontent.com/HidemaruOwO/MyDesigns/main/Image/NO%20BERNER.png";
      }
      var score = JSON.parse(readFileSync("./data/score.json", "utf-8"));
      score = score;
      var userScore;
      try {
        userScore = parseInt(score[user.id]);
      } catch (error) {
        userScore = 10;
      }
      if (Number.isNaN(userScore)) {
        userScore = 10;
      }
      var scoreMsg = "";
      if (userScore > 8) {
        scoreMsg = scoreMsg + "<:check:945640044591476808> ";
      } else if (userScore < 8 && userScore > 0) {
        scoreMsg = scoreMsg + "<:cyuii:945640085712420934> ";
      } else if (userScore < 0) {
        scoreMsg = scoreMsg + "<:batu:945640026232987659> ";
      }
      scoreMsg = scoreMsg + userScore + "点";
      var accountCreateDate = moment(user.createdAt);
      var dayOfWeekEmoji = ["🌙", "🔥", "💧", "🌳", "💰", "🪐", "☀️"];
      accountCreateDateMsg = accountCreateDate.format("YYYY年MM月DD日 HH:mm") + " ";
      accountCreateDateOfWeek = accountCreateDate.format("dddd");
      if (accountCreateDateOfWeek === "Monday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[0];
      } else if (accountCreateDateOfWeek === "TuesDay") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[1];
      } else if (accountCreateDateOfWeek === "Wednesday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[2];
      } else if (accountCreateDateOfWeek === "Thursday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[3];
      } else if (accountCreateDateOfWeek === "Friday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[4];
      } else if (accountCreateDateOfWeek === "Saturday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[5];
      } else if (accountCreateDateOfWeek === "Sunday") {
        accountCreateDateMsg = accountCreateDateMsg + dayOfWeekEmoji[6];
      }
      await interaction.reply({
        embeds: [{
          title: "User BAN!!",
          description: `<@!${user.id}>` + "さんをBANしました",
          thumbnail: {
            url: user.avatarURL() ?? "https://pbs.twimg.com/profile_images/1393003090308075520/Ko5FceZ4_400x400.jpg"
          },
          image: {
            url: bannerURL
          },
          fields: [
            { name: "ユーザー名", value: user.username, inline: true },
            { name: "タグ", value: userTag, inline: true },
            { name: "ID", value: user.id, inline: true },
            { name: "評価", value: scoreMsg, inline: true },
            { name: "アカウントの種類", value: isBot, inline: true },
            { name: "アカウント作成日時", value: accountCreateDateMsg, inline: true }
          ],
        }]
      })
    }
  }
}