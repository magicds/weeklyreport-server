const Department = require("../models/department");
const Group = require("../models/group");
const User = require("../models/user");
const response = require("../utils/response");

const deptController = {
  async getAll(ctx) {
    try {
      const list = await Department.find().sort({ index: "asc" });
      return (ctx.response.body = response(list || []));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  },
  async getAllData(ctx) {
    // const deptList = await Department.find().sort({ index: "asc" }).populate('leader');

    // const groupList = await Group.find().sort({ index: "asc" }).populate('leader');

    // const userList = await User.find().sort({ index: "asc" }).populate('group').populate('dept');

    const [deptList, groupList, userList] = await Promise.all([
      Department.find()
        .populate("leader", "id name")
        .sort({ index: "asc" }),

      Group.find()
        .populate("leader", "_id name")
        .populate("dept")
        .sort({ index: "asc" }),

      User.find()
        .populate("group")
        .populate("dept")
        .sort({ index: "asc" })
    ]);

    const users = [];
    const deptMap = deptList.reduce((t, c) => {
      t[c.id] = c.toJSON();
      // handle leader.id miss
      const leader = t[c.id].leader;
      if (leader && leader._id) {
        leader.id = leader._id;
      }
      return t;
    }, {});
    const groupMap = groupList.reduce((t, c) => {
      t[c.id] = c.toJSON();
      // handle leader.id miss
      const leader = t[c.id].leader;
      if (leader && leader._id) {
        leader.id = leader._id;
      }
      return t;
    }, {});
    userList.forEach(u => {
      if (u.group && u.group.id) {
        const gid = u.group.id;
        if (groupMap[gid]) {
          if (groupMap[gid].members) {
            groupMap[gid].members.push(u.getClientData());
          } else {
            groupMap[gid].members = [u.getClientData()];
          }
        }
      } else {
        users.push(u.getClientData());
      }
    });

    const gList = Object.keys(groupMap).map(gid => groupMap[gid]);
    gList.forEach(group => {
      if (!group.dept || !group.dept.id) return;
      if (!group.members) {
        group.members = [];
      }
      const did = group.dept.id;
      if (deptMap[did]) {
        if (deptMap[did].groups) {
          deptMap[did].groups.push(group);
        } else {
          deptMap[did].groups = [group];
        }
      }
    });
    const list = Object.keys(deptMap).map(did =>
      Object.assign({ groups: [] }, deptMap[did])
    );

    // const list = await Department.find()
    //   .sort({ index: "asc" })
    //   .populate("leader")
    //   .populate("groups")
    //   .populate({ path: "groups", populate: { path: "members" } });
    return (ctx.response.body = response({
      list: list || [],
      users: users
    }));
  },
  async addDepartment(ctx) {
    if (ctx.$user.role <= 100) {
      return ctx.throw(401, new Error("权限不足"));
    }
    const { name, leader, note } = ctx.request.body;
    const props = { name, note };
    if (leader) {
      props.leader = leader;
    }
    try {
      const dept = new Department(props);
      await dept.save();

      return (ctx.response.body = response(dept));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  },
  async updateDepartment(ctx) {
    if (ctx.$user.role <= 100) {
      return ctx.throw(401, new Error("权限不足"));
    }
    const { name, leader, note, deptId } = ctx.request.body;
    const props = { name, note };
    if (leader) {
      props.leader = leader;
    }

    try {
      let dept = await Department.findById(deptId).populate("leader");
      // 将之前的leader权限还原
      if (dept.leader && dept.leader.id != leader && dept.leader.role == 100) {
        const isGroupLeader = await Group.find({
          leader: dept.leader.id
        }).count();
        dept.leader.role = isGroupLeader ? 10 : 1;
        await dept.leader.save();
      }
      dept.set(props);
      dept = await dept.save();

      return (ctx.response.body = response(dept));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error);
    }
  },
  async deleteDepartment(ctx) {
    const id = ctx.request.body.id;
    try {
      if (ctx.$user.role <= 1000) {
        ctx.throw(405, new Error("权限不足"));
      }
      await Department.findByIdAndDelete(id);
      return (ctx.response.body = response({ message: "删除成功" }));
    } catch (error) {
      console.error(error);
      return ctx.throw(500, error.message);
    }
  }
};

module.exports = deptController;
