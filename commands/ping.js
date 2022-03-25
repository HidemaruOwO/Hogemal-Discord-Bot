module.exports = {
  data: {
    name: "ping",
    description: "Ping値を計測する",
  },
  async execute(interaction, client) {
    const emoji = ["🟢", "🟡", "🔴"];

    var websocketPing = client.ws.ping;
    var websocketPingMsg;

    if (websocketPing < 140) {
      websocketPingMsg = `${emoji[0]} ${websocketPing}ミリ秒`;
    } else if (websocketPing > 140 && websocketPing < 200) {
      websocketPingMsg = `${emoji[1]} ${websocketPing}ミリ秒`;
    } else if (websocketPing > 200) {
      websocketPingMsg = `${emoji[2]} ${websocketPing}ミリ秒`;
    }

    var apiLatency = Date.now() - interaction.createdTimestamp;
    var apiLatencyMsg;

    if (apiLatency < 140) {
      apiLatencyMsg = `${emoji[0]} ${apiLatency}ミリ秒`;
    } else if (apiLatency > 140 && apiLatency < 200) {
      apiLatencyMsg = `${emoji[1]} ${apiLatency}ミリ秒`;
    } else if (apiLatency > 200) {
      apiLatencyMsg = `${emoji[2]} ${apiLatency}ミリ秒`;
    }
    interaction.reply({
      embeds: [{
        title: ":ping_pong: Ping!!Pong!!",
        description: "Ping値を計測してきました!!",
        fields: [
          { name: "WebSocket Speed", value: websocketPingMsg },
          { name: "APIレイテンシ", value: apiLatencyMsg }
        ],
        color: "RANDOM",
        timestamp: new Date()
      }]
    });
  }
}