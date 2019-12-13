const nodemailer = require("nodemailer");
const config = require("../../config.js");

if (config.SMTP_HOST === undefined) {
  console.error("SMTP_HOST 未配置，获取到值为" + config.SMTP_HOST);
}
if (config.SMTP_PORT === undefined) {
  console.error("SMTP_PORT 未配置，获取到值为" + config.SMTP_PORT);
}
if (config.SMTP_SECURE === undefined) {
  console.error("SMTP_SECURE 未配置，获取到值为" + config.SMTP_SECURE);
}
if (config.SMTP_USER === undefined) {
  console.error("SMTP_USER 未配置，获取到值为" + config.SMTP_USER);
}
if (config.SMTP_PWD === undefined) {
  console.error("SMTP_PWD 未配置，获取到值为" + config.SMTP_PWD);
}

const transporter = nodemailer.createTransport(
  {
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PWD
    }
  },
  {
    from: {
      name: "新点前端周报",
      address: config.SMTP_USER
    }
  }
);
transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});
const MAIL_TITLE = {
  fri: "[新点前端]周报填写提醒",
  sat: "[新点前端]周报填写提醒",
  sun: "[新点前端]周报填写提醒",
  signup: "[新点前端]新成员注册验证提醒",
  verify: "[新点前端]验证通过"
};
const getMailContent = (type, injectedData) => {
  let content = "";
  switch (type) {
    case "fri":
      content = `
              <p>${injectedData.name}:</p>
              <p>您好，今天又是周五啦，请记得填写本周周报：</p>
              <p><a href="https://fe.epoint.com.cn/weeklyreport-new/main/input" target="_black">https://fe.epoint.com.cn/weeklyreport-new/main/input</a></p>
              <p>——来自新点前端周报，预祝您周末愉快！</p>
          `;
      break;
    case "sat":
      content = `
              <p>${injectedData.name}:</p>
              <p>您好，<span style="color:#f1a325;">今天已经是周六了，您还没填写本周周报</span>，请及时点击下方链接进行填写：</p>
              <p><a href="https://fe.epoint.com.cn/weeklyreport-new/main/input" target="_black">https://fe.epoint.com.cn/weeklyreport-new/main/input</a></p>
              <p>——来自新点前端周报，祝您周末愉快！</p>
          `;
      break;
    case "sun":
      content = `
              <p>${injectedData.name}:</p>
              <p>您好，<span style="color:#ea644a;">今天已经是周日了，您还没填写本周周报</span>，请点击下方链接进入填写，务必在今天完成填写</p>
              <p><a href="https://fe.epoint.com.cn/weeklyreport-new/main/input" target="_black">https://fe.epoint.com.cn/weeklyreport-new/main/input</a></p>
              <p>再忙也不要忘记填写周报哦！</p>
          `;
      break;
    case "signup":
      content = `
              <p>${injectedData.name}:</p>
              <p>您好，<span style="color:#ea644a;">${injectedData.verifyUsername}</span>，已经注册进入周报系统。</p> <p><span style="color:#ea644a;">如果您确认 TA 是团队成员</span>，请及时点击下方链接通过其验证请求（验证通过的用户才能正常使用周报系统）。</p><p><a href="https://fe.epoint.com.cn/weeklyreport-new/main/verify" target="_black">https://fe.epoint.com.cn/weeklyreport-new/main/verify</a></p>
          `;
      break;
    case "verify":
      content = `
                <p>${injectedData.name}:</p>
                <p>您好，您已经通过了认证，欢迎进去前端研发部。</p>
                <p>您现在可以登录了。</p>
                <p><a href="https://fe.epoint.com.cn/weeklyreport-new/login" target="_black">https://fe.epoint.com.cn/weeklyreport-new/login</a></p>
            `;
      break;
    default:
      break;
  }
  return content;
};

const sendTypedEmail = data => {
  console.log("nodemailer 发送邮件:");
  let { users, type, verifyUsername } = data;
  if (!users || !users.length) {
    console.error("未获取到收件人");
    return;
  }

  const len = users.length;
  let i = 0;

  sendOneMail(users[i]);

  function sendOneMail(user) {
    return transporter
      .sendMail({
        to: user.email,
        subject: MAIL_TITLE[type],
        html: getMailContent(type, {
          name: user.name,
          verifyUsername: verifyUsername
        })
      })
      .then(res => {
        console.log(
          `【mial】【${type}】to ${user.name}(${user.email}) already send`
        );
        if (++i < len) {
          return sendOneMail(users[i]);
        }
      })
      .catch(err => {
        console.error(
          `【mial】【${type}】 send to ${user.name}(${user.email}) failed`
        );
        console.error(err);
        if (++i < len) {
          return sendOneMail(users[i]);
        }
      });
  }
};

module.exports = {
  sendTypedEmail,
  sendMail(opt) {
    return transporter.sendMail(opt);
  }
};

// todo
// 1. 用户注册，邮件给 部门 leader + 管理员
// 2. 用户认证通过则邮件给目标用户 通知可登录
// 定时提醒 周五、周六、周日
