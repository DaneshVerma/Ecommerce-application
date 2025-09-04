const Redis = require("ioredis");

const redis = new Redis({
  port: 11032,
  host: "redis-11032.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",
  password: "9hA24Wo7g2stLwBEzYwzvDXkz8DrAqrW",
});

redis.on("connect", () => {
  console.log("redis connected succesfully");
});

module.exports = redis;
