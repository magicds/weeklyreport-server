const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const addMeta = require("../utils/addMetaData.js");

const verifySchema = new Schema(
  {
    type: String,
    info: {
      type: String,
      required: true
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    operator: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    date: Number
  },
  { toJSON: { virtuals: true } }
);

addMeta(verifySchema);
verifySchema.pre("save", async function() {
  if (!this.date) {
    this.date = +new Date();
  }
});

const VerifyLog = mongoose.model("VerifyLog", verifySchema);

module.exports = VerifyLog;
