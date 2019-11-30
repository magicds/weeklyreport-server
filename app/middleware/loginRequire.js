const checkLogin = require("../controllers/user").checkLogin;

module.exports = async (ctx, next) => {
    const isLogin = await checkLogin(ctx);
    if (!isLogin) {
        return ctx.throw(401, 'Unauthorized');
    }
    await next();
}