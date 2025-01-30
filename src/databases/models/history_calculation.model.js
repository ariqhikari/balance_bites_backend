const db_config = require("../index.database");

const model = db_config.sequilize.define(
  "history_calculation",
  {
    id: {
      type: db_config.Sequilize.DataTypes.STRING,
      primaryKey: true,
    },
    userId: {
      type: db_config.Sequilize.DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: db_config.Sequilize.DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: db_config.Sequilize.DataTypes.INTEGER,
      allowNull: false,
    },
    height: {
      type: db_config.Sequilize.DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: db_config.Sequilize.DataTypes.INTEGER,
      allowNull: false,
    },
    calorie: {
      type: db_config.Sequilize.DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: db_config.Sequilize.DataTypes.TEXT,
      allowNull: false,
    },
    activityRecommendations: {
      type: db_config.Sequilize.DataTypes.JSON,
      allowNull: false,
    },
    mealRecommendations: {
      type: db_config.Sequilize.DataTypes.JSON,
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = model;
