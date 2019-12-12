const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const User = require("./user");

const addMeta = require("../utils/addMetaData.js");

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    dept: {
      type: Schema.Types.ObjectId,
      ref: "Department"
    },
    index: {
      type: Number
    }
    // members: [
    //   {
    //     ref: "User",
    //     type: Schema.Types.ObjectId
    //   }
    // ]
  },
  { toJSON: { virtuals: true } }
);

addMeta(groupSchema);

groupSchema.pre("save", async function() {
  // 补充排序值
  if (!this.index) {
    const group = await Group.find().sort({ index: 'desc' });
    if (group && group.length) {
      this.index = group[0].index + 1;
    } else {
      this.index = 0;
    }
  }

  // 修改 leader 的时候同步修改人员小组指向
  // 同时提升权限
  if (this.leader) {
    const newLeader = await User.findById(this.leader);
    if (newLeader.group != this.id || newLeader.role <= 10) {
      newLeader.set("group", this.id);
      newLeader.set("role", 10);
      await newLeader.save();
    }
  }
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
