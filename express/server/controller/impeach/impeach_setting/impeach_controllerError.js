/**
 * Created by wzhan039 on 2017/10/24.
 */
'use strict'

const controllerError={
    /*          common              */
    /*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
     switch (fieldName){
     case e_field.article
     }
     return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/

    /*          create new impeach              */
    notDefineImpeachType:{rc:50601,msg:`举报类型未设置`},
    userNotLoginCantCreate:{rc:50602,msg:`尚未登录，无法举报`},
    // userNoDefaultFolder:{rc:50205,msg:`没有默认目录，无法创建新文档`},
    userInPenalizeNoImpeachCreate:{rc:50604,msg:`管理员禁止举报`},
    // contentSanityFailed:{rc:50606,msg:`举报内容包含有害内容，无法提交`},
    articleAlreadyImpeached:{rc:50605,msg:`已经举报过此文档，无法再次举报`},
    articleCommentAlreadyImpeached:{rc:50607,msg:`已经举报过此评论，无法再次举报`},
    unknownImpeachType:{rc:50608,msg:`未知举报类型，无法创建`},
    noImpeachedObject:{rc:50609,msg:`没有设置举报对象`},
    onlyOneImpeachedObjectCanBeSet:{rc:50610,msg:`只能设置一个举报对象`},
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
    userNotLoginCantDelete:{rc:50618,msg:`用户尚未登录，无法删除`},
    userInPenalizeNoImpeachDelete:{rc:50620,msg:`管理员禁止删除举报`},
    notCreatorCantDeleteImpeach:{rc:50622,msg:`非举报创建者，无权删除举报`},
    impeachAlreadyHandledByAdmin:{rc:50624,msg:`举报曾被管理员处理中，无法删除`},

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