const scoreController = require("../controllers/score");

module.exports = {
    prefix: '/score',
    normal: [{
        method: 'post',
        path: '/getScore',
        action: scoreController.getScore
    },{
        method: 'post',
        path: '/saveScore',
        action: scoreController.saveScore
    },{
        method: 'post',
        path: '/saveNote',
        action: scoreController.saveNote
    }],
    anonymity: []
}