const Router = require("koa-router");

// const scoreCfgController = require('../controllers/schema');
const loginRequire = require("../middleware/loginRequire");

const userRouters = require("./user");
const deptRouters = require("./department");
const groupRouters = require("./group");
const weeklyLogRouters = require("./weeklyLog");
// const scoreRouters = require('./score');
const router = new Router({
  prefix: "/weeklyreport-new/api"
});

// todo 抽取成方法一次自动处理完成

// 匿名的
[userRouters, deptRouters, groupRouters, weeklyLogRouters].forEach(subRouter => {
  subRouter.anonymity.forEach(item => {
    router[item.method](subRouter.prefix + item.path, item.action);
  });
});

// 登录验证
router.use(loginRequire);

// 需要登录的
[userRouters, deptRouters, groupRouters, weeklyLogRouters].forEach(subRouter => {
  subRouter.normal.forEach(item => {
    router[item.method](subRouter.prefix + item.path, item.action);
  });
});

module.exports = router;
