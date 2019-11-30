const ScoreModel = require("../models/score");
const CfgModel = require('../models/schema');
const response = require('../utils/response');

// 将分数配置和分数拼接在一起
function getItemsWithScore(cfgs, scores, notes) {
    let data = [];
    const scoreObj = scores || {};
    const noteObj = notes || {};
    let v = 0,
        n = '';
    cfgs.forEach(item => {
        // const scoreItem = scoreObj[item.id];
        // const noteItem = noteObj[item.id];
        v = scoreObj[item.id] || 0;
        n = noteObj[item.id] || '';

        data.push({
            id: item._id,
            pid: item.pid,
            name: item.name,
            description: item.description,
            scoreLimit: item.scoreLimit,
            score: v,
            note: n
        });
    });

    return array2tree(data);
}

function array2tree(data) {
    const subs = {};
    const tops = [];
    const topScores = {};
    data.forEach(item => {
        if (!item.pid) {
            tops.push(item);
        } else {
            if (!subs[item.pid]) {
                subs[item.pid] = [item];
            } else {
                subs[item.pid].push(item);
            }

            // 计算大项的分值
            if (topScores[item.pid] === undefined) {
                topScores[item.pid] = item.score;
            } else {
                topScores[item.pid] += item.score;
            }
        }
    });
    tops.forEach(item => {
        item.items = subs[item.id] || [];
        item.score = topScores[item.id];
    });

    return tops;
}

const scoreController = {
    async getScore(ctx) {
        const $user = ctx.$user;
        const {
            period,
            userId
        } = ctx.request.body;

        let userScore = await ScoreModel.findOne({
            period: period,
            user: userId
        }).populate('user');

        const hasScore = userScore ? true : false;

        if (!hasScore) {
            // userScore = await scoreController.getOrCreateScore(ctx);
            return ctx.response.body = response(null, 404, '目前还没有评分');
        }

        let cfgs = await CfgModel.find();

        if (!cfgs) {
            return ctx.throw(500, '因无法获取评分配置，系统暂无法使用');
        }
        const scores = getItemsWithScore(cfgs, userScore.scores, userScore.notes);
        return ctx.response.body = response({
            id: userScore._id,
            user: userScore.user.getClientData(),
            score: scores,
        });
    },
    // 获取或初始化用户评分
    async getOrCreateScore(ctx) {
        const {
            period,
            userId
        } = ctx.request.body;
        if (!period) {
            // ctx.response.body = response(null, 405, '必须指定是哪个时期的评分');
            return ctx.throw(400, '必须指定是哪个时期的评分');
        }

        const aimScore = await ScoreModel.findOne({
            user: userId,
            period: period
        });
        if (aimScore) return aimScore;
        const score = new ScoreModel({
            user: userId,
            period: period
        });
        await score.save();
        return score;

    },
    async saveScoreOrNote(ctx, type) {
        const {
            id,
            scoreId,
            score,
            note
        } = ctx.request.body;
        if (type == 'score') {
            // 分数最大值校验
            const cfg = await CfgModel.findById(scoreId);
            if (!cfg) {
                return ctx.throw(400, '指定评分项目不存在！');
            }
            if (cfg.scoreLimit !== 0 && score > cfg.scoreLimit) {
                return ctx.throw(400, '分数不能超过限制分值');
            }
        }
        const userScore = await ScoreModel.findById(id).then(userScore => {
            if (type == 'score') {
                userScore.scores[scoreId] = score;
                userScore.markModified('scores');
            } else if (type == 'note') {
                userScore.notes[scoreId] = note;
                userScore.markModified('notes');
            }
            return userScore.save();
        }).then(res => {
            console.log(res);
            return res;
        });

        return ctx.response.body = response(userScore);
    },
    async saveScore(ctx) {
        return await scoreController.saveScoreOrNote(ctx, 'score');
    },
    async saveNote(ctx) {
        return await scoreController.saveScoreOrNote(ctx, 'note');
    },
}

module.exports = scoreController;