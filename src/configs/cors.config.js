const whitelist = ["http://localhost:3000"];

const option = {
  origin: (origin, callback) => {
    // if (!origin || whitelist.includes(origin)) return callback(null, true);

    // return new Error("Error not allowed by CORS.");
    return callback(null, true);
  },
};

module.exports = option;
