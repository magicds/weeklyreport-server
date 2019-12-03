const userController = require('../controllers/user');

module.exports = {
  prefix: '/user',
  anonymity: [{
      method: 'post',
      path: '/signup',
      action: userController.signup
    },
    {
      method: 'post',
      path: '/login',
      action: userController.login
    },
    {
      method: 'get',
      path: '/autoLogin',
      action: userController.autoLogin
    },
    {
      method: 'all',
      path: '/logout',
      action: userController.logout
    }
  ],
  normal: [{
    method: 'get',
    path: '/list',
    action: userController.getUserList
  }]
}