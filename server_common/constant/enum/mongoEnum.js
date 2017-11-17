/**
 * Created by wzhan039 on 2017-06-16.
 *
 * 为了节省mongo存储空间，enum值使用数字表示，显示时，通过函数将db和show连接起来，供client使用
 */

/*              注意，enum必须有2个值，否则mongoose在验证enum会出错（只有一个enum值，即使传入的值不符合，也会验证通过）                                    */
const ArticleStatus={
    DB:{
        'NEW':'0', //必须新建一个文档，获得id后，image或者attachment才能有对应record进行处理
        'EDITING':'1', //用在2处：1. inputRule 2.通过 maintain/generateMongoEnum产生enumValue，用于将enum值加入到model中
        'FINISHED':'2',
    },
    SHOW:{
        'NEW':'新建文档',
        'EDITING':'编辑中',
        'FINISHED':'编辑完成',
    }
}

const AdminUserType={
    DB:{
        ADMIN_ROOT:'1',
        ADMIN_NORMAL:'2',
    },
    SHOW:{
        ADMIN_ROOT:'超级管理员',
        ADMIN_NORMAL:'管理员',
    }

}

const UserType={
    DB:{

        USER_NORMAL:'10',
    },
    SHOW:{

        USER_NORMAL:'普通用户',
    }
}

//由UserType和AdminUserType合并而成，人工合并，可以直接使用
const AllUserType={
    DB:{
        ADMIN_ROOT:'1',
        ADMIN_NORMAL:'2',
        USER_NORMAL:'10',
    },
    SHOW:{
        ADMIN_ROOT:'超级管理员',
        ADMIN_NORMAL:'管理员',
        USER_NORMAL:'普通用户',
    }
}
const AdminPriorityType={
    DB:{
        IMPEACH_REVIEW:'1',      //可以处理 举报
        IMPEACH_ASSIGN:'2',
        IMPEACH_DEAL:'3',

        CREATE_ADMIN_USER:'10',
        DELETE_ADMIN_USER:'11',
        UPDATE_ADMIN_USER:'12',

        PENALIZE_USER:'20',//处罚普通用户
        REVOKE_PENALIZE:'21',//撤销处罚
    },
    SHOW:{
        IMPEACH_REVIEW:'浏览举报',      //可以浏览所有举报
        IMPEACH_ASSIGN:'分配举报',             //可以分配 举报 给其他（管理员）处理
        IMPEACH_DEAL:'处理举报',               //可以处理 季报

        CREATE_ADMIN_USER:'创建管理员',         //可以创建新（管理员）
        DELETE_ADMIN_USER:'删除管理员',         //可以删除新（管理员）
        UPDATE_ADMIN_USER:'更新管理员',

        PENALIZE_USER:'处罚用户',             //可以处罚普通用户
        REVOKE_PENALIZE:'撤销处罚',           //可以撤销处罚
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
        NO_LIKE_DISLIKE:'3',
        NO_IMPEACH:'4',
        NO_IMPEACH_COMMENT:'5',
    },
    SHOW:{
        NO_ARTICLE: '禁止文档',
        NO_COMMENT:'禁止评论',
        NO_TOPIC:'禁止创建系列',
        NO_LIKE_DISLIKE:'禁止踩赞',
        NO_IMPEACH:'禁止举报',
        NO_IMPEACH_COMMENT:'禁止评论举报',
    },

}

