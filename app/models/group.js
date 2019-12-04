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
    const group = await Group.find().sort({ index: -1 });
    if (group && group.length) {
      this.index = group[group.length - 1].index + 1;
    } else {
      this.index = 0;
    }
  }

  // 修改 leader 的时候同步修改人员小组指向
  if (this.leader) {
    const aimUser = await User.findById(this.leader);
    if (aimUser.group != this.id) {
      aimUser.set("group", this.id);
      await aimUser.save();
    }
  }
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
