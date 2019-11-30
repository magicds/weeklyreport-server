const ScoreCfgModel = require('../app/models/schema');
const initData = require('./score.config');
const connect = require('../app/utils/db').connect;
const topItems = [];

initData.forEach((it, index) => {
    const {
        name,
        description
    } = it;
    topItems.push({
        name,
        index,
        description
    });
});

// 自动读取并将初始化评分配置写入数据库
const db = connect().then(() => {
    return ScoreCfgModel.create(topItems);
}).then((topCfgs) => {
    console.log('顶级配置保存成功');
    console.log(topCfgs);
    const subItems = [];
    initData.forEach((t, i) => {
        const pid = topCfgs[i].id;
        t.items.forEach((it, j) => {
            const {
                name,
                description,
                scoreLimit
            } = it;
            subItems.push({
                pid,
                name,
                description,
                scoreLimit,
                index: j
            });
        });
    });

    console.log(subItems);
    return ScoreCfgModel.create(subItems).then((subs) => {
        console.log('初始化评分配置完成');
        console.log(subs);
    });

}).catch((err) => {
    console.log('初始化评分配置时出错：' + err.message);
})