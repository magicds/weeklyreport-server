const WeeklyLog = require("../models/weeklyLog");
const response = require("../utils/response");

const weeklyLogController = {
  /**
   * 根据周查询所有 week 必填 user 、 group 、 dept 可选
   *
   * @param {*} ctx
   * @returns
   */
  async getByWeek(ctx) {
    // if (ctx.$user.role <= 100)
    // todo 权限校验
    const { week, dept, group } = ctx.request.body;

    const condition = {};
    if (week) {
      condition.week = week;
    }
    if (dept) {
      condition.dept = dept;
    }
    if (dept) {
      condition.dept = dept;
    }
    const list = await WeeklyLog.find(condition).sort({
      dept: "asc",
      group: "asc"
    });
    return (ctx.response.body = response(list || []));
  },
  /**
   * 根据周日期范围查询 start end 必填 user 、 group 、 dept 可选
   *
   * @param {*} ctx
   */
  async getByWeekRange(ctx) {
    const { start, end, user, dept, group } = ctx.request.body;
    const reg = /^\d{4}-\d{2}-\d{2}$/;
    if (!(start && end && reg.test(start) && reg.test(end))) {
      return ctx.throw(400, "范围格式不正常");
    }
    const condition = {
      startDate: { $gte: new Date(...start.split("-")) },
      endDate: { $lte: new Date(...end.split("-")) }
    };
    if (user) {
      condition.user = user;
    }
    if (dept) {
      condition.dept = dept;
    }
    if (group) {
      condition.group = group;
    }

    const list = await WeeklyLog.find(condition).sort({
      dept: "asc",
      group: "asc",
      startDate: "asc"
    });

    return (ctx.response.body = response(list || []));
  },
  /**
   * 新增周报
   * @param {*} ctx 
   */
  async addReport(ctx) {
    const { week, user, dept, group, report } = ctx.request.body;

    if (!(week && user && dept && group && report)) {
      return ctx.throw(400);
    }

    const wl = new WeeklyLog(week, user, dept, group, report);

    await wl.save();

    return (ctx.response.body = response(wl));
  },
  /**
   * 更新周报
   *
   * @param {*} ctx
   * @returns
   */
  async updateReport(ctx) {
    const { week, user, dept, group, report, reportId } = ctx.request.body;

    if (!(week && user && dept && group && report && reportId)) {
      return ctx.throw(400);
    }

    const wl = await WeeklyLog.findByIdAndUpdate(
      reportId,
      {
        week,
        user,
        dept,
        group,
        report
      },
      {
        new: true
      }
    );

    return (ctx.response.body = response(wl));
  }
};

module.exports = weeklyLogController;
