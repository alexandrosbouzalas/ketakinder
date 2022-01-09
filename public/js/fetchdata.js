const redis = require("redis");

const { TeamSpeak } = require("ts3-nodejs-library");

const redisPort = process.env.port || 6379;
const redisClient = redis.createClient(redisPort);

TeamSpeak.connect({
  host: "localhost",
  queryport: 10011,
  serverport: 9987,
  username: "serveradmin",
  password: "Test123",
  nickname: "NodeJS Query Framework",
})
  .then(async (teamspeak) => {
    const clients = await teamspeak.clientList({ clientType: 0 });

    const channels = await teamspeak.channelList();

    let data = { clients: clients, channels: channels };

    data = JSON.stringify(data);

    redisClient.setex("tsdata", 120, data);

    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
  });
