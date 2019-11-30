// const Router = require('koa-router');
// const userRouter = new Router();
const userController = require('../controllers/user');
const loginRequire = require('../middleware/loginRequire');

// // 无须匿名调用的
// userRouter.post('/signup', userController.signup);
// userRouter.get('/signup', async (ctx) => {
//   ctx.response.body = 'method error'
// });
// userRouter.post('/login', userController.login);
// userRouter.post('/logout', userController.logout);

// // 验证中间件
// // userRouter.use('/*', loginRequire);
// // 必须登录的
// userRouter.get('/list', userController.getUserList);
// // userRouter.post('/list', userController.getUserList);

// module.exports = userRouter;


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