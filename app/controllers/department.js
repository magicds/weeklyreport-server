const Department = require('../models/department');
const response = require('../utils/response');

const deptController = {
    async getAll(ctx) {
        try {
            const list = await Department.find().sort({ index: 'asc' });
            return (ctx.response.body = response(list || []));
        } catch (error) {
            console.error(error);
            return ctx.throw(500, error.message);
        }
    },
    async addDepartment(ctx) {
        const { name, leader } = ctx.request.body;
        try {
            const dept = new Department({
                name,
                leader
            });
            await dept.save();

            return (ctx.response.body = response(dept));
        } catch (error) {
            console.error(error);
            return ctx.throw(500, error.message);
        }
    },
    async updateDepartment(ctx) {
        const { id, data } = ctx.request.body;

        try {
            const dept = await Department.findByIdAndUpdate(id, data, { new: true });
            return (ctx.response.body = response(dept));
        } catch (error) {
            console.error(error);
            return ctx.throw(500, error.message);
        }
    },
    async deleteDepartment(ctx) {
        const id = ctx.request.body.id;
        try {
            if (ctx.$user.role <= 100) {
                ctx.throw(405, '权限不足');
            }
            await Department.findByIdAndDelete(id);
            return (ctx.response.body = response({ message: '删除成功' }));
        } catch (error) {
            console.error(error);
            return ctx.throw(500, error.message);
        }
    }
};

module.exports = deptController;
