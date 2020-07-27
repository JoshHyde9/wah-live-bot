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
const CHANNEL_ID = process.env.CHANNEL_ID;
const GUILD_ID = process.env.GUILD_ID;

// Initialise new client
const client = new Discord.Client({ disableMentions: "none" });

let guild;
let embed;

// Ready client
client.on("ready", () => {
  console.log(`${client.user.tag} is ready!`);
  client.user.setActivity("games most likely", {
    type: "STREAMING",
    url: `https://www.twitch.tv/${TWITCH_USERNAME}`,
  });
  guild = client.guilds.cache.find((guild) => guild.id === GUILD_ID);
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

  const { channel, created_at } = data.stream;

  if (channel.display_name !== TWITCH_USERNAME) {
    return;
  }

  const now = new Date();
  const streamStartTime = new Date(created_at);

  const timeBuffer = streamStartTime.setMinutes(
    streamStartTime.getMinutes() + 1
  );

  // If the stream start time + 1 minute is greater than the current time, send the announcement message
  if (timeBuffer >= now) {
    try {
      embed = new MessageEmbed()
        .setTitle(`${channel.display_name} is now live on Twitch!`)
        .setURL(channel.url)
        .setDescription(`**Playing:** ${channel.game} | ${channel.status}`)
        .setThumbnail(channel.logo)
        .setImage(data.stream.preview.large)
        .setColor("#800080")
        .setTimestamp();

      const announceChannel = guild.channels.cache.find(
        (channel) => channel.id === CHANNEL_ID
      );

      announceChannel.send("@everyone", { embed });
    } catch (err) {
      console.error(err);
    }
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
