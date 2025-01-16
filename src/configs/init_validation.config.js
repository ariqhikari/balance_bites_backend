const { api_response } = require("../libs/response.lib")

const { validationResult } = require("express-validator")

const init = (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return api_response(402, res, req, {
            status: false,
            message: "Invalid input validations.",
            validations: errors
        })
    }

    next()
}

module.exports = init