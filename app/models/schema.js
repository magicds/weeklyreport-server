const mongoose = require('mongoose');
const ScoreCfg = mongoose.model('ScoreCfg', require('../schemas/schema'));
mongoose.Promise = global.Promise;

module.exports = ScoreCfg;