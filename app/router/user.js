const userController = require("../controllers/user");

module.exports = {
  prefix: "/user",
  anonymity: [
    {
      method: "post",
      path: "/signup",
      action: userController.signup
    },
    {
      method: "post",
      path: "/login",
      action: userController.login
    },
    {
      method: "get",
      path: "/autoLogin",
      action: userController.autoLogin
    },
    {
      method: "all",
      path: "/logout",
      action: userController.logout
    },
    {
      method: "post",
      path: "/sendResetPwdMail",
      action: userController.sendResetPwdMail
    },
    {
      method: "post",
      path: "/resetPwd",
      action: userController.resetPwd
    }
  ],
  normal: [
    {
      method: "get",
      path: "/list",
      action: userController.getUserList
    },
    {
      method: "get",
      path: "/verifylog",
      action: userController.getLogList
    },
    {
      method: "post",
      path: "/verify",
      action: userController.verifyUser
    },
    {
      method: "post",
      path: "/remove",
      action: userController.removeUser
    },
    {
      method: "post",
      path: "/update",
      action: userController.updateUser
    },
    {
      method: "post",
      path: "/updatePwd",
      action: userController.updatePwd
    }
  ]
};
