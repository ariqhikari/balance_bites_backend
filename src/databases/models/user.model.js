const db_config = require("../index.database");

const model = db_config.sequilize.define(
  "user",
  {
    id: {
      type: db_config.Sequilize.DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: db_config.Sequilize.DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: db_config.Sequilize.DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: db_config.Sequilize.DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = model;
