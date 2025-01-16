const user_model = require("../databases/models/user.model")

const check_email = async (email) => {
    try {
        const users = await user_model.findAll({ where: { email } })

        return Array.isArray(users) && users.length ? Promise.reject("Email already exist.") : true
    } catch (error) {
        console.log(error)
        return Promise.reject("Email already exist.")
    }
}

module.exports = {
    check_email
}