const Discord = require("discord.js");
const dayjs = require("dayjs");
const fetch = require("node-fetch");
require("dotenv").config(); // Import env vars

const MessageEmbed = Discord.MessageEmbed;

// Define env vars
const TWITCH_TOKEN = process.env.TWITCH_TOKEN;
const TWITCH_USER_ID = process.env.TWITCH_USER_ID;
const TWITCH_USERNAME = process.env.TWITCH_USERNAME;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Initialise new client
const client = new Discord.Client();

let guild;
let embed;

// Ready client
client.on("ready", () => {
  console.log(`${client.user.tag} is ready!`);
  client.user.setActivity("games most likely", {
    type: "STREAMING",
    url: `https://www.twitch.tv/${TWITCH_USERNAME}`,
  });
  guild = client.guilds.cache.find(
    (guild) => guild.id === "728230438702678070"
  );
});

const isWahLive = async () => {
  const response = await fetch(
    `https://api.twitch.tv/kraken/streams/${TWITCH_USER_ID}`,
    {
      headers: {
        Accept: "application/vnd.twitchtv.v5+json",
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${TWITCH_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  if (!data.stream) {
    return;
  }

  const { channel, preview, created_at, game } = data.stream;

  const now = new Date();
  const streamStartTime = new Date(created_at);

  const timeBuffer = streamStartTime.setMinutes(
    streamStartTime.getMinutes() + 2
  );

  if (channel.display_name !== TWITCH_USERNAME) {
    return;
  }

  if (timeBuffer >= now) {
    embed = new MessageEmbed()
      .setTitle(`${channel.display_name} is now live on Twitch!`)
      .setURL(channel.url)
      .setDescription(`**Playing:** ${game} | ${channel.status}`)
      .setImage(preview.large)
      .setFooter(`Stream started at: ${dayjs(created_at).format("h:mm a")}`)
      .setColor("#800080");

    const announceChannel = guild.channels.cache.find(
      (channel) => channel.id === "728417960250835040"
    );

    announceChannel.send(embed);
  }
};

client.on("message", (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.channel.type === "dm") {
    return;
  }
});

// Connect client to API and stuff
client.login(DISCORD_TOKEN).then(() => {
  // Check if Wah is live or not
  setInterval(() => {
    isWahLive();
  }, 60000);
});
