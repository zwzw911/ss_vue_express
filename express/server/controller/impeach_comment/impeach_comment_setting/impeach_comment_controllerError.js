/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={

    dispatch:{
        'post':{
            notLoginCantCreateImpeachComment:{rc:50700,msg:`尚未登录，无法对举报进行评论`},
            userInPenalizeCantCreateImpeachComment:{rc:50702,msg:`您被禁止对举报进行评论`},
            //upload
            notLoginCantUploadImageForImpeachComment:{rc:50707,msg:`尚未登录，无法为举报评论添加图片`},
        },
        'put':{
            //update
            notLoginCantUpdateImpeachComment:{rc:50704,msg:`尚未登录，无法更新举报评论`},
            userInPenalizeCantUpdateImpeachComment:{rc:50706,msg:`您被禁止对举报评论进行更新`},
        },
    },
    /*              dispatch                           */
    //create



    /*              create                          */
    // impeachNotExistCantCreateComment:{rc:51005,msg:`举报不存在`},
    create:{
        // notImpeachCreatorCantCreateComment:{rc:50708,msg:`无权对他人举报进行评论`},
    },

    // impeachNotSubmitNoNeedToAddComment:{rc:50709,msg:`举报尚未提交，请直接修改举报`},

    /*              update                          */
    update:{
        notImpeachCreatorCantUpdateComment:{rc:50712,msg:`无权更改他人举报评论`},
        impeachCommentAlreadyCommitCantBeUpdate:{rc:50714,msg:`举报评论无法被修改`},
    },
    // impeachCommentNotExist:{rc:50710,msg:`举报评论不存在`},




    /*              upload                          */
    upload:{
        notImpeachCommentCreatorCantUploadFile:{rc:50716,msg:`无权为他人举报评论上传文件`},
        cantUploadImageForNonNewImpeachComment:{rc:50717,msg:`无法修改已经提交的举报`},//hacker error

        imageFormatNotSupport:{rc:50718,msg:`只支持JPG/PNG格式的图片`},
        imageResolutionNotSupport:{rc:50719,msg:`图片的分辨率过高`},
    },


/*    resourceRangeNotExpected:{rc:50720,msg:{'client':"内部错误，请联系管理员",server:`非期望的resourceRange`}},
    impeachCommentImageNumExceed:{rc:50722,msg:{'client':"举报对话中插入的图片数量过多，请删除部分图片后再试"}},
    impeachCommentImageSizeExceed:{rc:50723,msg:{'client':"举报对话中插入的图片过大,请删除部分图片后再试"}},
    wholeImpeachImageNumExceed:{rc:50724,msg:{'client':"您在整个举报已经举报对话中插入的图片数量过多，无法继续添加"}},
    wholeImpeachImageSizeExceed:{rc:50726,msg:{'client':"您在整个举报已经举报对话中插入的图片尺寸过大，无法继续添加"}},*/
    // notLoginCantDeleteUser:{rc:51002,msg:`尚未登录，无法删除用户`},
    // notLoginCantSearchUser:{rc:51002,msg:`尚未登录，无法搜索用户`},
    //
    // currentUserHasNotPriorityToDeleteUser:{rc:51006,msg:`当前用户无权删除用户`},
    // currentUserHasNotPriorityToSearchUser:{rc:51007,msg:`当前用户无权搜索用户`},
    //
    // cantCreateRootUserByAPI:{rc:51010,msg:'无法创建root用户'},
    // cantDeleteRootUserByAPI:{rc:51011,msg:'无法删除root用户'},
    // onlyRootCanUpdateRoot:{rc:51012,msg:'无法更新root用户'},
    // // nameAlreadyExists:{rc:50100,msg:`用户名已经存在`}, //key名字必须固定为 field+AlreadyExists
    // // accountAlreadyExists:{rc:50102,msg:`账号已经存在`},
    // // fieldNotSupport:{rc:50104,msg:`字段名称不正确`},
    // /*              login_async               */
    // loginFieldNumNotExpected:{rc:51105,msg:`输入字段字段数量不正确`},
    // loginMandatoryFieldNotExist(fieldName){return {rc:51106,msg:`缺少字段${fieldName}`}},

    /*accountNotExist:{rc:51108,msg:`用户或者密码不正确`},//不能泄露具体信息
    accountPasswordNotMatch:{rc:50110,msg:`用户或者密码不正确`},

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