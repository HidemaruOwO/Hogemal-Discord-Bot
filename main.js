const fs = require("fs");
const request = require("request");
const { Client, Intents } = require("discord.js");
const config = require("./data/config.json");
const blacklist = require("./data/blacklist.json");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

const developerId = config.developer;
const prefix = config.prefix;
const commands = {};
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

var data = [];
var score = JSON.parse(fs.readFileSync("./data/score.json", "utf-8"));
var scoreOutput = score;
var runTime;
() => {
  runTime = new Date().getDate();
  console.log("実行時間: " + runTime);
};

const DISCORD_TOKEN = fs.readFileSync("./env/BOT_TOKEN", "utf-8");
const DEVELOP_DISCORD_TOKEN = fs.readFileSync(
  "./env/DEVELOP_BOT_TOKEN",
  "utf-8"
);

const getBingWallPaper = () => {
  request(
    {
      url: "https://www.bing.com/",
      method: "GET",
    },
    (error, response, body) => {
      img_contStart = body.indexOf(
        `class="img_cont" style="background-image: url(`
      );
      img_elBack = body.substring(img_contStart, img_contStart + 500);
      img_contEnd = img_elBack.indexOf(`); opacity: ;">`);
      img_url =
        "https://www.bing.com" +
        img_elBack
          .substring(0, img_contEnd)
          .replace(`class="img_cont" style="background-image: url(`, "");
      fs.writeFileSync("./data/bingWallPaperUrl.txt", img_url, "utf-8");
    }
  );
};

const updateBingWallPaper = () => {
  var today = new Date().getDate();
  if (runTime === today) {
    console.log("同じ日数");
  } else {
    paperGetDay = today;
    getBingWallPaper();
  }
};
getBingWallPaper();
setInterval(updateBingWallPaper, 1800000);

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands[command.data.name] = command;
}

client.once("ready", async () => {
  for (const commandName in commands) {
    data.push(commands[commandName].data);
  }
  client.guilds.cache
    .map((guild) => guild.id)
    .forEach((id) => {
      client.application.commands.set(data, id);
    });
  console.log("Ready: " + client.user.tag);
  setInterval(() => {
    client.user.setActivity({
      name: `/ | ${client.guilds.cache.size}Guilds | ${client.guilds.cache
        .map((guild) => guild.memberCount)
        .reduce((p, c) => p + c)}Users | https://hide0.net/discord/bot`,
    });
  }, 10000);
});
//Botがサーバーに参加したら
client.on("guildCreate", (guild) => {
  //コマンドセット
  client.application.commands.set(data, guild.id);
  //荒らし自動BAN
  blacklist.forEach((id) => {
    guild.members.ban(id, { reason: "クラック及び荒らした経歴あり" });
  });
});

client.on("messageCreate", async (message) => {
  //developer command
  //eval command
  if (!message.content.startsWith(prefix)) return;
  const [command, ...args] = message.content.slice(prefix.length).split(" ");
  if (!message.guild.me.permissions.has("ADMINISTRATOR")) {
    message.reply({
      embeds: [
        {
          title: "エラー: 権限が不足してます",
          description: "以下の権限を付与してください\n:x: ADMINISTRATOR",
        },
      ],
    });
    return;
  }
  developerId.forEach((id) => {
    if (message.author.id === id) {
      if (command === "eval") {
        try {
          const code = args.join(" ");
          let evaled = eval(code);
          if (!typeof evaled == "string")
            evaled = require("util").inspect(evaled);
          console.log(evaled, { code: "xl" });
        } catch (err) {
          console.log(err);
          client.users.cache.get(id).send(err);
        }
      } else if (command === "variable") {
        try {
          const code = args.join(" ");
          let evaled = eval(code);
          if (!typeof evaled == "string")
            evaled = require("util").inspect(evaled);
          message.channel.send(evaled, { code: "xl" });
        } catch (err) {
          console.log(err);
          client.users.cache.get(id).send(err);
        }
      } else if (command === "setScore") {
        scoreOutput[args[1]] = args[0];
        fs.writeFileSync(
          "./data/score.json",
          JSON.stringify(scoreOutput, null, "    "),
          "utf-8"
        );
        scoreOutput = JSON.parse(fs.readFileSync("./data/score.json", "utf-8"));
      }
    }
  });
  if (command === "say") {
    const str = args.join(" ");
    message.channel.send(str);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  if (!interaction.guild.me.permissions.has("ADMINISTRATOR")) {
    interaction.reply({
      embeds: [
        {
          title: "エラー: 権限が不足してます",
          description: "以下の権限を付与してください\n:x: ADMINISTRATOR",
        },
      ],
    });
    return;
  }
  const command = commands[interaction.commandName];
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      embeds: [
        {
          title: "コマンドの実行で例外が生じました",
          description:
            "権限が不足してませんか？\n確実にエラーを根絶するにはADMIN権限をBOTに付与してください",
        },
      ],
      ephemeral: true,
    });
  }
});

if (config.developMode) {
  client.login(DEVELOP_DISCORD_TOKEN);
} else {
  client.login(DISCORD_TOKEN);
}
