const response = require('../utils/response');
module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error(err);
        const code = err.statusCode || err.status || 500;
        ctx.response.status = code
        return ctx.response.body = response(null, code, err.message);
    }
}