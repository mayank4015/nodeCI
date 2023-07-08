const mongoose = require("mongoose");
const redis = require("redis");
const keys = require("../config/keys");

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name,
  });
  const client = redis.createClient(keys.redisUrl);
  await client.connect();

  const cacheValue = await client.HGET(this.hashKey, key);

  if (cacheValue) {
    console.log("from CACHE");
    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }
  console.log("from MONGODB");
  const result = await exec.apply(this, arguments);

  client.HSET(this.hashKey, key, JSON.stringify(result), "EX", 10);

  // await client.disconnect();

  return result;
};

module.exports = {
  async clearHash(hashKey) {
    const client = redis.createClient();
    await client.connect();
    client.del(JSON.stringify(hashKey));
  },
};
