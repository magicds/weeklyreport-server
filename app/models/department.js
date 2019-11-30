const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const deptSchema = new Schema({
    _id: Schema.Types.ObjectId
});

deptSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

const Dept = mongoose.model('User', deptSchema);

module.exports = User;
