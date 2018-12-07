/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    //51700~51740
    /*              dispatch                           */
    dispatch:{
        'post':{
            notLoginCantCreateUserFriendGroup:{rc:51700,msg:`尚未登录，无法创建好友分组`},
            userInPenalizeCantCreateUserFriendGroup:{rc:51702,msg:`您被禁止创建好友分组`},
        },
        'put':{
            notLoginCantUpdateUserFriendGroup:{rc:51710,msg:`尚未登录，无法更新好友分组`},
            userInPenalizeCantUpdateUserFriendGroup:{rc:51712,msg:`您被禁止对好友分组更新`},

            // userInPenalizeCantUpdateAddFriend:{rc:51906,msg:`您被禁止添加好友`},
            notLoginCantMoveFriend:{rc:51714,msg:`尚未登录，无法移动好友`},
            userInPenalizeCantMoveFriend:{rc:51715,msg:`您被禁止添加好友`},
        },
        'delete':{
            notLoginCantDeleteUserFriendGroup:{rc:51720,msg:`尚未登录，无法删除好友分组`},
            userInPenalizeCantDeleteUserFriendGroup:{rc:51722,msg:`您被禁止删除好友分组`},
        },
        'get':{
            notLoginCantGetUserFriendGroup:{rc:51730,msg:`尚未登录，无法获得好友分组`},
            notLoginCantGetUserFriendGroupAndItsMember:{rc:51732,msg:`尚未登录，无法获得好友分组以及其下成员`},
            notLoginCantGetUserFriendGroupMember:{rc:51734,msg:`尚未登录，无法获得好友分组以及其下成员`},
            encryptedFriendGroupIdFormatInvalid:{rc:51736,msg:`好友分组编号不正确`},
            decryptedFriendGroupIdFormatInvalid:{rc:51737,msg:`好友分组编号不正确`},

            notLoginCantSearchFriend:{rc:51738,msg:`尚未登录，无法查询好友`},
        },
    },


    //08～20预留给其他method
    /*              logic                           */
    create:{
        defaultGroupNotExist:{rc:51720,msg:{client:'内部错误，请联系管理员',server:`用户的好友分组:'我的好友'不存在`}},
        defaultGroupNumberExceed:{rc:51722,msg:`'我的好友'中，好友数量达到上限`},
        reachMaxUserFriendGroupNum:{rc:51724,msg:`达到最大好友分组数，无法继续创建`},
        groupNameAlreadyExistCantCreate:{rc:51726,msg:`好友分组名已经存在，无法继续创建`},
        notOwnerCantGetGroupMember:{rc:51727,msg:`不是您的好友分组，无法读取其中成员信息`},
    },

    update:{
        notUserGroupOwnerCantUpdate:{rc:51740,msg:{'client':"无法更新他人数据",server:`recordId对应数据的owner不是当前用户`}},
        forbidUpdateFieldExist(fieldName){return {rc:51742,msg:{client:`输入错误`,server:`字段${fieldName}不允许被用户更新`}}},
        notAllowUpdateDefaultRecord:{rc:51742,msg:'无法更改默认记录'},
        // mandatoryFieldNotExist:{rc:51743,msg:{client:'输入错误',server:'更新必须字段不存在'}},
        // groupNameAlreadyExistCantUpdate:{rc:51744,msg:{'client':"好友分组名已经存在，无法更新",server:`好友分组名已经存在，无法更新`}},
        //edit sub field

    },

    'delete':{
        notUserGroupOwnerCantDelete:{rc:51760,msg:'无法删除他人好友分组'},
        cantDeleteDefaultGroup:{rc:51762,msg:'不能删除默认分组'},
        cantDeleteGroupContainFriend:{rc:51764,msg:'好用分组非空，无法删除'},
    },
    //delete
    moveFriend:{
        fromToRecordIdNotExists:{rc:51746,msg:{'client':"数据不存在，无法操作",server:`editSubField中，from或者to所指的记录不存在`}},
        notOwnFromToRecordId:{rc:51748,msg:{'client':"无法操作他人好友分组",server:`editSubField中，from或者to所指的记录非当前用户所有`}},
        // fromRecordIdNotExists:{rc:51724,msg:{'client':"数据不存在，无法操作",server:`editSubField中，from所指的记录不存在`}},
        // notOwnFromRecordId:{rc:51726,msg:{'client':"无法操作他人好友分组",server:`editSubField中，from所指的记录非当前用户所有`}},
        // toRecordIdNotExists:{rc:51720,msg:{'client':"数据不存在，无法操作",server:`editSubField中，to所指的记录不存在`}},
        // notOwnToRecordId:{rc:51730,msg:{'client':"无法操作他人好友分组",server:`editSubField中，to所指的记录非当前用户所有`}},

    },

    /*//upload
    notImpeachCreatorCantUploadFile:{rc:50716,msg:`无权为他人举报评论上传文件`},
    imageFormatNotSupport:{rc:50717,msg:`只支持JPG/PNG格式的图片`},
    imageResolutionNotSupport:{rc:50718,msg:`图片的分辨率过高`},

    resourceRangeNotExpected:{rc:50720,msg:{'client':"内部错误，请联系管理员",server:`非期望的resourceRange`}},
    ImpeachImageNumExceed:{rc:50722,msg:{'client':"举报对话中插入的图片数量过多，请删除部分图片后再试"}},
    ImpeachImageSizeExceed:{rc:50722,msg:{'client':"举报对话中插入的图片过大,请删除部分图片后再试"}},
    wholeImpeachImageNumExceed:{rc:50724,msg:{'client':"您在整个举报已经举报对话中插入的图片数量过多，无法继续添加"}},
    wholeImpeachImageSizeExceed:{rc:50724,msg:{'client':"您在整个举报已经举报对话中插入的图片尺寸过大，无法继续添加"}},*/
}

module.exports={
    controllerError,
}