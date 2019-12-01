const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const addMeta = require("../utils/addMetaData.js");

const weeklyLogSchema = new Schema({
  week: {
    type: String,
    index: true,
    required: true,
    match: /^\d{4}-\d{2}\d{2}~\d{4}-\d{2}\d{2}$/
  },
  startDate: Date,
  endDate: Date,
  report: {
    type: Schema.Types.Mixed,
    default: () => {
      return {
        workList: [],
        leaveList: [],
        studyTime: 0,
        taskTime: 50,
        communicationTime: 0,
        leaveTime: 0,
        saturation: 1
      };
    }
  },
  user: { type: Schema.Types.ObjectId, required: true, index: true },
  dept: { type: Schema.Types.ObjectId, required: true, index: true },
  group: { type: Schema.Types.ObjectId, required: true, index: true }
});

addMeta(weeklyLogSchema);

weeklyLogSchema.pre("save", function(next) {
  // week 转换为周的起止日期 用于校验
  if (this.isNew) {
    const d = this.week.split("~");
    this.startDate = new Date(...d[0].split("-"));
    this.endDate = new Date(...d[1].split("-"));
  }
  next();
});

const WeeklyLog = mongoose.model("WeeklyLog", weeklyLogSchema);

module.exports = WeeklyLog;
