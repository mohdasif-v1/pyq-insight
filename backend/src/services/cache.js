const Redis = require("ioredis");

// Redis is optional: without REDIS_URL every call is a harmless no-op
const client = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

module.exports = {
  async get(key) {
    const raw = client && (await client.get(key));
    return raw ? JSON.parse(raw) : null;
  },
  async set(key, value, ttlSeconds = 600) {
    if (client) await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  },
};
