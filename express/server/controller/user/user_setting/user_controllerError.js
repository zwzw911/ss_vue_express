/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    dispatch:{
        'get':{
            notLoginCantGetUserInfo:{rc:50100,msg:`尚未登录，无法获得用户信息`},
            notLoginCantSearchUser:{rc:50102,msg:`尚未登录，无法查询用户信息`},
            userInPenalizeCantSearch:{rc:50103,msg:`您被禁止查询用户`},
            cryptedUserIdFormatInvalid:{rc:50104,msg:{client:`用户ID不正确`,server:`加密的userId的格式不正确`}},
            decryptedUserIdFormatInvalid:{rc:50106,msg:{client:`用户ID不正确`,server:`解密后的userId的格式不正确`}},
        },
        'put':{
            notLoginCantUpdateUserInfo:{rc:50110,msg:`尚未登录，无法更新用户信息`},
            userInPenalizeNoPhotoUpload:{rc:50112,msg:`您被禁止上传头像`},
        },
        'post':{
            notLoginCantRetrievePassword:{rc:50120,msg:`尚未登录，无法重置密码`},
        },


        notLoginCantUpdatePassword:{rc:50130,msg:`尚未登录，无法更新密码`},
        notLoginCantUpdateUserPhoto:{rc:50132,msg:`尚未登录，无法上传头像`},

    },
    /*              common                          */

    nameAlreadyExists:{rc:50140,msg:`用户名已经存在`}, //key名字必须固定为 field+AlreadyExists
    accountAlreadyExists:{rc:50142,msg:`账号已经存在`},
    fieldNotSupport:{rc:50144,msg:`字段名称不正确`},
    login:{
        loginMandatoryFieldNotExist(fieldName){return {rc:50146,msg:`缺少字段${fieldName}`}},
        loginFieldNumNotExpected:{rc:50147,msg:`输入字段字段数量不正确`},
        accountNotExist:{rc:50148,msg:`用户名或者密码不正确`},//不能泄露具体信息
        accountPasswordNotMatch:{rc:50150,msg:`用户名或者密码不正确`},
    },


    /*              logout_async            */
    logout:{
        destroySessionFailed:{rc:50152,msg:`退出失败`},
    },

    /*              updateUser_async            */
    notLoginCantUpdate:{rc:50160,msg:`尚未登录，无法执行用户信息更改`},
    cantUpdateOwnProfile:{rc:50162,msg:`只能更改自己的信息`},
    userNotExist:{rc:50164,msg:`用户信息不存在`},//update的时候，无法根据req.session.userId找到对应的记录
    userNoMatchSugar:{rc:50166,msg:`用户信息不完整，请联系管理员`},
    accountCantChange:{rc:50168,msg:`更改账号过于频繁，请明天再试`},

    /*              retrievePassword_async          */
    retrievePassword:{
        fieldNameWrong:{rc:50170,msg:{client:`输入值错误`,server:``}},
        accountNotUnique:{rc:50172,msg:`账号错误，请联系管理员`},
    },


    /*              upload user photo               */
    uploadUserPhoto:{
        expectedFieldValueUndefined:{rc:50174,msg:`头像的值为空`},
        notLoginCantUpload:{rc:50176,msg:`尚未登录，无法上传头像`},

        imageSizeInvalid:{rc:50178,msg:`头像的宽度或者高度超出最大值`},
        imageFormatInvalid:{rc:50180,msg:`头像的格式不正确`},
    },

    /*              captcha                          */
    intervalBetween2CaptchaTooShort:{rc:50182,msg:`请求过于频繁，请稍候再试`},
    captchaReqNumInDurationExceed:{rc:50184,msg:`请求次数过多，请稍候再试`},

    /*              change password                    */
    changePasswordInputRecordInfoFormatInCorrect:{rc:50186,msg:{client:`输入格式错误`,server:`输入中，RECORD_INFO的格式不正确`}},
    changePasswordInputFormatNotExpected:{rc:50188,msg:{client:`输入格式错误`,server:`输入格式和预期的不一致`}},
    missMandatoryField:{rc:50190,msg:{client:`输入值错误`,server:`必须字段没有对应的值`}},
    fieldValueTypeIncorrect:{rc:50192,msg:{client:`输入值错误`,server:`字段值类型不正确`}},
    fieldValueFormatIncorrect:{rc:50194,msg:{client:`输入值错误`,server:`字段值格式不正确`}},
    oldPasswordIncorrect:{rc:50196,msg:{client:`旧密码不正确`,server:`旧密码不正确`}},

    getUser:{
        userIdUndefined:{rc:50197,msg:{client:`用户信息不正确，请重新登录`,server:`session的userInfo中，userId为undefined`}},
        userIdFormatIncorrect:{rc:50198,msg:{client:`用户信息不正确，请重新登录`,server:`session的userInfo中，userId格式不是objectId`}},
    },
}

module.exports={
    controllerError,
}