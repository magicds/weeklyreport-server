module.exports = (data, code = 200, message = '') => {
    return {
        data,
        code,
        message
    }
}