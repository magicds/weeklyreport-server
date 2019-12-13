const Group = require("../models/group");
const response = require("../utils/response");

const groupController = {
  async getAll(ctx) {
    try {
      const list = await Group.find()
        .populate("dept")
        .sort({ index: "asc" });
      return (ctx.response.body = response(list || []));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  },
  async addGroup(ctx) {
    if (ctx.$user.role <= 10) {
      return ctx.throw(401, new Error("权限不足"));
    }
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
    if (ctx.$user.role <= 10) {
      return ctx.throw(401, new Error("权限不足"));
    }
    const { name, leader, note, groupId } = ctx.request.body;

    try {
      let group = await Group.findById(groupId).populate("leader");
      // 将之前的leader权限还原
      if (group.leader && group.leader.id != leader && group.leader.role == 10) {
        group.leader.role = 1;
        await group.leader.save();
      }
      group.set({ name, leader, note });
      group = await group.save();

      return (ctx.response.body = response(group));
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
