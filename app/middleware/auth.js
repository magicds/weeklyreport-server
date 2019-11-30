module.exports = async function (ctx, next) {
    if (ctx.path.indexOf() != -1) {
        ctx.$auth = true;
    }
    next();
}