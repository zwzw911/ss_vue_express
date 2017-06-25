/**
 * Created by wzhan039 on 2017-06-16.
 *
 * 为了节省mongo存储空间，enum值使用数字表示，显示时，通过函数将db和show连接起来，供client使用
 */

const ArticleStatus={
    DB:{
    'EDITING':0,
    'FINISHED':1,
    },
    SHOW:{
        'EDITING':'编辑中',
        'FINISHED':'编辑完成',
    }
}

const AdminUserType={
    DB:{
        ROOT:0,
        NORMAL:1,
    },
    SHOW:{
        ROOT:'群主',
        NORMAL:'管理员',        
    }

}

const AdminPriorityType={
    DB:{
        IMPEACH:0,      //可以处理 举报
    },
    SHOW:{
        IMPEACH:'举报'
    },
    

    // NORMAL:1,
}

const PublicGroupJoinInRule={
    DB:{
        ANYONE_ALLOW:0,
        PERMIT_ALLOW:1,
    },
    SHOW:{
        ANYONE_ALLOW:'任意加入',
        PERMIT_ALLOW:'批准加入',
    },

}

const PublicGroupEventType={
    DB:{
        CREATE:0,
        NEW_USER_APPLY_TO_JOIN_IN:1,
        GROUP_MEMBER_INVITE_NWE_USER:2,
        CHANGE_ADMINISTRATOR:3,
        DELETE_MEMBER:4,
        MEMBER_QUIT_GROUP:5,
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
        ONGOING: 0, //事件处理中
        DONE:1, //事件处理完毕
        DENY:2, //事件被拒绝
    },
    SHOW:{
        ONGOING:'处理中',
        DONE:'处理完毕',
        DENY:'拒绝',
    },

}

const PenalizeType={
    DB:{
        NO_ARTICLE: 0,
        NO_COMMENT:1,

    },
    SHOW:{
        NO_ARTICLE: '禁止写文档',
        NO_COMMENT:'禁止评论',
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
}