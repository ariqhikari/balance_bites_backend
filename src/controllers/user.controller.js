const user_model = require("../databases/models/user.model");
const { api_response } = require("../libs/response.lib");

const jwt = require("jsonwebtoken");

const profile = async (req, res) => {
  try {
    const user = await user_model.findOne({
      where: { id: jwt.decode(req.headers.token).id },
    });

    return api_response(200, res, req, {
      status: true,
      message: "Success get data profile.",
      data: {
        user,
      },
    });
  } catch (error) {
    return api_response(400, res, req, {
      status: false,
      message: error.message || "Failed get data profile.",
    });
  }
};

module.exports = {
  profile,
};
