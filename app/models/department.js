const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

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
    const deptArr = await Department.find().sort({ index: -1 });
    if (deptArr && deptArr.length) {
      this.index = deptArr[deptArr.length - 1].index + 1;
    } else {
      this.index = 0;
    }
  }
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
