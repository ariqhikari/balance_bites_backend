const { api_response } = require("../libs/response.lib");

const jwt = require("jsonwebtoken");

const init = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token)
      return api_response(404, res, req, {
        status: false,
        message: "Token authorization not found.",
      });

    if (!jwt.verify(token, process.env.JWT_SECRET))
      return api_response(401, res, req, {
        status: false,
        message: "Token expired.",
      });

    next();
  } catch (error) {
    return api_response(401, res, req, {
      status: false,
      message: "Token expired.",
    });
  }
};

module.exports = init;
