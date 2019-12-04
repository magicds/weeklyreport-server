const groupController = require("../controllers/group");

module.exports = {
  prefix: "/group",
  anonymity: [
    {
      method: "get",
      path: "/list",
      action: groupController.getAll
    }
  ],
  normal: [
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
