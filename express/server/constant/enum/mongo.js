/**
 * Created by wzhan039 on 2017-06-16.
 *
 * 为了节省mongo存储空间，enum值使用数字表示，显示时，通过函数将db和show连接起来，供client使用
 */

/*              注意，enum必须有2个值，否则mongoose在验证enum会出错（只有一个enum值，即使传入的值不符合，也会验证通过）                                    */
const ArticleStatus={
    DB:{
    'EDITING':'0', //用在2处：1. inputRule 2.通过 maintain/generateMongoEnum产生enumValue，用于将enum值加入到model中
    'FINISHED':'1',
    },
    SHOW:{
        'EDITING':'编辑中',
        'FINISHED':'编辑完成',
    }
}

const AdminUserType={
    DB:{
        ROOT:'0',
        NORMAL:'1',
    },
    SHOW:{
        ROOT:'超级管理员',
        NORMAL:'管理员',        
    }

}

const AdminPriorityType={
    DB:{
        IMPEACH:'0',      //可以处理 举报
        ASSIGN_IMPEACH:'1',
        PENALIZE:'2',//处罚普通用户
    },
    SHOW:{
        IMPEACH:'举报',
        ASSIGN_IMPEACH:'分配举报',
        PENALIZE:'处罚用户',//处罚普通用户
    },
    

    // NORMAL:'1',
}

const PublicGroupJoinInRule={
    DB:{
        ANYONE_ALLOW:'0',
        PERMIT_ALLOW:'1',
    },
    SHOW:{
        ANYONE_ALLOW:'任意加入',
        PERMIT_ALLOW:'批准加入',
    },

}

const PublicGroupEventType={
    DB:{
        CREATE:'0',
        NEW_USER_APPLY_TO_JOIN_IN:'1',
        GROUP_MEMBER_INVITE_NWE_USER:'2',
        CHANGE_ADMINISTRATOR:'3',
        DELETE_MEMBER:'4',
        MEMBER_QUIT_GROUP:'5',
    },
    SHOW:{
        CREATE:'群创建',
        NEW_USER_APPLY_TO_JOIN_IN:'新用户申请加入',
        GROUP_MEMBER_INVITE_NWE_USER:'邀请新用户加入',
        CHANGE_ADMINISTRATOR:'更改管理员',
        DELETE_MEMBER:'删除群成员',
        MEMBER_QUIT_GROUP:'用户退群',

    },

}

const EventStatus={
    DB:{
        ONGOING: '0', //事件处理中
        DONE:'1', //事件处理完毕
        DENY:'2', //事件被拒绝
    },
    SHOW:{
        ONGOING:'处理中',
        DONE:'处理完毕',
        DENY:'拒绝',
    },

}

const PenalizeType={
    DB:{
        NO_ARTICLE: '0',
        NO_COMMENT:'1',
        NO_TOPIC:'2',

    },
    SHOW:{
        NO_ARTICLE: '禁止写文档',
        NO_COMMENT:'禁止评论',
        NO_TOPIC:'禁止创建系列',
    },

}

const ImpeachType={
    DB:{
        ARTICLE: '0',
        COMMENT:'1',

    },
    SHOW:{
        ARTICLE: '举报文档',
        COMMENT:'举报评论',
    },

}

const ImpeachStatus={
    DB:{
        NEW: '0',
        COMMIT:'1',
        ACCEPT:'2',
        ASSIGN:'3',
        ONGOING:'4',
        REJECT:'5',
        DONE:'6',
    },
    SHOW:{
        NEW: '新建',
        COMMIT:'提交',
        ACCEPT:'接受',
        ASSIGN:'分配',
        ONGOING:'处理中',
        REJECT:'驳回',
        DONE:'处理完',
    },

}

/*      为了实现原子性（若干表同时操作，回滚）
*   内部使用，所以无需SHOW
* */
const DocStatus={
    DB:{
        // initial ， pending ， applied ， done ， canceling 和 canceled
        PENDING:'1',//主表记录完成，对应的外键尚未操作完成
        APPLIED:'2',//对应的外键完成
        DONE:'3',    //主表doc完成
    },
}



module.exports={
    ArticleStatus,
    AdminUserType,
    AdminPriorityType,
    PublicGroupJoinInRule,
    PublicGroupEventType,
    EventStatus,
    PenalizeType,
    ImpeachType,
    ImpeachStatus,
    DocStatus,
}