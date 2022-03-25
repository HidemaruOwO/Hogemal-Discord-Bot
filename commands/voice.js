const { VoiceText } = require("voice-text");
const {
  joinVoiceChannel,
  createAudioResource,
  StreamType,
  createAudioPlayer,
} = require("@discordjs/voice");
const { writeFileSync, readFileSync } = require("fs");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const voiceText = new VoiceText(readFileSync("env/VOICETEXT_API_KEY", "utf-8"));
const { MessageButton, MessageActionRow } = require("discord.js");

var connections = [];
var musics = {};

module.exports = {
  data: {
    name: "voice",
    description: "VC関連のコマンド",
    options: [
      {
        type: "SUB_COMMAND",
        name: "join",
        description: "BotをVCに参加させる",
      },
      {
        type: "SUB_COMMAND",
        name: "leave",
        description: "BotをVCから退出させる",
      },
      {
        type: "SUB_COMMAND",
        name: "shovel",
        description: "文章を読み上げる",
        options: [
          {
            type: "STRING",
            name: "input",
            description: "読み上げる一文",
          },
        ],
      },
      /*
      {
        type: "SUB_COMMAND",
        name: "play",
        description: "音楽を再生する",
        options: [
          {
            type: "STRING",
            name: "url",
            description: "再生するYouTube動画のURL",
          },
          {
            type: "STRING",
            name: "word",
            description: "YouTubeで検索する語句を入力",
          },
        ],
      },
      */
    ],
  },
  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();
    const guild = interaction.guild;
    const member = await guild.members.fetch(interaction.member.id);
    const memberVC = member.voice.channel;
    const playButton = new MessageButton()
      .setCustomId("play")
      .setStyle("PRIMARY")
      .setLabel("▶︎ Play");
    const musicComponent = [new MessageActionRow().addComponents(playButton)];
    if (!memberVC) {
      return interaction.reply({
        content: "接続先のVCが見つかりません。",
        ephemeral: true,
      });
    }
    if (!memberVC.joinable) {
      return interaction.reply({
        content: "あなたがVCに参加していないため、コマンドの実行に失敗しました",
        ephemeral: true,
      });
    }
    if (subCommand === "join") {
      const status = ["VCに参加中..", `${memberVC}に参加しました!!`];
      connections[guild.id] = joinVoiceChannel({
        guildId: guild.id,
        channelId: memberVC.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: false,
      });
      await interaction.reply(status.join("\n"));
    } else if (subCommand === "leave") {
      if (memberVC) {
        await interaction.reply({
          content: "VCから退出中..",
        });
        connections[guild.id].destroy();
        interaction.editReply({
          content: `${memberVC}から退出しました!!`,
        });
      }
    } else if (subCommand === "shovel") {
      const vcText = interaction.options.getString("input");
      if (!vcText) {
        interaction.reply({
          content: "inputの値が空です",
          ephemeral: true,
        });
        return;
      }
      if (!memberVC.speakable) {
        interaction.reply({
          content: "VCで音声を再生する権限がありません。",
          ephemeral: true,
        });
        return;
      }

      await voiceText.fetchBuffer(vcText, { format: "ogg" }).then((buffer) => {
        writeFileSync("data/sounds/voice.ogg", buffer);
      });
      const player = createAudioPlayer();
      connections[guild.id].subscribe(player);
      player.play(createAudioResource("data/sounds/voice.ogg"));

      interaction.reply({
        embeds: [
          {
            author: {
              name: interaction.user.username,
              icon_url:
                interaction.user.avatarURL() ??
                "https://pbs.twimg.com/profile_images/1393003090308075520/Ko5FceZ4_400x400.jpg",
              url: `https://discord.com/channels/@me/${interaction.user.id}`,
            },
            description: vcText,
            color: "RANDOM",
            timestamp: new Date(),
          },
        ],
      });
    } else if (subCommand === "play") {
      const url = interaction.options.getString("url");
      const word = interaction.options.getString("word");
      if (!url && !word) {
        interaction.reply({
          content: "動画のURLもしくは、検索語句を入力してください",
          ephemeral: true,
        });
        return;
      }
      if (url && word) {
        interaction.reply({
          content: "どちらかを入力してください",
          ephemeral: true,
        });
        return;
      }
      if (typeof url == "string") {
        interaction.reply(
          "この機能はまだ実装されてません\nwordに値を渡してください"
        );
      } else if (typeof word == "string") {
        yts(word, (err, result) => {
          const videos = result.videos;
          interaction.reply({
            content:
              "動画を取得してきました👍\nこれでよろしければ再生ボタンを押してください",
            components: musicComponent,
            embeds: [
              {
                author: {
                  name: videos[0].author.name,
                  url: videos[0].author.url,
                },
                title: "💿" + videos[0].title,
                description: videos[0].description,
                url: videos[0].url,
                color: "RANDOM",
                timestamp: new Date(),
                image: {
                  url: videos[0].image,
                },
              },
            ],
          });
          musics[guild.id] = {
            url: videos[0].url,
            title: videos[0].title,
          };
        });
      }
      client.on("interactionCreate", async (interaction) => {
        if (interaction.customId === "play") {
          const player = createAudioPlayer();
          connections[guild.id].subscribe(player);
          const stream = ytdl(ytdl.getURLVideoID(musics[guild.id].url), {
            filter: (format) =>
              format.audioCodec === "opus" && format.container === "webm",
            quality: "highest",
            highWaterMark: 32 * 1024 * 1024,
          });
          const resource = createAudioResource(stream, {
            inputType: StreamType.WebmOpus,
          });
          player.play(createAudioResource(resource));
          interaction.reply(
            "▶︎ 再生を開始します\n💿 " + musics[guild.id].title
          );
        }
      });
    }
  },
};
