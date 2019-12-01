const jwt = require("jsonwebtoken");

const { COOKIE_TOKEN_KEY, COOKIE_UID_KEY } = require("../../config.js");

/**
 * 设置登录成功cookie
 * @param {Object} ctx koa ctx
 * @param {String} uid userid
 * @param {String} pwdSalt userpwd salt 用户的密码盐
 * @param {Number} expreDay expreDay cookie 有效期 单位：天
 */
exports.setLoinCookie = function setLoinCookie(
  ctx,
  uid,
  pwdSalt,
  expreDay = 10
) {
  let token = jwt.sign(
    {
      uid: uid
    },
    pwdSalt,
    {
      expiresIn: `${expreDay} days`
    }
  );
  let expireDate = new Date(+new Date() + 86400000 * expreDay);
  ctx.cookies.set(COOKIE_TOKEN_KEY, token, {
    expires: expireDate,
    httpOnly: true
  });
  ctx.cookies.set(COOKIE_UID_KEY, uid, {
    expires: expireDate,
    httpOnly: true
  });
};

exports.clearLoinCookie = function clearLoinCookie(ctx) {
  ctx.cookies.set(COOKIE_TOKEN_KEY, "", {
    expires: null,
    httpOnly: true
  });
  ctx.cookies.set(COOKIE_UID_KEY, "", {
    expires: null,
    httpOnly: true
  });
};
