const user = require("./models/user.model");
const product = require("./models/product.model");
const history_calculation = require("./models/history_calculation.model");

const sync = () => {
  user.sync();
  product.sync();
  history_calculation.sync();

  // User & History Calculation
  user.hasMany(history_calculation, {
    as: "history_calculations",
    foreignKey: "userId",
  });
};

module.exports = sync;
