const api_response = (status, res, req, body) => {
    return res.status(status).json({
        header: {
            time_request: new Date(),
            ip_address: req.connection.remoteAddress
        },
        body
    })
}

module.exports = {
    api_response
}