/**
 * Created by wzhan039 on 2017/10/24.
 */
'use strict'

const controllerError={
   //50600~50650
    dispatch:{
        post:{
            notLoginCantCreateImpeach:{rc:50600,msg:`尚未登录，无法举报`},
            userInPenalizeCantCreateImpeach:{rc:50602,msg:`管理员禁止举报`},
        },
        put:{
            notLoginCantUpdateImpeach:{rc:50604,msg:`尚未登录，无法更新举报`},
            userInPenalizeCantUpdateImpeach:{rc:50606,msg:`管理员禁止举报`},
        },
        'delete':{
            notLoginCantDeleteImpeach:{rc:50604,msg:`尚未登录，无法删除举报`},
            userInPenalizeCantDeleteImpeach:{rc:50606,msg:`管理员禁止删除举报`},
            // userInPenalizeCantUpdateImpeach:{rc:50606,msg:`管理员禁止举报`},
        },
    },

    //50650~50660
    create:{
        cantImpeachMultiItem:{rc:50650,msg:`不能举报多个对象`},
        noImpeachedItem:{rc:50652,msg:`没有设置举报对象`},
        notSetImpeachedArticle:{rc:50654,msg:`没有设置举报文档`},
        notSetImpeachedComment:{rc:50656,msg:`没有设置举报评论`},
        unknownImpeachType:{rc:50658,msg:`未知举报类型，无法创建`},

        // onlyOneImpeachedObjectCanBeSet:{rc:50610,msg:`只能设置一个举报对象`},
    },
    //50660~50670
    update:{
        notAuthorCantUpdateImpeach:{rc:50660,msg:`非举报创建者，无法更新举报`},
        impeachedSubmittedCantUpdate:{rc:50662,msg:`举报已被提交，正在处理，不能更新`},
    },
    //50670~50680
    'delete':{
        notCreatorCantDeleteImpeach:{rc:50670,msg:`非举报创建者，无权删除举报`},
        impeachAlreadyHandledByAdmin:{rc:50672,msg:`举报已被管理员处理中，无法删除`},
    },



    /*          create new impeach              */
    notDefineImpeachType:{rc:50601,msg:`举报类型未设置`},

    // contentSanityFailed:{rc:50606,msg:`举报内容包含有害内容，无法提交`},
    articleAlreadyImpeached:{rc:50605,msg:`已经举报过此文档，无法再次举报`},
    articleCommentAlreadyImpeached:{rc:50607,msg:`已经举报过此评论，无法再次举报`},

    impeachObjectNotExist:{rc:50611,msg:`举报对象不存在`},

    /*          update impeach              */
    // impeachTypeNotAllow:{rc:50610,msg:`无需设置举报类型`},
    userNotLoginCantUpdate:{rc:50612,msg:`用户尚未登录，无法更改`},
    userInPenalizeNoImpeachUpdate:{rc:50613,msg:`管理员禁止更新举报`},
    notAuthorized:{rc:50614,msg:`非举报创建者，无权修改举报`},
    // inputSanityFailed:{rc:50616,msg:`输入内容中包含有害信息`},
    // userInPenalizeNoArticleUpdate:{rc:50209,msg:`管理员禁止更新文档`},
    // inputSanityFailed:{rc:50210,msg:`文档内容中包含有害信息`},
    // notAuthorized:{rc:50212,msg:`无权更改文档`},

    /*      delete impeach              */




    /*              upload                          */
    notImpeachCreatorCantUploadFile:{rc:50626,msg:`无权为他人举报评论上传文件`},
    cantUploadImageForNonNewImpeach:{rc:50727,msg:`无法上传图片`},//hacker error
    imageFormatNotSupport:{rc:50628,msg:`只支持JPG/PNG格式的图片`},
    imageResolutionNotSupport:{rc:50629,msg:`图片的分辨率过高`},

    resourceRangeNotExpected:{rc:50630,msg:{'client':"内部错误，请联系管理员",server:`非期望的resourceRange`}},
    ImpeachImageNumExceed:{rc:50632,msg:{'client':"举报中插入的图片数量过多，请删除部分图片后再试"}},
    ImpeachImageSizeExceed:{rc:50633,msg:{'client':"举报中插入的图片过大,请删除部分图片后再试"}},
    wholeImpeachImageNumExceed:{rc:50634,msg:{'client':"您在整个举报已经举报对话中插入的图片数量过多，无法继续添加"}},
    wholeImpeachImageSizeExceed:{rc:50636,msg:{'client':"您在整个举报已经举报对话中插入的图片尺寸过大，无法继续添加"}},
}

module.exports={
    controllerError
}