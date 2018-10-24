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

const ArticleAllowComment={
    DB:{
        'Allow':'1',
        'Forbid':'2',

    },
    SHOW:{
        'Allow':'允许评论',
        'Forbid':'禁止评论',
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
const AddFriendRule={
    DB:{
        ANYONE_ALLOW:'1',
        PERMIT_ALLOW:'2',
        NOONE_ALLOW:'3',
    },
    SHOW:{
        ANYONE_ALLOW:'任意加入',
        PERMIT_ALLOW:'批准加入',
        NOONE_ALLOW:'拒绝加入',
    },

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
        ANYONE_ALLOW:'1',
        PERMIT_ALLOW:'2',
        NOONE_ALLOW:'3',
    },
    SHOW:{
        ANYONE_ALLOW:'任意加入',
        PERMIT_ALLOW:'批准加入',
        NOONE_ALLOW:'拒绝加入',
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
        NO_ARTICLE: '1',
        NO_ARTICLE_COMMENT:'2',
        NO_TOPIC:'3',
        NO_LIKE_DISLIKE:'4',


        NO_IMPEACH_COMMENT:'10',
        //user_friend_group
        NO_USER_FRIEND_GROUP:'20',

        //add_friend_request
        NO_ADD_FRIEND:'21',

        //public_group
        NO_PUBLIC_GROUP:'30',
        NO_JOIN_PUBLIC_REQUEST:'31',
        //user:upload_photo
        NO_UPLOAD_USER_PHOTO:'40',

        //folder
        NO_FOLDER:'50',

        NO_IMPEACH:'60',

        NO_IMPEACH_ACTION:'61',

        NO_USER:'70',
    },
    SHOW:{
        NO_ARTICLE: '禁止文档',
        NO_ARTICLE_COMMENT:'禁止评论',
        NO_TOPIC:'禁止创建系列',
        NO_LIKE_DISLIKE:'禁止踩赞',
        NO_IMPEACH:'禁止举报',
        NO_IMPEACH_COMMENT:'禁止评论举报',
        //user_friend_group
        NO_USER_FRIEND_GROUP:'禁止好友分组',

        //add_friend_request
        NO_ADD_FRIEND:'禁止添加好友',

        //public_group
        NO_PUBLIC_GROUP:'禁止创建群',
        NO_JOIN_PUBLIC_REQUEST:'禁止加入群',

        //user:upload_photo
        NO_UPLOAD_USER_PHOTO:'禁止上传头像',

        //folder
        NO_FOLDER:'禁止目录相关操作',

        NO_IMPEACH_ACTION:'禁止操作举报',

        NO_USER:'禁止用户相关操作',
    },

}

const PenalizeSubType={
    DB:{
        CREATE: '1',
        READ:'2',
        UPDATE:'3',
        DELETE:'4',
        SEARCH:'5',
        ALL:'9',
    },
    SHOW:{
        CREATE: '禁止创建',
        READ:'禁止读取',
        UPDATE:'禁止更新',
        DELETE:'禁止删除',
        SEARCH:'禁止查询',
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

/**   和ImpeachState不同，这是记录创建的举报的状态，以此为基础，确定是否需要重用（防止用户大量创建未提交的impeach）  **/
/*const ImpeachStatus={
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
}*/
/**   和ImpeachStatus不同，这是记录举报的处理状态  **/
const ImpeachState={
    DB:{
        NEW: '1',//create，但是未做任何修改
        EDITING:'2',//create之后，开始编辑，但是没有提交
        WAIT_ASSIGN:'3',//提交，但是未被处理
        WAIT_HANDLE:'4',
        ONGOING:'5',
        DONE:'6',
    },
    SHOW:{
        NEW: '新建',
        EDITING:'编辑',
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

//和uploadFileType一样，但是为了在计算resource不产生confuse，使用新名称.
// 不再使用
/*const ResourceType={
    DB:{
        ARTICLE_IMAGE:'1',
        ARTICLE_ATTACHMENT:'2',
        IMPEACH_COMMENT_IMAGE:'3',
        IMPEACH_COMMENT_ATTACHMENT:'4',},

    SHOW:{
        ARTICLE_IMAGE:'文档图片',
        ARTICLE_ATTACHMENT:'文档附件',
        IMPEACH_COMMENT_IMAGE:'评论图片',
        IMPEACH_COMMENT_ATTACHMENT:'评论附件',},

}*/

const ResourceRange={
    DB:{
        /**     用户总的文件空间，存储在user_resource_static中    **/
        WHOLE_FILE_RESOURCE_PER_PERSON:'1', //用户总共的文件资源（数量（限制数量，防止传入大量小文件）和大小）

        /**     每个文档的图片和附件 的文件资源     **/
        IMAGE_PER_ARTICLE:'10',  //每个文档的图片
        ATTACHMENT_PER_ARTICLE:'12', //每个文档的附件

        /**     每个举报的图片和附件 的文件资源     **/
        IMAGE_PER_IMPEACH_OR_COMMENT:'14',//每个举报（或者举报处理）最大可插入图片数量和总大小
        ATTACHMENT_PER_IMPEACH:'16',//只有举报才能插入附件
        IMAGE_IN_WHOLE_IMPEACH:'18',//整个举报（以及处理过程中）最大可插入图片数量和总大小
        IMAGE_PER_USER_IN_WHOLE_IMPEACH:'20',//在整个impeach中，单个用户能插入的最大图片资源
        // ATTACHMENT_PER_PERSON_FOR_ALL_ARTICLE:'4',//每个用户对所有文档的附件

        // IMAGE_PER_IMPEACH_OR_COMMENT:'14', //每个impeach或者comment的图片
        // IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH:'16', //每个用户，在整个impeach和comment的图片

        /****************************/
        /**     只有记录数量      **/
        /****************************/
        MAX_FOLDER_NUM_PER_USER:'100', //最大目录数量

        /**     user friend group               **/
        MAX_FRIEND_GROUP_NUM_PER_USER:'102',//朋友群数量
        // MAX_PERSON_NUM_PER_FRIEND_GROUP:'104',//群中人数最大数量(move的时候使用)

        /**     add friend      **/
        MAX_FRIEND_NUM_PER_USER:'105',//最大朋友数量
        MAX_UNTREATED_ADD_FRIEND_REQUEST_PER_USER:'106', //最大未处理的 添加朋友的请求数
        // MAX_ACCEPT_BUT_NOT_ASSIGN_ADD_FRIEND_REQUEST_PER_USER:'108', //最大已同意但是未被分配到某个朋友群的 添加朋友的请求数

        MAX_NEW_ARTICLE_PER_USER:'110',//新建但未做过任何处理的文档数
        MAX_ARTICLE_PER_USER:'112',//最大文档数（所有状态（删除的不算））

        MAX_COMMENT_PER_ARTICLE:'114', //文档最大评论数
        MAX_COMMENT_PER_ARTICLE_PER_USER:'116',//每用户每文档最大评论数



        MAX_SIMULTANEOUS_NEW_OR_EDITING_IMPEACH_PER_USER:'118',//用户最大编辑中举报
        MAX_REVOKE_IMPEACH_PER_USER:'120',//最大撤销举报数
        MAX_SIMULTANEOUS_WAIT_FOR_ASSIGN_IMPEACH_PER_USER:'122',////用户最大提交当未被处理的举报

        MAX_COMMENT_PER_IMPEACH_PER_USER:'124',//每个举报中，每个用户最多创建的评论

        MAX_PUBLIC_GROUP_NUM:'126',//每个用户最大可创建的公共群
        MAX_MEMBER_PER_GROUP:'128',//每个公共群最大成员数 //虽然是用来数组，但是为update_array方式，所以每次更新时，还是需要具体计算（如果是update_scalar，一次输入整个数据，则可以使用inputRule判断）

        MAX_DECLINE_JOIN_REQUEST:'130',//单个public group，每个用户最大可以被拒绝次数

        // MAX_USER_FRIEND_GROUP_NUM:'132',//每个用户最大可创建的朋友群
    },
    SHOW:{
        /**     存储在coll中    **/
        WHOLE_FILE_RESOURCE_PER_PERSON:'用户文档所有资源',

        /**     每个文档的图片和附件 的文件资源     **/
        IMAGE_PER_ARTICLE:'文档图片',//对文档起作用
        ATTACHMENT_PER_ARTICLE:'文档附件',

        /**     每个举报的图片和附件 的文件资源     **/
        IMAGE_PER_IMPEACH_OR_COMMENT:'单次举报最大可插入图片资源',//每个举报（或者举报处理）最大可插入图片数量
        ATTACHMENT_PER_IMPEACH:'举报附件资源',
        IMAGE_IN_WHOLE_IMPEACH:'整个举报过程中最大可插入图片资源',//整个举报（以及处理过程中）最大可插入图片数量
        IMAGE_PER_USER_IN_WHOLE_IMPEACH:'整个举报过程中用户最大可插入图片资源',//在整个impeach中，单个用户能插入的最大图片资源
        // ATTACHMENT_PER_PERSON_FOR_ALL_ARTICLE:'用户文档附件',//对用户起作用

        // IMAGE_PER_IMPEACH_OR_COMMENT:'举报（或者评论）图片', //举报或者举报评论
        // // IMAGE_PER_COMMENT:'举报图片', //举报或者举报出路
        // IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH:'举报中的用户',  //整个举报中，每个用户
        /**********************/
        /******  number  *****/
        /**********************/
        MAX_FOLDER_NUM_PER_USER:'最大目录数量', //

        /**     user friend group       **/
        MAX_FRIEND_GROUP_NUM_PER_USER:'最大朋友群数量',//朋友群数量

        // MAX_PERSON_NUM_PER_FRIEND_GROUP:'群人数数量',//群中人数最大数量
        /**     add friend request      **/
        MAX_FRIEND_NUM_PER_USER:'最大朋友数量',//最大朋友数量
        MAX_UNTREATED_ADD_FRIEND_REQUEST_PER_USER:'最大未处理的添加朋友的请求数',
        // MAX_ACCEPT_BUT_NOT_ASSIGN_ADD_FRIEND_REQUEST_PER_USER:'最大已同意但是未被分配的添加朋友的请求数', //最大 已同意但是未被分配到某个朋友群的 添加朋友的请求数

        MAX_NEW_ARTICLE_PER_USER:'新建但未做过任何处理的文档数',//新建但未做过任何处理的文档数
        MAX_ARTICLE_PER_USER:'最大文档数',//最大文档数

        MAX_COMMENT_PER_ARTICLE:'文档最大评论数',
        MAX_COMMENT_PER_ARTICLE_PER_USER:'用户对文档的最大评论数',

        MAX_SIMULTANEOUS_NEW_OR_EDITING_IMPEACH_PER_USER:'用户最大编辑中举报数',//用户最大编辑中举报数
        MAX_REVOKE_IMPEACH_PER_USER:'最大撤销举报数',//
        MAX_SIMULTANEOUS_WAIT_FOR_ASSIGN_IMPEACH_PER_USER:'用户最大提交当未被处理的举报数',//用户最大提交当未被处理的举报数

        MAX_COMMENT_PER_IMPEACH_PER_USER:'每个举报中每个用户最多创建的评论',//每个举报中，每个用户最多创建的评论


        MAX_PUBLIC_GROUP_NUM:'每个用户最大可创建的公共群数',//每个用户最大可创建的公共群
        MAX_MEMBER_PER_PUBLIC_GROUP:'每个公共群最大成员数',//每个公共群最大成员数  //虽然是用来数组，但是为update_array方式，所以每次更新时，还是需要具体计算（如果是update_scalar，一次输入整个数据，则可以使用inputRule判断）

        MAX_DECLINE_JOIN_REQUEST:'入群最大被拒次数',//单个public group，每个用户最大可以被拒绝次数


    },
}

//某种资源的级别
const ResourceType={
    DB:{
        BASIC:'1',
        ADVANCED:'2',

    },
    SHOW:{
        BASIC:'基本资源配置',
        ADVANCED:'高级资源配置',
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

/*  发出添加朋友请求后，请求的状态
 */
const AddFriendStatus={
    DB:{
        UNTREATED:'1',
        DECLINE:'2',
        ACCEPT:'3',//同意
        // ACCEPT_BUT_NOT_ASSIGN:'3', //被请求者已经同意，但是请求者没有进行处理（分配到某个group）
        // ACCEPT_AND_ASSIGN:'4',


    },
    SHOW:{
        UNTREATED:'尚未处理',
        DECLINE:'拒绝',
        ACCEPT:'接受',
        // ACCEPT_BUT_NOT_ASSIGN:'接受但未分配',
        // ACCEPT_AND_ASSIGN:'接受',
    },
}

/**     请求加入公共群后，可能的状态      **/
const JoinPublicGroupHandleResult={
    DB:{
        UNTREATED:'1',
        DECLINE:'2',
        ACCEPT:'3', //被请求者已经同意，但是请求者没有进行处理（分配到某个group）



    },
    SHOW:{
        UNTREATED:'尚未处理',
        DECLINE:'拒绝',
        ACCEPT:'接受',
    },
}

/**     请求加为好友后，可能的状态      **/
// const ToBeFriendHandleResult={
//     DB:{
//         UNTREATED:'1',
//         DECLINE:'2',
//         ACCEPT:'3',
//
//
//
//     },
//     SHOW:{
//         UNTREATED:'尚未处理',
//         DECLINE:'拒绝',
//         ACCEPT:'接受',
//     },
// }
module.exports={
    ArticleStatus,
    ArticleAllowComment,
    AddFriendRule,
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
    // ImpeachStatus,
    ImpeachState,
    // ImpeachActionMatchState,
    ImpeachImageReferenceColl,
    DocStatus,
    AccountType,
    StorePathUsage,
    StorePathStatus,
    // ResourceType,
    ResourceRange,
    ResourceType,
    DocumentStatus,
    AddFriendStatus,
    JoinPublicGroupHandleResult,
    // ToBeFriendHandleResult,
}