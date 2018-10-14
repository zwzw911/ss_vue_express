/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'

const controllerError={
    //50200~50240
    dispatch:{
        'get':{
            notLoginCantGetArticle:{rc:50200,msg:`尚未登录，无法读取文档`},
            userInPenalizeCantGetArticle:{rc:50202,msg:`管理员禁止读取文档`},
            cryptedArticleIdFormatInvalid:{rc:50204,msg:`文档编号不正确`},
            decryptedArticleIdFormatInvalid:{rc:50206,msg:`文档编号不正确`},
            notLoginCantDownloadAttachment:{rc:50207,msg:`尚未登录，无法下载附件`},
            cryptedAAttachmentIdFormatInvalidCantDownload:{rc:50208,msg:`附件编号格式错误，无法下载`},
            decryptedAttachmentIdFormatInvalidCantDownload:{rc:50209,msg:`附件编号格式错误，无法下载`},

        },
        'post':{
            notLoginCantCreateArticle:{rc:50210,msg:`尚未登录，无法创建文档`},
            userInPenalizeCantCreateArticle:{rc:50212,msg:`管理员禁止创建文档`},

            notLoginCantCreateArticleImage:{rc:50214,msg:`用户尚未登录，无法插入图片`},
            cryptedArticleIdFormatInvalidCantUploadImage:{rc:50214,msg:`文档编号不正确，无法插入图片`},
            decryptedArticleIdFormatInvalidCantUploadImage:{rc:50214,msg:`文档编号不正确，无法插入图片`},
            notLoginCantCreateArticleAttachment:{rc:50216,msg:`用户尚未登录，无法上传附件`},
            cryptedArticleIdFormatInvalidCantUploadAttachment:{rc:50214,msg:`文档编号不正确，无法上传图片`},
            decryptedArticleIdFormatInvalidCantUploadAttachment:{rc:50214,msg:`文档编号不正确，无法上传图片`},
        },
        'put':{
            notLoginCantUpdateArticle:{rc:50220,msg:`尚未登录，无法更新文档`},
            userInPenalizeCantUpdateArticle:{rc:50228,msg:`管理员禁止更新文档`},
        },
        'delete':{
            notLoginCantDeleteAttachment:{rc:50230,msg:`尚未登录，无法删除附件`},
            /*            notLoginCantDeleteArticle:{rc:50208,msg:`尚未登录，无法删除文档`},
                        userInPenalizeCantDeleteArticle:{rc:50210,msg:`管理员禁止删除文档`},*/
        },
    },



    //50240~50250
    create:{
        // userNoDefaultFolder:{rc:50204,msg:`尚未登录，无法更新文档`}
    },

    //50250~50260
    update:{
        notAuthorCantUpdateArticle:{rc:50250,msg:`无权修改文档`},

    },
    //50260~50270
    upload:{
        notAuthorCantUploadImage:{rc:50260,msg:`无权上传图片`},
        notAuthorCantUploadAttachment:{rc:50261,msg:`无权上传附件`},

        noUploadImage:{rc:50262,msg:`无上传图片`},
        noUploadAttachment:{rc:50263,msg:`无上传附件`},

        imageFormatNotSupport:{rc:50264,msg:`只支持JPG/PNG格式的图片`},
        imageResolutionNotSupport:{rc:50266,msg:`图片分辨率过高`},

        attachmentFormatIncorrect:{rc:502068,msg:`附件格式不正确`},
        attachmentFormatNotSupport:{rc:50269,msg:`附件格式不支持`},
    },
    //50270~50280
    'delete':{
        notAttachmentAuthorCantDeleteAttachment:{rc:50270,msg:`无权删除附件`},
        notArticleAuthorCantDeleteAttachment:{rc:50272,msg:`无权删除附件`},
    },
    //50280~50290
    'get':{
        notAuthorCantGetFolder:{rc:50280,msg:`非文档作者，无法更新文档`},
        articleNotExist:{rc:50282,msg:`文档不存在`},
        articleEditing:{rc:50284,msg:`文档更新中，无法读取`},
    },
    //50290~50299
    download:{
        attachmentNotExist:{rc:50290,msg:`附件不存在`},
    },
    // userNotLoginCantUpdate:{rc:50208,msg:`用户尚未登录，无法更改文档`},
    // userInPenalizeNoArticleUpdate:{rc:50209,msg:`管理员禁止更新文档`},
    // htmlContentSanityFailed:{rc:50210,msg:`文档内容中包含有害信息`},

    /*notAuthorized:{rc:50212,msg:`无权更改文档`},
    notAuthorizedFolder:{rc:50214,msg:`非目录创建者，无权在目录中添加文档`},



    /!*          preCheck                *!/

    undefinedRangeType:{rc:50202,msg:{client:`内部参数错误，请联系管理员`,server:`未定义的rangeType`}},
    // userInPenalizeNoArticleUpdate:{rc:50203,msg:`管理员禁止更新文档`},

    /!*          logic                   *!/
    notArticleAuthorCantUploadImage:{rc:50204,msg:{client:`无权插入图片或者附件`,server:`非文档作者，无权插入图片或者附件`}},
    notArticleAuthorCantUploadAttachment:{rc:50206,msg:{client:`无权插入图片或者附件`,server:`非文档作者，无权插入图片或者附件`}},
    /!*          upload image        *!/


    //image 超出 resource_profile
    articleImageSizeExceed:{rc:50212,msg:{client:`文档图片总容量达到最大值，无法继续添加图片`,server:`文档图片容量达到最大`}},
    articleImageNumExceed:{rc:50214,msg:{client:`文档图片数量达到最大值，无法继续添加图片`,server:`文档图片数量达到最大`}},
    //attachment 超出 resource_profile
    /!*    articleAttachmentSizeExceed:{rc:50208,msg:{client:`文档附件总容量达到最大值，无法继续添加附件`,server:`文档附件容量达到最大`}},
        articleAttachmentNumExceed:{rc:50210,msg:{client:`文档附件数量达到最大值，无法继续添加附件`,server:`文档附件数量达到最大`}},*!/
    /!*          upload attachment       *!/

    articleAttachmentSizeExceed:{rc:50212,msg:{client:`文档附件总容量达到最大值，无法继续添加图片`,server:`文档附件容量达到最大`}},
    articleAttachmentNumExceed:{rc:50214,msg:{client:`文档附件数量达到最大值，无法继续添加图片`,server:`文档附件数量达到最大`}},

    //总量（用户为单位） 超出 resource_profile
    personalSizeExceed:{rc:50212,msg:{client:`个人空间达到最大值，无法继续添加文件`,server:`个人空间容量达到最大`}},
    personalFileNumExceed:{rc:50214,msg:{client:`个人文件数量达到最大值，无法继续添加`,server:`个人文件数量达到最大`}},*/

    // notSupportImageFormat:{rc:50216,msg:`图片格式不支持`},


    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}

module.exports={
    controllerError,
}