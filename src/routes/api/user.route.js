const { api } = require("../../configs/prefix.config");
const auth_middleware = require("../../middlewares/authentication.middleware");
const {
  profile,
  update_profile,
} = require("../../controllers/user.controller");

const express = require("express");

const router = express.Router();

router.get(`${api}/user/profile`, auth_middleware, (req, res) =>
  profile(req, res)
);

module.exports = router;
