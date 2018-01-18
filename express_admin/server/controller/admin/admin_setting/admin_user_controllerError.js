/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*              create                          */

    notLoginCantCreateUser:{rc:51000,msg:`尚未登录，无法创建新用户`},
    notLoginCantUpdateUser:{rc:51001,msg:`尚未登录，无法更新用户`},
    notLoginCantDeleteUser:{rc:51002,msg:`尚未登录，无法删除用户`},
    notLoginCantSearchUser:{rc:51002,msg:`尚未登录，无法搜索用户`},
    currentUserHasNotPriorityToCreateUser:{rc:51004,msg:`当前用户无权创建新用户`},
    currentUserHasNotPriorityToUpdateUser:{rc:51005,msg:`当前用户无权更新用户`},
    currentUserHasNotPriorityToDeleteUser:{rc:51006,msg:`当前用户无权删除用户`},
    currentUserHasNotPriorityToSearchUser:{rc:51007,msg:`当前用户无权搜索用户`},

    cantCreateRootUserByAPI:{rc:51010,msg:'无法创建root用户'},
    cantDeleteRootUserByAPI:{rc:51011,msg:'无法删除root用户'},
    onlyRootCanUpdateRoot:{rc:51012,msg:'无法更新root用户'},

    createUserPriorityNotInheritedFromParent:{rc:51013,msg:'创建新用户时，权限不能超出创建者的权限'},
    createUserPriorityCantDuplicate:{rc:51014,msg:'创建新用户时，权限不能重复'},
    // nameAlreadyExists:{rc:50100,msg:`用户名已经存在`}, //key名字必须固定为 field+AlreadyExists
    // accountAlreadyExists:{rc:50102,msg:`账号已经存在`},
    // fieldNotSupport:{rc:50104,msg:`字段名称不正确`},
    /*              login_async               */
    loginFieldNumNotExpected:{rc:51015,msg:`输入字段字段数量不正确`},
    loginMandatoryFieldNotExist(fieldName){return {rc:51016,msg:`缺少字段${fieldName}`}},
    userNameNotExist:{rc:51018,msg:`用户或者密码不正确`},
    passwordNotMatch:{rc:51020,msg:`用户或者密码不正确`},

    /*                  updateUser_async                */
    updatePriorityNotInheritedFromParent:{rc:51022,msg:'更新用户时，权限不能超出创建者的权限'},
    updateUserPriorityCantDuplicate:{rc:51024,msg:'创建新用户时，权限不能重复'},
    /*//不能泄露具体信息
    ,

    /!*              updateUser_async            *!/

    // notLogin:{rc:50112,msg:`尚未登录，无法执行用户信息更改`},
    cantUpdateOwnProfile:{rc:50114,msg:`只能更改自己的信息`},
    userNotExist:{rc:50116,msg:`用户信息不存在`},//update的时候，无法根据req.session.userId找到对应的记录
    userNoMatchSugar:{rc:50118,msg:`用户信息不完整，请联系管理员`},
    accountCantChange:{rc:50120,msg:`更改账号过于频繁，请明天再试`},

    /!*              retrievePassword_async          *!/
    accountNotUnique:{rc:50122,msg:`账号错误，请联系管理员`},

    /!*              upload user photo               *!/
    imageSizeInvalid:{rc:50130,msg:`头像的宽度或者高度超出最大值`},


    /!*              captcha                          *!/
    intervalBetween2CaptchaTooShort:{rc:50132,msg:`请求过于频繁，请稍候再试`},
    captchaReqNumInDurationExceed:{rc:50134,msg:`请求次数过多，请稍候再试`},*/

}

module.exports={
    controllerError,
}