const PenalizeSubType={
    DB:{
        CREATE: '1',
        READ:'2',
        UPDATE:'3',
        DELETE:'4',
        ALL:'9',
    },
    SHOW:{
        CREATE: '禁止创建',
        READ:'禁止读取',
        UPDATE:'禁止更新',
        DELETE:'禁止删除',
        ALL:'禁止所有操作',
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

const ImpeachAllAction={
    DB:{
        CREATE: '1',
        SUBMIT:'2',
        REVOKE:'3',

        ASSIGN:'4',
        ACCEPT:'5',
        REJECT:'6',
        FINISH:'7',
    },
    SHOW:{
        CREATE: '创建',
        SUBMIT:'提交',
        REVOKE:'撤回',

        ASSIGN:'分配',
        ACCEPT:'接受',
        REJECT:'驳回',
        FINISH:'完成',
    },
}

//普通用户可用操作
const ImpeachUserAction={
    DB:{
        CREATE: '1',
        SUBMIT:'2',
        REVOKE:'3',
    },
    SHOW:{
        CREATE: '创建',
        SUBMIT:'提交',
        REVOKE:'撤回',
    },
}

//admin用户可用操作
const ImpeachAdminAction={
    DB:{
        ASSIGN:'4',
        ACCEPT:'5',
        REJECT:'6',
        FINISH:'7',
    },
    SHOW:{
        ASSIGN:'分配',
        ACCEPT:'接受',
        REJECT:'驳回',
        FINISH:'完成',
    },
}

const ImpeachState={
    DB:{
        NEW: '1',

        WAIT_ASSIGN:'2',
        WAIT_HANDLE:'3',
        ONGOING:'4',
        DONE:'5',
    },
    SHOW:{
        NEW: '新建',

        WAIT_ASSIGN:'等待分配',
        WAIT_HANDLE:'等待处理',
        ONGOING:'处理中',
        DONE:'结束',

    },
}

/*//action和state的匹配关系
const ImpeachActionMatchState={
    [ImpeachAllAction.DB.CREATE]:ImpeachState.DB.NEW,
    [ImpeachAllAction.DB.SUBMIT]:ImpeachState.DB.WAIT_ASSIGN,
    [ImpeachAllAction.DB.REVOKE]:ImpeachState.DB.NEW,

    [ImpeachAllAction.DB.ASSIGN]:ImpeachState.DB.WAIT_HANDLE,
    [ImpeachAllAction.DB.ACCEPT]:ImpeachState.DB.ONGOING,
    [ImpeachAllAction.DB.REJECT]:ImpeachState.DB.DONE,
    [ImpeachAllAction.DB.FINISH]:ImpeachState.DB.DONE,
}*/
// console.log(`${JSON.stringify(ImpeachActionMatchState)}`)
//impeach和impeach_commnet共用一个coll记录image，为了区分，需要使用额外字段进行区分
const ImpeachImageReferenceColl={
    DB:{
        IMPEACH:'1',    //image属于impeach
        IMPEACH_COMMENT:'2',//image属于impeach_comment
    },

}
/*      mongodb中document的状态
        为了实现原子性（若干表同时操作，回滚）
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

/*      进一步区分account的类型（邮件还是手机），以便后续使用
 *   内部使用，所以无需SHOW
 * */
const AccountType={
    DB:{
        // initial ， pending ， applied ， done ， canceling 和 canceled
        EMAIL:'1',//account是email
        MOBILE_PHONE:'2',//account是手机

    },
}

/*          每个设定的storePath用途（用在那个coll）      */
const StorePathUsage={
    DB:{
        UPLOAD_TMP:'1',
        USER_PHOTO:'2',
        ARTICLE_INNER_IMAGE:'3',
        ARTICLE_INNER_ATTACHMENT:'4',
        IMPEACH_IMAGE:'5',
    },
    SHOW:{
        UPLOAD_TMP:'临时文件夹',
        USER_PHOTO:'用户头像',
        ARTICLE_INNER_IMAGE:'文档图片',
        ARTICLE_INNER_ATTACHMENT:'文档附件',
        IMPEACH_IMAGE:'举报图片',
    },

}
const StorePathStatus={
    DB:{
        READ_ONLY:'1',
        READ_WRITE:'2',

    },
    SHOW:{
        READ_ONLY:'只读',//storePath已经满，只能读取
        READ_WRITE:'读写',//storePath未满，读写
    },

}

const ResourceProfileRange={
    DB:{
        PER_ARTICLE:'1',
        PER_PERSON:'2',
        PER_IMPEACH_OR_COMMENT:'3',
        PER_PERSON_IN_IMPEACH:'4',
    },
    SHOW:{
        PER_ARTICLE:'文档',//对文档起作用
        PER_PERSON:'用户',//对用户起作用
        PER_IMPEACH_OR_COMMENT:'3', //举报或者举报出路
        PER_PERSON_IN_IMPEACH:'4',  //整个举报中
    },
}
const ResourceProfileType={
    DB:{
        DEFAULT:'1',
        ADVANCED:'2',

    },
    SHOW:{
        DEFAULT:'默认资源配置',//对文档起作用
        ADVANCED:'高级资源配置',//对用户起作用
    },
}


/*
 *  在某些coll中，需要预先在后台建立一个默认的记录，以便获得ObjectId，用作插入图片作者附件（图片或者附件除了在coll中有field记录，还需要一个单独的表存储，方便计算数量和size）
 *  因此在client，用户点击“新建”，其实在server静默的创建一个新的记录
 *  为了防止用户“新建”后，却不提交，造成无效记录，添加一个字段，用来记录 记录状态，以便进行相应的处理
 * */
const DocumentStatus={
    DB:{
        NEW:'1',
        COMMIT:'2',

    },
    SHOW:{
        NEW:'新建记录，但未提交',
        COMMIT:'新建记录，已经提交',
    },
}
module.exports={
    ArticleStatus,
    AdminUserType,
    UserType,
    AllUserType,
    AdminPriorityType,
    PublicGroupJoinInRule,
    PublicGroupEventType,
    EventStatus,
    PenalizeType,
    PenalizeSubType,
    ImpeachType,
    ImpeachAllAction,
    ImpeachUserAction,
    ImpeachAdminAction,
    ImpeachState,
    // ImpeachActionMatchState,
    ImpeachImageReferenceColl,
    DocStatus,
    AccountType,
    StorePathUsage,
    StorePathStatus,
    ResourceProfileRange,
    ResourceProfileType,
    DocumentStatus,
}