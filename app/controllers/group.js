const Group = require("../models/group");
const response = require("../utils/response");

const groupController = {
  async getAll(ctx) {
    try {
      const list = await Group.find().populate('dept').sort({ index: "asc" });
      return (ctx.response.body = response(list || []));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  },
  async addGroup(ctx) {
    const { name, leader } = ctx.request.body;
    const props = {
      name,
      dept: ctx.request.body.dept
    };
    if (leader) {
      props.leader = leader;
    }
    try {
      const dept = new Group(props);
      await dept.save();

      return (ctx.response.body = response(dept));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  },
  async updateGroup(ctx) {
    const { id, data } = ctx.request.body;

    try {
      const dept = await Group.findByIdAndUpdate(id, data, { new: true });
      return (ctx.response.body = response(dept));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  },
  async deleteGroup(ctx) {
    const id = ctx.request.body.id;
    try {
      if (ctx.$user.role <= 100) {
        ctx.throw(405, "权限不足");
      }
      await Group.findByIdAndDelete(id);
      return (ctx.response.body = response({ message: "删除成功" }));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  }
};

module.exports = groupController;
