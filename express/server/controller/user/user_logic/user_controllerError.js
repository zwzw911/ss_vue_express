/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*              common                          */

    nameAlreadyExists:{rc:50100,msg:`用户名已经存在`}, //key名字必须固定为 field+AlreadyExists
    accountAlreadyExists:{rc:50102,msg:`账号已经存在`},
    fieldNotSupport:{rc:50104,msg:`字段名称不正确`},
    /*              login_async               */
    loginMandatoryFieldNotExist(fieldName){return {rc:50106,msg:`缺少字段${fieldName}`}},
    loginFieldNumNotExpected:{rc:50107,msg:`输入字段字段数量不正确`},
    accountNotExist:{rc:50108,msg:`用户或者密码不正确`},//不能泄露具体信息
    accountPasswordNotMatch:{rc:50110,msg:`用户或者密码不正确`},

    /*              updateUser_async            */
    // notLogin:{rc:50112,msg:`尚未登录，无法执行用户信息更改`},
    cantUpdateOwnProfile:{rc:50114,msg:`只能更改自己的信息`},
    userNotExist:{rc:50116,msg:`用户信息不存在`},//update的时候，无法根据req.session.userId找到对应的记录
    userNoMatchSugar:{rc:50118,msg:`用户信息不完整，请联系管理员`},
    accountCantChange:{rc:50120,msg:`更改账号过于频繁，请明天再试`},

    /*              retrievePassword_async          */
    accountNotUnique:{rc:50122,msg:`账号错误，请联系管理员`},

    /*              upload user photo               */
    imageSizeInvalid:{rc:50130,msg:`头像的宽度或者高度超出最大值`},


    /*              captcha                          */
    intervalBetween2CaptchaTooShort:{rc:50132,msg:`请求过于频繁，请稍候再试`},
    captchaReqNumInDurationExceed:{rc:50134,msg:`请求次数过多，请稍候再试`},

}

module.exports={
    controllerError,
}