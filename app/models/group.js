const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const addMeta = require("../utils/addMetaData.js");

const groupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  index: {
    type: Number
  }
});
addMeta(groupSchema);

groupSchema.pre("save", async function() {
  if (!this.index) {
    const group = await Group.find().sort({ index: -1 });
    if (group && group.length) {
      this.index = group[group.length - 1].index + 1;
    }
  }
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
