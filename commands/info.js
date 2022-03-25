const moment = require('moment');
const { readFileSync } = require("fs");

module.exports = {
  data: {
    name: "info",
    description: "コマンドを実行したサーバーを調べる",
    options: [
      {
        type: "SUB_COMMAND",
        name: "user",
        description: "指定したユーザーの情報を開示する",
        options: [{
          type: "USER",
          name: "target",
          description: "ユーザー選択",
        }],
      },
      {
        type: "SUB_COMMAND",
        name: "server",
        description: "コマンドを実行したサーバーの情報を開示する",
      },
    ],
  },
  async execute(interaction, client) {
    if (interaction.commandName === 'info') {
      if (interaction.options.getSubcommand() === 'user') {
        const user = interaction.options.getUser('target');
        const permissions = ["CREATE_INSTANT_INVITE", "KICK_MEMBERS", "BAN_MEMBERS", "ADMINISTRATOR", "MANAGE_CHANNELS", "MANAGE_GUILD", "ADD_REACTIONS", "VIEW_AUDIT_LOG", "PRIORITY_SPEAKER", "STREAM", "VIEW_CHANNEL", "SEND_MESSAGES", "SEND_TTS_MESSAGES", "MANAGE_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "READ_MESSAGE_HISTORY", "MENTION_EVERYONE", "USE_EXTERNAL_EMOJIS", "VIEW_GUILD_INSIGHTS", "CONNECT", "SPEAK", "MUTE_MEMBERS", "DEAFEN_MEMBERS", "MOVE_MEMBERS", "USE_VAD", "CHANGE_NICKNAME", "MANAGE_NICKNAMES", "MANAGE_ROLES", "MANAGE_WEBHOOKS", "MANAGE_EMOJIS_AND_STICKERS", "USE_APPLICATION_COMMANDS", "REQUEST_TO_SPEAK", "MANAGE_EVENTS", "MANAGE_THREADS", "USE_PUBLIC_THREADS", "USE_PUBLIC_THREADS", "CREATE_PUBLIC_THREADS", "USE_PRIVATE_THREADS", "CREATE_PRIVATE_THREADS", "USE_EXTERNAL_STICKERS", "SEND_MESSAGES_IN_THREADS", "START_EMBEDDED_ACTIVITIES", "MODERATE_MEMBERS"];
        var hasPermissions = "";
        if (user) {
          const member = interaction.options.getMember('target');
          permissions.forEach((permission) => {
            if (member.permissions.has(permission)) {
              hasPermissions = hasPermissions + permission + ", ";
            }
          });
          hasPermissions = hasPermissions.substring(0, hasPermissions.length - 2);
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
              title: user.tag + "の情報",
              url: `https://discord.com/channels/@me/${user.id}`,
              description: `APIに<@${user.id}>さんの情報を問い合わせました`,
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
                { name: "所持役職", value: hasRoles },
                { name: "所持権限", value: hasPermissions }
              ],
              footer: {
                text: "評価は独自DBから引用"
              },
              color: "RANDOM",
              timestamp: new Date()
            }]
          });
        } else {
          await interaction.reply("targetを指定してください");
        }
      } else if (interaction.options.getSubcommand() === 'server') {
        const guild = interaction.guild;
        const memberCount = guild.memberCount;
        var memberCountMsg = "";
        if (memberCount < 150) {
          memberCountMsg = "👀小規模"
        } else if (memberCount > 150 && memberCount < 500) {
          memberCountMsg = "👍中規模"
        } else if (memberCount > 500 && memberCount < 1000) {
          memberCountMsg = "🇺🇸大規模"
        } else {
          memberCountMsg = "💥超規模"
        }
        memberCountMsg = memberCountMsg + " " + memberCount + "人";
        const owner = await guild.fetchOwner();
        const invites = await guild.invites.fetch();
        const invite = invites.map(invite => invite.url)[0];
        const roles = guild.roles.cache.map(role => role.id);
        var rolesMsg;
        roles.forEach((id) => {
          rolesMsg = rolesMsg + `<@&${id}>, `
        })
        rolesMsg = rolesMsg.substring(0, rolesMsg.length - 2);
        rolesMsg = rolesMsg.replace("undefined", "");
        await interaction.reply({
          embeds: [{
            title: guild.name + "の情報",
            url: invite ?? "https://discord.gg",
            description: "APIに" + guild.name + "の情報を問い合わせました",
            thumbnail: {
              url: guild.iconURL() ?? "https://pbs.twimg.com/profile_images/1393003090308075520/Ko5FceZ4_400x400.jpg"
            },
            fields: [
              { name: "サーバー名", value: guild.name, inline: true },
              { name: "サーバーID", value: guild.id, inline: true },
              { name: "サーバーオーナー", value: "👑 " + `${owner}`, inline: true },
              { name: "ユーザー数", value: memberCountMsg, inline: true },
              { name: "チャンネル数", value: guild.channels.cache.map(ch => ch.id).length + "チャンネル", inline: true },
              { name: "役職", value: rolesMsg }
            ]
          }]
        });
      }
    }
  }
}