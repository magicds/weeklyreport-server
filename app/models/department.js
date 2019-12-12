const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const User = require("./user");

const addMeta = require("../utils/addMetaData.js");

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    index: {
      type: Number
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    note: String,
    // groups: [
    //   {
    //     ref: "Group",
    //     type: Schema.Types.ObjectId
    //   }
    // ]
  },
  { toJSON: { virtuals: true } }
);
addMeta(departmentSchema);

departmentSchema.pre("save", async function() {
  if (!this.index) {
    const deptArr = await Department.find().sort({ index: 'desc' });
    if (deptArr && deptArr.length) {
      this.index = deptArr[0].index + 1;
    } else {
      this.index = 0;
    }
  }
  // 修改 leader 的时候同步修改人员部门指向
  // 同时提升权限
  if (this.leader) {
    const newLeader = await User.findById(this.leader);
    if (newLeader.dept != this.id || newLeader.role <= 100) {
      newLeader.set("dept", this.id);
      newLeader.set("role", 100);
      await newLeader.save();
    }
  }
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
