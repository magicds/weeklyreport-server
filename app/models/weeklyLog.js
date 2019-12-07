const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const {getStartEndByRangeText} = require("../utils/date");
const addMeta = require("../utils/addMetaData.js");

const weeklyLogSchema = new Schema({
  week: {
    type: String,
    index: true,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}~\d{4}-\d{2}-\d{2}$/
  },
  startDate: Date,
  endDate: Date,
  report: {
    type: Schema.Types.Mixed,
    default: () => {
      return {
        taskList: Array,
        studyList: Array,
        leaveList: Array,
        communicationList: Array,

        taskTime: Number,
        studyTime: Number,
        communicationTime: Number,
        leaveTime: Number
      };
    }
  },
  user: { type: Schema.Types.ObjectId, required: true, index: true ,ref: 'User'},
  dept: { type: Schema.Types.ObjectId, required: true, index: true ,ref: 'Department'},
  group: { type: Schema.Types.ObjectId, required: true, index: true ,ref: 'Group'}
});

addMeta(weeklyLogSchema);

weeklyLogSchema.pre("save", function(next) {
  // week 转换为周的起止日期 用于校验
  if (this.isNew) {
    const range = getStartEndByRangeText(this.week);
    this.startDate = range.start;
    this.endDate = range.end;
  }
  next();
});

const WeeklyLog = mongoose.model("WeeklyLog", weeklyLogSchema);

module.exports = WeeklyLog;
