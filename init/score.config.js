// 这里是初始化的评分配置
module.exports = [{
        name: '技术研发',
        description: '',
        items: [{
            name: '代码规范、注释充分',
            scoreLimit: 5,
            description: "基准 5，可直接打分；\r\n上级抽查，不达要求，一次 -1；"
        }, {
            name: '还原度高、符合兼容性要求',
            scoreLimit: 5,
            description: "基准 5，可直接打分；\r\n上级抽查，不达要求，一次 -1；"
        }, {
            name: '实现方案合理、思路严谨',
            scoreLimit: 10,
            description: "基准 10，可直接打分；\r\n上级抽查，存在明显不合理的，一次 -2；"
        }, {
            name: '有较高的开发效率，不拖沓',
            scoreLimit: 10,
            description: '直接打分'
        }, {
            name: '能承接有一定技术难度的开发任务',
            scoreLimit: 0,
            description: "基准 0，组长评定技术难度；\r\n完成一个中等难度任务 +1，完成一个较高难度任务 +3；"
        }, {
            name: '有较强的需求评估意识和能力\r\n\r\n1. 能够从技术可行性层面进行评估，并给予专业建议\r\n1. 能够从用户交互体验、视觉层面进行评估，并给予合理建议\r\n1.能够从根本发出，对需求本身的合理性进行思考，并给予专业建议或替代方案',
            scoreLimit: 10,
            description: "基准 10，可直接打分；\r\n若因缺乏需求评估过程，对后续工作推进产生负面影响，一次 -2；"
        }, {
            name: '能够主动思考现有技术方案中的不足，提出评审，并积极落实改进',
            scoreLimit: 0,
            description: '基准 0， 提出一次有效方案， 并落实为实际成果 + 2'
        }, {
            name: '在UE设计、UI设计方面有一定专长，并能应用专长参与到项目或产品研发中',
            scoreLimit: 0,
            description: '基准 0， 参与一次任务 + 2'
        }]
    },
    {
        name: '制度执行',
        description: '',
        items: [{
            name: '遵守公司制度，如：考勤、佩戴工作卡、办公室禁玩游戏等',
            scoreLimit: 5,
            description: "基准 5，违反一次 -1"
        }, {
            name: '遵守团队制度，如：周报日志、代码评审、风险反馈、请假调休等',
            scoreLimit: 5,
            description: "基准 10，违反一次 -2"
        }, {
            name: '研发群绩效考核优良，月客观得分平均 68+',
            scoreLimit: 10,
            description: "基准 10，不足一次 -2"
        }]
    },
    {
        name: '团队意识',
        description: '',
        items: [{
            name: '工作上遇到困难，善于寻求团队成员的帮助与支持',
            scoreLimit: 10,
            description: "直接打分"
        }, {
            name: '团队成员在工作上遇到困难时，能够提供力所能及的帮助与支持',
            scoreLimit: 10,
            description: "直接打分"
        }, {
            name: '与团队成员真诚相待、坦诚沟通，并给予他人积极的反馈',
            scoreLimit: 10,
            description: "直接打分"
        }, {
            name: '不无故或以牵强的理由缺席团队内部的例会培训、部门要求参加的公开培训',
            scoreLimit: 5,
            description: "基准 5，缺席一次 -1"
        }, {
            name: '积极参与团队活动，并愿意提供一些好的活动建议',
            scoreLimit: 5,
            description: "可直接打分；\r\n另外提供好的活动建议，并被采纳实施 +1；"
        }]
    },
    {
        name: '沟通反馈',
        description: '',
        items: [{
            name: '对于上级通过口头形式安排的重要工作，有主动汇报反馈进度的意识，有头有尾形成闭环',
            scoreLimit: 10,
            description: "基准 10，可直接打分；\r\n若工作安排后，后续没有主动汇报进度，有头无尾，一次 -2；"
        }, {
            name: '沟通表达清晰，态度坦诚、描述客观，避免抱怨或其他消极的情绪性表达。',
            scoreLimit: 10,
            description: "直接打分"
        }, {
            name: '遇到问题，沟通主动性强，不隐瞒、不逃避、不消极等待、不不懂装懂。',
            scoreLimit: 10,
            description: "基准 10，可直接打分；\r\n若因沟通消极、刻意逃避、隐瞒问题，对后续工作产生负面影响，一次 -5；"
        }]
    },
    {
        name: '领导意识',
        description: '',
        items: [{
            name: '作为导师积极关注新人成长情况，跟进工作进展，并给予及时指导',
            scoreLimit: 10,
            description: "基准 10，可直接打分；\r\n非导师，直接 4 分；\r\n若上级了解到导师对新人关心不足，指导不够，一次 -2；"
        }, {
            name: '在多成员参与的任务中，任命为开发主负责，能够把控好项目整体的开发进度和产出质量',
            scoreLimit: 0,
            description: "项目推进顺畅，整体工作完成出色 +8；\r\n遭到投诉、进度和质量管控不力 -4；"
        }, {
            name: '对于下属工作中存在的问题能够主动、坦诚、及时的指出，并关注改善情况',
            scoreLimit: 15,
            description: "基准 15，可直接打分；\r\n非导师、非组长，直接 5 分；\r\n若下属在工作中同一个问题出现二次，并遭到投诉，一次 -3；"
        }, {
            name: '对于下属工作中好的地方，给予积极、真诚的反馈',
            scoreLimit: 5,
            description: "直接打分（非导师、非组长，直接 2 分）"
        }]
    },
    {
        name: '责任与主动',
        description: '',
        items: [{
            name: '工作量较大时，能够合理安排自己作息时间，主动加班推进工作',
            scoreLimit: 10,
            description: "基准 10，可直接打分；\r\n若无故造成任务拖延，项目组投诉，一次 -5；"
        }, {
            name: '对于紧急任务，能够积极承担，快速响应，抗压能力强',
            scoreLimit: 20,
            description: "基准 20，可直接打分；\r\n若逃避 或 非正当理由拒绝承担上级安排的工作，一次 -10；"
        }, {
            name: '能够主动思考团队管理上存在的问题，并向上级提出建设性想法',
            scoreLimit: 0,
            description: "基准 0，采纳一个，并达到预期效果 +2"
        }]
    },
    {
        name: '培训与分享',
        description: '',
        items: [{
            name: '主动在公司论坛发布原创文章，包括技术、经验分享，研发成果推广',
            scoreLimit: 0,
            description: "基准 0，必须为原创，发表一篇 +1，高质量 +2"
        }, {
            name: '在对外或对内培训中积极承担讲师角色',
            scoreLimit: 0,
            description: "基准 0，对内一次 +2，对外一次 +3"
        }, {
            name: '平时工作中，能在团队内部主动分享自己的技术沉淀和有效经验',
            scoreLimit: 0,
            description: "有明确的分享成果，并受到上级认可，一次 +1"
        }]
    }
]