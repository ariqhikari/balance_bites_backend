const { api } = require("../../configs/prefix.config");
const {
  register,
  login,
  verify,
} = require("../../controllers/authentication.controller");
const init_validation = require("../../configs/init_validation.config");
const {
  register: register_validation,
  login: login_validation,
} = require("../../configs/validations.config");
const auth_middleware = require("../../middlewares/authentication.middleware");

const express = require("express");
const router = express.Router();

router.post(
  `${api}/auth/login`,
  login_validation,
  init_validation,
  (req, res) => login(req, res)
);

router.post(
  `${api}/auth/register`,
  register_validation,
  init_validation,
  (req, res) => register(req, res)
);

router.get(`${api}/auth/verify`, auth_middleware, (req, res) =>
  verify(req, res)
);

module.exports = router;
