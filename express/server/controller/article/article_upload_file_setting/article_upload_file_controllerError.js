/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'

const controllerError={
    /*          common              */
    /*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
     switch (fieldName){
     case e_field.article
     }
     return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/



    /*          preCheck                */
    userNotLoginCantCreateArticleImage:{rc:50400,msg:`用户尚未登录，无法插入图片`},
    undefinedRangeType:{rc:50402,msg:{client:`内部参数错误，请联系管理员`,server:`未定义的rangeType`}},
    userInPenalizeNoArticleUpdate:{rc:50403,msg:`管理员禁止更新文档`},

    /*          logic                   */
    notArticleAuthorCantInsertFile:{rc:50404,msg:{client:`无权插入图片或者附件`,server:`非文档作者，无权插入图片或者附件`}},

    //image 超出 resource_profile
    articleImageSizeExceed:{rc:50405,msg:{client:`文档图片总容量达到最大值，无法继续添加图片`,server:`文档图片容量达到最大`}},
    articleImageNumExceed:{rc:50406,msg:{client:`文档图片数量达到最大值，无法继续添加图片`,server:`文档图片数量达到最大`}},
    //attachment 超出 resource_profile
    articleAttachmentSizeExceed:{rc:50408,msg:{client:`文档附件总容量达到最大值，无法继续添加附件`,server:`文档附件容量达到最大`}},
    articleAttachmentNumExceed:{rc:50410,msg:{client:`文档附件数量达到最大值，无法继续添加附件`,server:`文档附件数量达到最大`}},
    //总量（用户为单位） 超出 resource_profile
    personalSizeExceed:{rc:50412,msg:{client:`个人空间达到最大值，无法继续添加文件`,server:`个人空间容量达到最大`}},
    personalFileNumExceed:{rc:50414,msg:{client:`个人文件数量达到最大值，无法继续添加`,server:`个人文件数量达到最大`}},

    notSupportImageFormat:{rc:50416,msg:`图片格式不支持`},
    notSupportAttachmentFormat:{rc:50418,msg:`附件格式不支持`},

}

module.exports={
    controllerError,
}