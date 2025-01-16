const { api } = require("../../configs/prefix.config");
const {
  calculateCalories,
} = require("../../controllers/calculator.controller");
const init_validation = require("../../configs/init_validation.config");
const {
  calculateCalories: calculate_calories_validation,
} = require("../../configs/validations.config");
const auth_middleware = require("../../middlewares/authentication.middleware");

const express = require("express");
const router = express.Router();

router.post(
  `${api}/calculate-calories`,
  auth_middleware,
  calculate_calories_validation,
  init_validation,
  (req, res) => calculateCalories(req, res)
);

module.exports = router;
