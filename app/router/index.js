const Router = require('koa-router');

const scoreCfgController = require('../controllers/schema');
const loginRequire = require('../middleware/loginRequire');

const userRouters = require("./user");
const scoreRouters = require('./score')
const router = new Router({
  prefix: '/perf/api'
});

// todo 抽取成方法一次自动处理完成

// 匿名的
userRouters.anonymity.forEach((item) => {
  router[item.method](userRouters.prefix + item.path, item.action);
});

// 登录验证
router.use(loginRequire);

// 需要登录的
userRouters.normal.forEach(item => {
  router[item.method](userRouters.prefix + item.path, item.action);
});
scoreRouters.normal.forEach(item => {
  router[item.method](scoreRouters.prefix + item.path, item.action);
});

module.exports = router;