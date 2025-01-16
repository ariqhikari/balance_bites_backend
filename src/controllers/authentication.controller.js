const user_model = require("../databases/models/user.model");
const { api_response } = require("../libs/response.lib");
const { deleteFile } = require("../libs/storage.lib");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v1 } = require("uuid");

const login = async (req, res) => {
  try {
    const user = await user_model.findOne({
      where: { email: req.body.email },
    });

    if (!user)
      return api_response(404, res, req, {
        status: false,
        message: "User not found.",
      });

    if (!bcrypt.compareSync(req.body.password, user.password))
      return api_response(401, res, req, {
        status: false,
        message: "Email or password not match.",
      });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return api_response(200, res, req, {
      status: true,
      message: "Success login account user.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return api_response(401, res, req, {
      status: false,
      message: error.message || "Failed login account user.",
    });
  }
};

const register = async (req, res) => {
  try {
    req.body.id = `USR-${v1()}`;
    req.body.password = bcrypt.hashSync(req.body.password);
    req.body.age = parseInt(req.body.age);
    const user = await user_model.create(req.body);

    return api_response(201, res, req, {
      status: true,
      message: "Success register account user.",
      data: {
        user,
      },
    });
  } catch (error) {
    deleteFile(`${process.cwd()}/storage/avatars/${req.body.avatar}`);

    return api_response(400, res, req, {
      status: false,
      message: error.message || "Failed register account user.",
    });
  }
};

const verify = async (req, res) => {
  try {
    const user = await user_model.findOne({
      where: { id: jwt.decode(req.headers.token).id },
    });

    return api_response(200, res, req, {
      status: false,
      message: "Succes verify account user.",
      data: {
        user,
      },
    });
  } catch (error) {
    return api_response(400, res, req, {
      status: false,
      message: error.message || "Failed verify account user.",
    });
  }
};

module.exports = {
  login,
  register,
  verify,
};

// {
//   "header": {
//       "time_request": "2025-01-16T09:22:38.338Z",
//       "ip_address": "::1"
//   },
//   "body": {
//       "status": true,
//       "message": "Success login account user.",
//       "data": {
//           "user": {
//               "id": "USR-4edfe8f0-d248-11ef-90cb-511daf7122f0",
//               "name": "Ariq",
//               "email": "ariq@gmail.com",
//               "password": "$2a$10$5vgRP/D7mfHLkRMD5qN.Z.w7ajfbLfbPkNO9.m8AZRmn4h1hh8dAu",
//               "createdAt": "2025-01-14T07:22:27.000Z",
//               "updatedAt": "2025-01-14T07:22:27.000Z"
//           },
//           "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IlVTUi00ZWRmZThmMC1kMjQ4LTExZWYtOTBjYi01MTFkYWY3MTIyZjAiLCJpYXQiOjE3MzcwMTkzNTgsImV4cCI6MTczNzEwNTc1OH0.jyXPZin2zcP7KC0MzPk-4WNizme86I72j-XaL5IclWE"
//       }
//   }
// }

// {
//   "header": {
//       "time_request": "2025-01-16T09:30:07.706Z",
//       "ip_address": "::1"
//   },
//   "body": {
//       "status": true,
//       "message": "Success register account user.",
//       "data": {
//           "user": {
//               "name": "Tes",
//               "email": "tes@gmail.com",
//               "password": "$2a$10$hB0W81qydL4Befba262ghO7HOahLqMgcEzPvUs6zmLL4zFspH1ysi",
//               "id": "USR-79811520-d3ec-11ef-b026-87b961b1c001",
//               "updatedAt": "2025-01-16T09:30:07.696Z",
//               "createdAt": "2025-01-16T09:30:07.696Z"
//           }
//       }
//   }
// }

// {
//   "header": {
//       "time_request": "2025-01-16T09:30:54.672Z",
//       "ip_address": "::1"
//   },
//   "body": {
//       "status": false,
//       "message": "Succes verify account user.",
//       "data": {
//           "user": {
//               "id": "USR-4edfe8f0-d248-11ef-90cb-511daf7122f0",
//               "name": "Ariq",
//               "email": "ariq@gmail.com",
//               "password": "$2a$10$5vgRP/D7mfHLkRMD5qN.Z.w7ajfbLfbPkNO9.m8AZRmn4h1hh8dAu",
//               "createdAt": "2025-01-14T07:22:27.000Z",
//               "updatedAt": "2025-01-14T07:22:27.000Z"
//           }
//       }
//   }
// }
