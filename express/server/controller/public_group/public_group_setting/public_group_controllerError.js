/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*              dispatch                           */
    //create
    notLoginCantCreatePublicGroup:{rc:51400,msg:`尚未登录，无法创建群`},
    inPenalizeCantCreatePublicGroup:{rc:51402,msg:`您被禁止创建群`},
    //update
    notLoginCantUpdatePublicGroup:{rc:51404,msg:`尚未登录，无法更新群`},
    inPenalizeCantUpdatePublicGroup:{rc:51406,msg:`您被禁止对群更新`},
    //delete
    notLoginCantDeletePublicGroup:{rc:51408,msg:`尚未登录，无法删除群`},
    inPenalizeCantDeletePublicGroup:{rc:51410,msg:`您被禁止删除群`},
    //08～20预留给其他method
    /*              logic                           */
    //create
    // impeachNotExistCantCreateComment:{rc:51005,msg:`举报不存在`},
    // defaultGroupNotExist:{rc:51420,msg:{client:'内部错误，请联系管理员',server:`用户的群:'我的好友'不存在`}},
    publicGroupNumberExceed:{rc:51422,msg:`群数量达到上限`},
    forbidCreateFieldExist(fieldName){return {rc:51423,msg:{client:`输入错误`,server:`字段${fieldName}不允许被用户创建`}}},
    reachMaxPublicGroupNum:{rc:51424,msg:`达到最大群数，无法继续创建`},
    groupNameAlreadyExistCantCreate:{rc:51426,msg:`群名已经存在，无法继续创建`},
    // update
    notUserGroupOwnerCantUpdate:{rc:51440,msg:{'client':"无法更新他人数据",server:`recordId对应数据的owner不是当前用户`}},
    forbidUpdateFieldExist(fieldName){return {rc:51442,msg:{client:`输入错误`,server:`字段${fieldName}不允许被用户更新`}}},
    notAllowUpdateDefaultRecord:{rc:51442,msg:'无法更改默认记录'},
    mandatoryFieldNotExist:{rc:51443,msg:{client:'输入错误',server:'更新必须字段不存在'}},
    groupNameAlreadyExistCantUpdate:{rc:51444,msg:{'client':"群名已经存在，无法更新",server:`群名已经存在，无法更新`}},
    //edit sub field
    fromToRecordIdNotExists:{rc:51446,msg:{'client':"数据不存在，无法操作",server:`editSubField中，from或者to所指的记录不存在`}},
    notOwnFromToRecordId:{rc:51448,msg:{'client':"无法操作他人群",server:`editSubField中，from或者to所指的记录非当前用户所有`}},

    //delete
    notUserGroupOwnerCantDelete:{rc:51460,msg:'无法删除他人群'},
    cantDeleteDefaultGroup:{rc:51462,msg:'不能删除默认分组'},
    cantDeleteGroupContainFriend:{rc:51464,msg:'好用分组非空，无法删除'},

}

module.exports={
    controllerError,
}