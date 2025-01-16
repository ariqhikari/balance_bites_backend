const fs = require("fs")

const deleteFile = (path) => {
    try {
        fs.unlinkSync(path)
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    deleteFile
}