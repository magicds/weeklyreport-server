const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const addMeta = require("../utils/addMetaData.js");
mongoose.Promise = global.Promise;

const SALT_WORK_FACTOR = 10;

const userSchema = new Schema({
  // _id: Schema.Types.ObjectId,
  email: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  extInfo: String,
  phone: {
    type: String
  },
  // 部门 ID
  // TODO: danger 这是一个冗余字段，涉及修改时 需要同步修正
  dept: { type: Schema.Types.ObjectId, ref: "Department" },
  // 小组 ID
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  index: {
    type: Number,
    index: true
  },
  gender: String,
  role: {
    // 枚举值不利于做权限判断，改成以数字表示 越大权限越高 也方便后期扩展
    // 0 unverified 已经注册、未验证
    // 1 normal 已经验证通过的普通用户
    //
    // 1000 admin 管理员
    // 10000 superAdmin 超级管理员
    type: Number,
    default: 0
  },
  pwd: String,
  pwdSalt: String,
  type: {
    type: String,
    enum: ["site", "third"],
    default: "site"
  }
  // meta: {
  //     createAt: {
  //         type: Date,
  //         default: Date.now()
  //     },
  //     updateAt: {
  //         type: Date,
  //         default: Date.now()
  //     }
  // }
});
/**
 * 比较密码是否匹配
 * @param {String} pwd 用户提交的密码
 * @returns {Promise<Boolean>} 密码是否匹配
 */
userSchema.methods.comparePwd = function(pwd) {
  return bcrypt.compare(pwd, this.pwd);
};
/**
 * 获取可返回客户端的用户数据
 *
 * @returns {Object}
 */
userSchema.methods.getClientData = function() {
  return {
    name: this.name,
    email: this.email,
    phone: this.phone,
    id: this._id,
    type: this.type,
    role: this.role,
    dept: this.dept || {},
    group: this.group || {},
    gender: this.gender,
    extInfo: this.extInfo,
    meta: this.meta
  };
};

/**
 * 生成用户密码
 *
 * @returns {Promise}
 */
userSchema.methods.setPwd = async function(pwd) {
  // 密码处理
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.pwdSalt = salt;
  const hash = await bcrypt.hash(pwd, salt);
  this.pwd = hash;
  return this;
};

// userSchema.statics.find = function (condition, sort) {
//     return this.find(condition).sort(sort || 'meta.updateAt')
// }
// userSchema.statics.findOne = function (condition) {
//     return this.findOne(condition).sort()
// }

addMeta(userSchema);

userSchema.pre("save", async function() {
  // const user = this

  // if (this.isNew) {
  //     this.meta.createAt = this.meta.updateAt = Date.now();
  // } else {
  //     this.meta.updateAt = Date.now();
  // }

  // 加盐
  // bcrypt.genSalt(SALT_WORK_FACTOR).then((salt) => {
  //     //
  //     return bcrypt.hash(user.pwd, salt)
  // }).then((hash) => {
  //     user.pwd = hash
  //     next()
  // }).catch((err) => {
  //     next(err)
  // })
  // 自动加盐并hash
  // bcrypt.hash(this.pwd, SALT_WORK_FACTOR).then((hash) => {
  //     this.pwd = hash;
  //     next()
  // }).catch((err) => {
  //     next(err)
  // })

  // 补充 index
  if (!this.index) {
    const userArr = await User.find().sort({ index: "desc" });
    if (userArr && userArr.length) {
      this.index = userArr[0].index + 1;
    } else {
      this.index = 1;
    }
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
