const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { COOKIE_TOKEN_KEY, COOKIE_UID_KEY } = require("../../config.js");
const UserModel = require("../models/user");
const VerifyLog = require("../models/verifyLog");
const Department = require("../models/department");
const response = require("../utils/response");
const { setLoinCookie, clearLoinCookie } = require("../utils/util");

const { sendTypedEmail } = require("../mail/sendMail.js");

const SALT_WORK_FACTOR = 10;

// 用户注册，邮件给 部门 leader + 管理员
async function sendVerifyRequestMail(user) {
  const { name, dept } = user;
  const adminUsers = await UserModel.where("role").gte(1000);
  const department = await Department.findById(dept).populate("leader");
  const adminIds = {};
  const mailUsers = adminUsers.map(u => {
    adminIds[u.id] = true;
    return {
      id: u.id,
      name: u.name,
      email: u.email
    };
  });
  if (department && department.leader && !adminIds[department.leader.id]) {
    mailUsers.push({
      id: department.leader.id,
      name: department.leader.name,
      email: department.leader.email
    });
  }
  if (mailUsers.length) {
    sendTypedEmail({
      users: mailUsers,
      type: "signup",
      verifyUsername: name
    });
  }
}

// 验证通过后通知用户可登录
async function sendUserNowLogin(user) {
  sendTypedEmail({
    users: [user],
    type: "verify"
  });
}

const userController = {
  /**
   * 检查是否登录
   *
   * @param {Koa.Context} ctx koa ctx
   * @returns {Promise<Boolean>}
   * @memberof baseController
   */
  async checkLogin(ctx /** @types Koa.Context */) {
    let token = ctx.cookies.get(COOKIE_TOKEN_KEY);
    let uid = ctx.cookies.get(COOKIE_UID_KEY);
    // todo: Is really need check by db query every times ?
    try {
      if (!token || !uid) return false;
      const user = await UserModel.findById(uid)
        .populate("dept")
        .populate("group");
      if (!user) return false;

      let decodeData;
      try {
        decodeData = jwt.verify(token, user.pwdSalt);
      } catch (error) {
        console.error(error);
        return false;
      }
      if (decodeData.uid === uid && user.role > 0) {
        ctx.$uid = uid;
        ctx.$auth = true;
        ctx.$user = user;
        return true;
      }
      clearLoinCookie(ctx);
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
  async signup(ctx) {
    let { name, email, pwd } = ctx.request.body;
    if (!(name && email && pwd)) {
      return ctx.throw(400);
    }
    try {
      // 先验证是否存在
      const aimUser = await UserModel.findOne({
        $or: [
          // {
          //     name
          // },
          {
            email
          }
        ]
      });
      if (aimUser) {
        // 已经存在
        return (ctx.response.body = {
          code: "200",
          data: null,
          message: " 用户已经存在！"
        });
      }
      // 不存在
      const { extInfo, dept, group, gender } = ctx.request.body;
      const signupData = { extInfo, name, email, gender };
      dept && (signupData.dept = dept);
      group && (signupData.group = group);

      const user = new UserModel(signupData);
      // 密码处理
      const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      user.pwdSalt = salt;
      const hash = await bcrypt.hash(pwd, salt);
      user.pwd = hash;

      await user.save();
      const log = new VerifyLog({
        type: "signup",
        info: `${user.name} 新注册进入周报系统，请求验证。`,
        operator: user.id,
        targetUser: user.id,
        date: +new Date()
      });
      await log.save();

      // 邮件通知管理员、部门leader等
      try {
        // 后台发送即可 无需等待 也不关注结果
        sendVerifyRequestMail(user);
      } catch (error) {
        console.error(error);
      }

      return (ctx.response.body = response({ message: "注册成功" }));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  },
  async autoLogin(ctx) {
    const isLogin = await userController.checkLogin(ctx);

    if (isLogin) {
      setLoinCookie(ctx, ctx.$uid, ctx.$user.pwdSalt);
      return (ctx.response.body = response(ctx.$user.getClientData()));
    }
    return (ctx.response.body = response(null, 401));
  },
  async login(ctx) {
    let { name, email, pwd } = ctx.request.body;
    const aimUser = await UserModel.findOne({
      $or: [
        {
          name
        },
        {
          email
        }
      ]
    })
      .populate("dept")
      .populate("group");
    if (!aimUser) {
      return ctx.throw(401, new Error("user is not existed!"));
      // return ctx.response.body = response(null, 404, 'user is not existed');
    }
    if (aimUser.role <= 0) {
      return ctx.throw(401, new Error("您还未经过认证，无法登录"));
    }

    if (await aimUser.comparePwd(pwd, aimUser.pwd)) {
      setLoinCookie(ctx, aimUser._id, aimUser.pwdSalt);
      return (ctx.response.body = response(
        aimUser.getClientData(),
        200,
        "login success!"
      ));
    } else {
      return ctx.throw(401, "the username and password not match!");
      // return ctx.response.body = response(null, 405, 'the username and password not match!');
    }
  },
  async logout(ctx) {
    clearLoinCookie(ctx);
    return (ctx.response.body = response("logout sussess"));
  },
  async getUserList(ctx) {
    // if (ctx.$user.role <= 10) {
    //     return ctx.throw(405, '权限不足，您无法获取！');
    // }
    const { unVerify, dept } = ctx.request.query;
    const cond = unVerify != "false" ? { role: 0 } : {};
    if (dept) {
      cond.dept = dept;
    }
    const list = await UserModel.find(cond)
      .populate("dept")
      .populate("group");

    if (!list || !list.length) return (ctx.response.body = response([]));

    const result = [];
    list.forEach(item => {
      result.push(item.getClientData());
    });

    return (ctx.response.body = response(result));
  },
  async verifyUser(ctx) {
    const { uid } = ctx.request.body;
    if (!uid) {
      return ctx.throw(400);
    }
    // 权限检查
    if (ctx.$user.role <= 100) {
      return ctx.throw(401, new Error("权限不足"));
    }
    const user = await UserModel.findByIdAndUpdate(
      uid,
      {
        role: 1
      },
      { new: true }
    );
    const log = new VerifyLog({
      type: "verify",
      info: `${ctx.$user.name} 通过了 ${user.name} 的验证请求`,
      operator: ctx.$user.id,
      targetUser: user.id,
      date: +new Date()
    });
    await log.save();

    try {
      // 发送验证成功的通知
      sendUserNowLogin(user);
    } catch (error) {}

    return (ctx.response.body = response(null));
  },
  async getLogList(ctx) {
    const list = await VerifyLog.find().sort({ date: "desc" });

    return (ctx.response.body = response(list || []));
  },
  async removeUser(ctx) {
    const { uid } = ctx.request.body;
    if (!uid) {
      return ctx.throw(400);
    }

    const user = await UserModel.findByIdAndRemove(uid);

    const log = new VerifyLog({
      type: "delete",
      info: `${ctx.$user.name} 删除了用户 ${user.name}`,
      operator: ctx.$user.id,
      targetUser: user.id,
      date: +new Date()
    });
    await log.save();

    return (ctx.response.body = response({}));
  }
};

module.exports = userController;
