const weeklyLogController = require("../controllers/weeklyLog");

module.exports = {
  prefix: "/weeklyLog",
  anonymity: [],
  normal: [
    {
      method: "post",
      path: "/week",
      action: weeklyLogController.getByWeek
    },
    {
      method: "post",
      path: "/weekRange",
      action: weeklyLogController.getByWeekRange
    },
    // {
    //   method: "post",
    //   path: "/add",
    //   action: weeklyLogController.addReport
    // },
    {
      method: "post",
      path: "/addOrUpdate",
      action: weeklyLogController.updateReport
    }
  ]
};
