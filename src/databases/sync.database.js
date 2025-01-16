const user = require("./models/user.model");

const sync = () => {
  user.sync();
};

module.exports = sync;
