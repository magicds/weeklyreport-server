const jwt = require("jsonwebtoken");
const { COOKIE_TOKEN_KEY, COOKIE_UID_KEY } = require("../../config.js");
const UserModel = require("../models/user");
const VerifyLog = require("../models/verifyLog");
const Department = require("../models/department");
const response = require("../utils/response");
const { setLoinCookie, clearLoinCookie } = require("../utils/util");

const { sendTypedEmail, sendMail } = require("../mail/sendMail.js");

const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;

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
      await user.setPwd(pwd);
      // const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
      // user.pwdSalt = salt;
      // const hash = await bcrypt.hash(pwd, salt);
      // user.pwd = hash;

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
    const { unVerify, dept } = ctx.request.query;
    const cond = unVerify === "true" ? { role: 0 } : {};
    if (dept) {
      cond.dept = dept;
    }
    const list = await UserModel.find(cond)
      .populate("dept")
      .populate("group")
      .sort({ index: "asc" });

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
      info: `${ctx.$user.name} 通过了 ${user.name} 的验证请求。`,
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
    let limit = parseInt(ctx.request.query.limit, 10) || 20;
    const list = await VerifyLog.find()
      .sort({ date: "desc" })
      .limit(limit);

    return (ctx.response.body = response(list || []));
  },
  async removeUser(ctx) {
    const { uid } = ctx.request.body;
    if (!uid) {
      return ctx.throw(400, new Error("请求参数不完整"));
    }

    const user = await UserModel.findById(uid);

    if (ctx.$user.role < user.role) {
      return ctx.throw(400, new Error("您只能删除权限小于自己的用户"));
    }

    await user.remove();

    const log = new VerifyLog({
      type: "delete",
      info: `${ctx.$user.name} 删除了用户 ${user.name}`,
      operator: ctx.$user.id,
      targetUser: user.id,
      date: +new Date()
    });
    await log.save();

    return (ctx.response.body = response({}));
  },
  async updateUser(ctx) {
    const { id } = ctx.request.body;
    if (!id) {
      return ctx.throw(400, new Error("请求参数不完整"));
    }

    // 只能修改自己的信息 或 组长以上才能修改信息
    if (!(ctx.$user.role >= 10 || ctx.$user.id == id)) {
      return ctx.throw(401, new Error("无权修改"));
    }

    const user = await UserModel.findById(id);
    // const { email, name, extInfo, dept, group, gender } = ctx.request.body;
    const props = {};
    ["email", "name", "extInfo", "dept", "group", "gender"].forEach(k => {
      const v = ctx.request.body[k];
      if (v !== undefined) {
        props[k] = v;
      }
    });
    user.set(props);
    await user.save();
    await user
      .populate("dept")
      .populate("group")
      .execPopulate();

    return (ctx.response.body = response(user.getClientData()));
  },
  async sendResetPwdMail(ctx) {
    const { email } = ctx.request.body;
    if (!email) {
      return ctx.throw(400, new Error("请求参数不完整"));
    }
    const user = await UserModel.findOne({ email });

    const DAYS = 1;

    // 重置密码连接 1 天内有效
    const endDate = new Date(
      +new Date() + DAY_MILLISECONDS * DAYS
    ).toISOString();

    const token = jwt.sign(
      {
        key: user.pwd,
        endDate: endDate
      },
      user.pwdSalt,
      {
        expiresIn: `${DAYS} days`
      }
    );

    const link = `https://fe.epoint.com.cn/weeklyreport-new/resetPwd?token=${global.encodeURIComponent(
      token
    )}&date=${global.encodeURIComponent(endDate)}&uid=${global.encodeURIComponent(uid)}`;

    const mailedRes = await sendMail({
      to: user.email,
      subject: "[新点前端]密码重置",
      html: `
            <p>${user.name}:</p>
            <p>您正在申请重置新点其前端周报的密码，如确认是您自己的操作，请点击以下链接继续。（链接24h内有效）</p>
            <p><a href="${link}" target="_blank>${link}</a></p>
            <p>若链接无法点击，请复制以下内容到浏览器地址栏打开：<br/>${link}</p>
            `
    }).then(res => {
      console.log(`${user.name}请求重置密码的邮件已经发送成功`);
    });

    return (ctx.response.body = response(mailedRes));
  },
  async resetPwd(ctx) {
    const { token, newPwd, uid } = ctx.request.body;
    if (!token || !newPwd || uid) {
      return ctx.throw(400, new Error("请求参数错误"));
    }

    const user = await UserModel.findById(uid);

    const data = jwt.verify(token, user.pwdSalt);

    if (!data || data.key != user.pwd) {
      return ctx.throw(400, new Error("无法有效确认您的身份，无法重置密码"));
    }
    // check date
    const tokenEndDate = +new Date(data.endDate);
    if (+new Date() > tokenEndDate) {
      return ctx.throw(400, new Error("您的链接已过期，无法重置密码"));
    }

    await user.setPwd(newPwd);

    return (ctx.response.body = response({
      message: "密码重置成功，请使用新密码登录"
    }));
  },
  /**
   * 修改密码
   */
  async updatePwd(ctx) {
    const { uid, oldPwd, newPwd } = ctx.request.body;
    if (!uid) {
      return ctx.throw(400, new Error("必须提供uid"));
    }
    const user = await UserModel.findById(uid);
    const isMatch = await user.comparePwd(oldPwd);
    if (!isMatch) {
      return ctx.throw(400, new Error("原始密码错误"));
    }

    await user.setPwd(newPwd);

    // 如果修改的是自己的密码 则token销毁
    if (uid === ctx.$uid) {
      clearLoinCookie();
    }

    return (ctx.response.body = response({ massage: "密码修改成功" }));
  }
};

module.exports = userController;
