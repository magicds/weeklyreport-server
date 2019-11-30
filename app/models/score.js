const mongoose = require('mongoose');
const Score = mongoose.model('Score', require('../schemas/score'));
mongoose.Promise = global.Promise;

module.exports = Score;