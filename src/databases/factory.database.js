const user_seeder = require("./seeders/user.seeder");

const init = async () => {
  await user_seeder();
};

module.exports = init;
