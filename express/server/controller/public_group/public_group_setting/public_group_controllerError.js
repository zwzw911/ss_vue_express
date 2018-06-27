/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    //51400～51440
    /*              dispatch                           */
    dispatch:{
        post:{
            notLoginCantCreatePublicGroup:{rc:51400,msg:`尚未登录，无法创建群`},
            userInPenalizeCantCreatePublicGroup:{rc:51402,msg:`您被禁止创建群`},
        },
        put:{
            notLoginCantUpdatePublicGroup:{rc:51404,msg:`尚未登录，无法更新群`},
            userInPenalizeCantUpdatePublicGroup:{rc:51406,msg:`您被禁止对群更新`},
        },
        'delete':{
            notLoginCantDeletePublicGroup:{rc:51408,msg:`尚未登录，无法删除群`},
            userInPenalizeCantDeletePublicGroup:{rc:51410,msg:`您被禁止删除群`},
        },
    },

    //update

    //delete

    //08～20预留给其他method
    /*              logic                           */
    create:{},
    // impeachNotExistCantCreateComment:{rc:51005,msg:`举报不存在`},
    // defaultGroupNotExist:{rc:51420,msg:{client:'内部错误，请联系管理员',server:`用户的群:'我的好友'不存在`}},
    publicGroupNumberExceed:{rc:51422,msg:`群数量达到上限`},
    // forbidCreateFieldExist(fieldName){return {rc:51423,msg:{client:`输入错误`,server:`字段${fieldName}不允许被用户创建`}}},
    reachMaxPublicGroupNum:{rc:51424,msg:`达到最大群数，无法继续创建`},
    groupNameAlreadyExistCantCreate:{rc:51426,msg:`群名已经存在，无法继续创建`},
    // update
    update:{
        notUserGroupAdminCantUpdate:{rc:51440,msg:{'client':"无法更新他人数据",server:`recordId对应数据的owner不是当前用户`}},
    },

    // forbidUpdateFieldExist(fieldName){return {rc:51442,msg:{client:`输入错误`,server:`字段${fieldName}不允许被用户更新`}}},
    // notAllowUpdateField:{rc:51440,msg:{'client':"输入数据有误",server:`recordInfo中包含不许更改的字段`}},

    /*notAllowUpdateDefaultRecord:{rc:51442,msg:'无法更改默认记录'},
    mandatoryFieldNotExist:{rc:51443,msg:{client:'输入错误',server:'更新必须字段不存在'}},
    groupNameAlreadyExistCantUpdate:{rc:51444,msg:{'client':"群名已经存在，无法更新",server:`群名已经存在，无法更新`}},
    //edit sub field
    fromToRecordIdNotExists:{rc:51446,msg:{'client':"数据不存在，无法操作",server:`editSubField中，from或者to所指的记录不存在`}},
    notOwnFromToRecordId:{rc:51448,msg:{'client':"无法操作他人群",server:`editSubField中，from或者to所指的记录非当前用户所有`}},*/

    //delete
    'delete':{
        notGroupCreatorCantDelete:{rc:51460,msg:'无法删除他人的公共群'},
        // cantDeleteDefaultGroup:{rc:51462,msg:'不能删除默认分组'},
        cantDeleteGroupContainMember:{rc:51464,msg:'公共群非空，无法删除'},
    },



    //misc
    //requestJoin
    notSupportMethod:{rc:51470,msg:'不支持的method'},//preCheck和logic放在一起处理（简化结构）；为了复用preCheck，还是需要method，设成update
    notFindGroup:{rc:51471,msg:'指定群不存在'},
    groupNotAllowJoin:{rc:51472,msg:'指定群不允许新成员加入'},
    groupMemberReachMax:{rc:51474,msg:'指定群成员数已达上限'},
    alreadyGroupMember:{rc:51476,msg:'已经加入群'},
    alreadySendRequest:{rc:51478,msg:'已经提出申请，等待处理'},

    //adminManageGroupMember
    adminManageGroupMember:{
        notFindGroup:{rc:51480,msg:'指定群不存在'},
        notAdminCantManageGroup:{rc:51482,msg:{client:'无权操作群',server:'当前用户非admin，无权对群进行操作'}},
        missField:{rc:51483,msg:{client:'输入错误',server:'输入参数中没有设置要操作的字段'}},
        onlyPermitAllowNeedAdminOperator:{rc:51484,msg:{client:'输入错误',server:'只有入群rule设成批准加入，才需要管理员进行操作'}},
        requestMemberNotExistInWaitApprove:{rc:51485,msg:{client:'输入错误',server:'待操作用户未请求加入群'}},
        groupMemberReachMax:{rc:51486,msg:{client:'群成员到达上限',server:'群成员达到上限，无法继续批准新成员加入'}},
    },

    adminRemoveMember:{
        notFindGroup:{rc:51490,msg:'指定群不存在'},
        notAdminCantRemoveMember:{rc:51492,msg:{client:'无权操作群',server:'当前用户非admin，无权对群进行操作'}},
        missField:{rc:51494,msg:{client:'输入错误',server:'输入参数中没有设置要操作的字段'}},
        wrongKeyExist:{rc:51496,msg:{client:'输入错误',server:'输入参数中有多余的key'}},
        missMandatoryKey:{rc:51498,msg:{client:'输入错误',server:'输入参数中缺少必须key：remove'}},
        cantRemoveAdmin:{rc:51499,msg:{client:'输入错误',server:'无权删除群管理员'}},
    },

    creatorAddRemoveAdmin:{
        notFindGroup:{rc:51450,msg:'指定群不存在'},
        notCreatorCantAddRemoveAdmin:{rc:51492,msg:{client:'无权操作群',server:'当前用户非群创建者，无权添加删除群管理员'}},
        missField:{rc:51454,msg:{client:'输入错误',server:'输入参数中没有设置要操作的字段'}},
        groupMemberReachMax:{rc:51456,msg:{client:'群成员到达上限',server:'群管理员达到上限，无法继续批准新管理员加入'}},
        // wrongKeyExist:{rc:51496,msg:{client:'输入错误',server:'输入参数中有多余的key'}},
        // missMandatoryKey:{rc:51498,msg:{client:'输入错误',server:'输入参数中缺少必须key：remove'}},
        // cantRemoveAdmin:{rc:51499,msg:{client:'输入错误',server:'无权删除群管理员'}},
    },
}

module.exports={
    controllerError,
}