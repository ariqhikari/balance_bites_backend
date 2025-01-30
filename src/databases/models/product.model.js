const db_config = require("../index.database");

const model = db_config.sequilize.define(
  "product",
  {
    id: {
      type: db_config.Sequilize.DataTypes.STRING,
      primaryKey: true,
    },
    idSpoonacular: {
      type: db_config.Sequilize.DataTypes.INTEGER,
      allowNull: false,
    },
    upc: {
      type: db_config.Sequilize.DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: db_config.Sequilize.DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: db_config.Sequilize.DataTypes.STRING,
      allowNull: false,
    },
    nutrition: {
      type: db_config.Sequilize.DataTypes.JSON,
      allowNull: false,
    },
    score: {
      type: db_config.Sequilize.DataTypes.JSON,
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = model;
