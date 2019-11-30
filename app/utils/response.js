module.exports = (data, code = 200, msg = '') => {
    return {
        data,
        code,
        msg
    }
}