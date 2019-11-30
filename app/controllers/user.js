const jwt = require('jsonwebtoken');
const { COOKIE_TOKEN_KEY, COOKIE_UID_KEY } = require('../../config.js');
const UserModel = require('../models/user');
const response = require('../utils/response');
const { setLoinCookie, clearLoinCookie } = require('../utils/util');


const userController = {
    /**
     * 检查是否登录
     *
     * @param {Koa.Context} ctx koa ctx
     * @returns {Promise<Boolean>}
     * @memberof baseController
     */
    async checkLogin(ctx /** @types Koa.Context */) {
        let token = ctx.cookies.get(COOKIE_TOKEN_KEY);
        let uid = ctx.cookies.get(COOKIE_UID_KEY);
        try {
            if (!token || !uid) return false;
            const user = await UserModel.findById(uid);
            if (!user) return false;

            let decodeData;
            try {
                decodeData = jwt.verify(token, user.pwdSalt);
            } catch (error) {
                console.error(error);
                return false;
            }
            if (decodeData.uid === uid) {
                ctx.$uid = uid;
                ctx.$auth = true;
                ctx.$user = user;
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    async signup(ctx) {
        let { name, email, pwd } = ctx.request.body;
        try {
            // 先验证是否存在
            const aimUser = await UserModel.findOne({
                $or: [
                    {
                        name
                    },
                    {
                        email
                    }
                ]
            });
            if (aimUser) {
                // 已经存在
                return (ctx.response.body = {
                    code: '200',
                    data: null,
                    msg: ' 用户已经存在！'
                });
            }
            // 不存在
            const user = new UserModel({
                name,
                email,
                pwd
            });
            await user.save();
            return (ctx.response.body = {
                code: '200',
                data: '注册成功'
            });
        } catch (error) {
            console.error(error);
            return ctx.throw(500, error.message);
        }
    },
    async autoLogin(ctx) {
        const isLogin = await userController.checkLogin(ctx);

        if (isLogin) {
            setLoinCookie(ctx, ctx.$uid, ctx.$user.pwdSalt);
        }
    },
    async login(ctx) {
        let { name, email, pwd } = ctx.request.body;
        const aimUser = await UserModel.findOne({
            $or: [
                {
                    name
                },
                {
                    email
                }
            ]
        });
        if (!aimUser) {
            return ctx.throw(401, 'user is not existed!');
            // return ctx.response.body = response(null, 404, 'user is not existed');
        }

        if (await aimUser.comparePwd(pwd, aimUser.pwd)) {
            setLoinCookie(ctx, aimUser._id, aimUser.pwdSalt);
            return (ctx.response.body = response(aimUser.getClientData(), 200, 'login success!'));
        } else {
            return ctx.throw(401, 'the username and password not match!');
            // return ctx.response.body = response(null, 405, 'the username and password not match!');
        }
    },
    async logout(ctx) {
        clearLoinCookie(ctx);
        return (ctx.response.body = response('logout sussess'));
    },
    async getUserList(ctx) {
        if (ctx.$user.role <= 10) {
            return ctx.throw(405, '权限不足，您无法获取！');
        }
        const list = await UserModel.find();

        if (!list || !list.length) return (ctx.response.body = response([]));

        const result = [];
        list.forEach(item => {
            result.push(item.getClientData());
        });

        return (ctx.response.body = response(result));
    }
};

module.exports = userController;
