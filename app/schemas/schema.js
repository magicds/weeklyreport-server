const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise
// 评分点 schema
const scoreCfgSchema = new Schema({
    index: {
        type: Number,
        required: true
    },
    pid: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    scoreLimit: {
        type: Number,
        default: 0
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})
scoreCfgSchema.pre('save', function (next) {

    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});
module.exports = scoreCfgSchema;