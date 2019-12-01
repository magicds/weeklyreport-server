const groupController = require("../controllers/group");

module.exports = {
  prefix: "/group",
  anonymity: [],
  normal: [
    {
      method: "get",
      path: "/list",
      action: groupController.getAll
    },
    {
      method: "post",
      path: "/add",
      action: groupController.addGroup
    },
    {
      method: "post",
      path: "/update",
      action: groupController.updateGroup
    },
    {
      method: "post",
      path: "/remove",
      action: groupController.deleteGroup
    }
  ]
};
