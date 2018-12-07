/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'

const controllerError={
    //52100~52199
    dispatch:{
        //52100~52110
        'get':{
            notLoginCantGetUnreadRecommend:{rc:52100,msg:`尚未登录，无法读取接收到的未读分享文档`},
            userInPenalizeCantGetUnreadRecommend:{rc:52101,msg:`管理员禁止读取接收到的未读分享文档`},
            notLoginCantGetReadRecommend:{rc:52104,msg:`尚未登录，无法读取接收到的已读分享文档`},
            userInPenalizeCantGetReadRecommend:{rc:52106,msg:`管理员禁止读取接收到的已读分享文档`},
            notLoginCantGetSendRecommend:{rc:52108,msg:`尚未登录，无法读取分享出去的文档`},
            userInPenalizeCantGetSendRecommend:{rc:52109,msg:`管理员禁止读取分享出去的文档`},
        },
        //52110~52120
        'post':{
            notLoginCantCreateRecommend:{rc:50210,msg:`尚未登录，无法创建文档`},
            userInPenalizeCantCreateRecommend:{rc:50212,msg:`管理员禁止创建文档`},

            notLoginCantCreateArticleImage:{rc:50214,msg:`用户尚未登录，无法插入图片`},
            cryptedArticleIdFormatInvalidCantUploadImage:{rc:50214,msg:`文档编号不正确，无法插入图片`},
            decryptedArticleIdFormatInvalidCantUploadImage:{rc:50214,msg:`文档编号不正确，无法插入图片`},
            notLoginCantCreateArticleAttachment:{rc:50216,msg:`用户尚未登录，无法上传附件`},
            cryptedArticleIdFormatInvalidCantUploadAttachment:{rc:50214,msg:`文档编号不正确，无法上传图片`},
            decryptedArticleIdFormatInvalidCantUploadAttachment:{rc:50214,msg:`文档编号不正确，无法上传图片`},
        },
        //52120~52130
        'put':{
            notLoginCantUpdateReceivedRecommend:{rc:52120,msg:`尚未登录，无法读他人发送的分享文档`},
            // userInPenalizeCantUpdateArticle:{rc:50228,msg:`管理员禁止更新文档`},
        },
        //52130~52140
        'delete':{
            // notLoginCantDeleteAttachment:{rc:50230,msg:`尚未登录，无法删除附件`},
            /*            notLoginCantDeleteArticle:{rc:50208,msg:`尚未登录，无法删除文档`},
                        userInPenalizeCantDeleteArticle:{rc:50210,msg:`管理员禁止删除文档`},*/
        },
    },

    logic:{
        //52140~52150
        get:{},
        //52150~52160
        post:{
            cantSendRecommendToSelf:{rc:52150,msg:`不能把文档分享给自己`},
            allReceiversHasAlreadyGetRecommend:{rc:52152,msg:`所有的接收者都已经收到过此分享文档`},
            articleStatusNotFinish:{rc:52154,msg:`文档作者尚未完成文档，无法分享`},
        },
        //52160~52170
        put:{
            noFindReceivedRecommend:{rc:52160,msg:`不存在的未读分享文档`},
            multiReceivedRecommend:{rc:52162,msg:`重复接收到未读分享文档`},
        },
        //52170~52180
        'delete':{},

    },


}

module.exports={
    controllerError,
}