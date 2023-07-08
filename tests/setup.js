jest.setTimeout(500000);

const mongoose = require("mongoose");
require("../models/User");

const keys = require("../config/keys");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

afterAll(async () => {
  await mongoose.disconnect();
});
