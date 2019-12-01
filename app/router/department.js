const deptController = require("../controllers/department");

module.exports = {
  prefix: "/dept",
  anonymity: [],
  normal: [
    {
      method: "get",
      path: "/list",
      action: deptController.getAll
    },
    {
      method: "post",
      path: "/add",
      action: deptController.addDepartment
    },
    {
      method: "post",
      path: "/update",
      action: deptController.updateDepartment
    },
    {
      method: "post",
      path: "/remove",
      action: deptController.deleteDepartment
    }
  ]
};
