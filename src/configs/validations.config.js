const { check } = require("express-validator");

const register = [
  check("name").notEmpty().withMessage("Name is required."),
  check("email").notEmpty().withMessage("Email is required."),
  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6, max: 24 })
    .withMessage("Password must be more than 6 and less than 24 characters."),
];

const login = [
  check("email").notEmpty().withMessage("Email is required."),
  check("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6, max: 24 })
    .withMessage("Password must be more than 6 and less than 24 characters."),
];

const calculateCalories = [
  check("gender").notEmpty().withMessage("Gender is required."),
  check("age").notEmpty().withMessage("Age is required.").isLength({ min: 0 }),
  check("height")
    .notEmpty()
    .withMessage("Height is required.")
    .isLength({ min: 0 }),
  check("weight")
    .notEmpty()
    .withMessage("Weight is required.")
    .isLength({ min: 0 }),
];

module.exports = {
  login,
  register,
  calculateCalories,
};
