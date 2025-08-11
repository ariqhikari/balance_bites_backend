const Sequilize = require("sequelize");

require("dotenv").config();

// const sequilize = new Sequilize(process.env.DB_URL, "bb_user", "passwordku", {
//   host: "localhost",
//   dialect: "mysql",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// });

const sequilize = new Sequilize(process.env.DB_URL, "root", "root", {
  host: "localhost",
  dialect: "mysql",
  dialectOptions: {
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = {
  sequilize,
  Sequilize,
};
