/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    //51900~51920
    dispatch:{
        'post':{
            notLoginCantCreateAddFriend:{rc:51900,msg:`尚未登录，无法添加好友`},
            userInPenalizeCantCreateAddFriend:{rc:51902,msg:`您被禁止添加好友`},
        },
        'put':{
            notLoginCantUpdateAddFriend:{rc:51904,msg:`尚未登录，无法处理添加好友请求`},
            // userInPenalizeCantUpdateAddFriend:{rc:51906,msg:`您被禁止处理添加好友请求`},
        },
    },
    //create

    //update

    //delete
    // notLoginCantDeleteUserFriendGroup:{rc:51908,msg:`尚未登录，无法删除好友分组`},
    // currentUserForbidToDeleteUserFriendGroup:{rc:51910,msg:`您被禁止删除好友分组`},
    //08～20预留给其他method
    //51920~51940
    create:{
        addFriendNotAllow:{rc:51920,msg:{client:`用户不允许添加朋友`,server:`用户不允许添加朋友`}},
        cantAddSelfAsFriend:{rc:51921,msg:{client:`无法添加自己作为好友`,server:`无法添加自己作为好友`}},
        alreadyFriendCantAddAgain:{rc:51922,msg:{client:`对方已经是您的好友`,server:`已经是好友，无法继续添加`}},
        addFriendRuleUndefined:{rc:51923,msg:{client:`用户信息错误`,server:`用户信息中，addFriendRule为undefined`}},
        acceptTimesExceed:{rc:51924,msg:{client:`您将当前用户添加过好友的次数过多，无法继续添加`,server:`添加同一好友次数过多`}},
        declineTimesExceed:{rc:51926,msg:{client:`您被当前用户拒绝次数过多，无法继续添加`,server:`添加同一好友被拒次数过多`}},
        userGroupNotFind:{rc:51927,msg:{client:`用户未找到，无法添加为朋友`,server:`用户未找到，无法添加为朋友`}},
        // defaultGroupNotExist:{rc:51920,msg:{client:`内部错误，请联系管理员`,server:`好友分组：'我的好友'不存在`}},
        // defaultGroupNumberExceed:{rc:51922,msg:{client:`内部错误，请联系管理员`,server:`好友分组：'我的好友'已经达到上限`}},
        // receiverAlreadyBeFriend(userName){return {rc:51924,msg:`用户${userName}已经是是好友`}},
    },
    //create
    // impeachNotExistCantCreateComment:{rc:51005,msg:`举报不存在`},


    //51940~51960
    update:{
        notReceiverCantUpdate:{rc:51940,msg:`无权对他人添加朋友的请求进行处理`},
        requestAlreadyBeTreatedCantDeclineAgain:{rc:51942,msg:{client:`添加好友请求已被处理`,server:`添加好友请求已经被处理，无法执行拒绝操作`}},
        requestAlreadyBeAcceptCantAcceptAgain:{rc:51944,msg:{client:`添加好友请求已被同意`,server:`添加好友请求已经被同意，无法执行同意操作`}},
        // forbidUpdateFieldExist(fieldName){return {rc:51942,msg:{client:`输入错误`,server:`字段${fieldName}不允许被用户更新`}}},
        // mandatoryFieldNotExist:{rc:51944,msg:`必须字段不存在`},
        // statusValueInvalid:{rc:51946,msg:`状态的请求不正确`},
    },

    //upload
   /* notImpeachCreatorCantUploadFile:{rc:50716,msg:`无权为他人举报评论上传文件`},
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