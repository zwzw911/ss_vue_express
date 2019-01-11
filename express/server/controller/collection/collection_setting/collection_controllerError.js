/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'

const controllerError={
    //52200~52299
    dispatch:{
        //52200~52210
        'get':{
            notLoginCantGetCollectionList:{rc:52200,msg:`尚未登录，无法读取收藏的文档`},
            userInPenalizeCantGetCollectionList:{rc:52201,msg:`管理员禁止读取收藏的文档`},
            unknownTypeInUrl:{rc:52202,msg:`未设置读取类型，无法读取收藏夹`},
            notLoginCantGetCollectionContent:{rc:52204,msg:`尚未登录，无法读取接收到的已读分享文档`},
            userInPenalizeCantGetCollectionContent:{rc:52206,msg:`管理员禁止读取接收到的已读分享文档`},
            encryptedObjectIdFormatInvalid:{rc:52208,msg:`加密的收藏夹的id格式不正确`},
            decryptedObjectIdFormatInvalid:{rc:52208,msg:`解密后的收藏夹的id格式不正确`},
            // notLoginCantGetSendRecommend:{rc:52208,msg:`尚未登录，无法读取分享出去的文档`},
            // userInPenalizeCantGetSendRecommend:{rc:52209,msg:`管理员禁止读取分享出去的文档`},
        },
        //52210~52220
        'post':{
            notLoginCantCreateCollection:{rc:52210,msg:`尚未登录，无法创建收藏夹`},
            userInPenalizeCantCreateCollection:{rc:52212,msg:`管理员禁止创建收藏夹`},

            // notLoginCantCreateArticleImage:{rc:52214,msg:`用户尚未登录，无法插入图片`},
            // cryptedArticleIdFormatInvalidCantUploadImage:{rc:52214,msg:`文档编号不正确，无法插入图片`},
            // decryptedArticleIdFormatInvalidCantUploadImage:{rc:52214,msg:`文档编号不正确，无法插入图片`},
            // notLoginCantCreateArticleAttachment:{rc:52216,msg:`用户尚未登录，无法上传附件`},
            // cryptedArticleIdFormatInvalidCantUploadAttachment:{rc:52214,msg:`文档编号不正确，无法上传图片`},
            // decryptedArticleIdFormatInvalidCantUploadAttachment:{rc:52214,msg:`文档编号不正确，无法上传图片`},
        },
        //52220~52230
        'put':{
            notLoginCantUpdateCollectionName:{rc:52220,msg:`尚未登录，无法更新收藏夹名称`},
            userInPenalizeCantUpdateCollectionName:{rc:52222,msg:`管理员禁止更新收藏夹名称`},
            notLoginCantUpdateCollectionContent:{rc:52224,msg:`尚未登录，无法更新收藏夹内容`},
            userInPenalizeCantUpdateCollectionContent:{rc:52226,msg:`管理员禁止更新收藏夹内容`},
            // userInPenalizeCantUpdateArticle:{rc:52228,msg:`管理员禁止更新文档`},
        },
        //52230~52240
        'delete':{
            notLoginCantDeleteCollection:{rc:52230,msg:`尚未登录，无法删除收藏夹`},
            userInPenalizeCantDeleteCollection:{rc:52232,msg:`管理员禁止删除收藏夹`},
            /*            notLoginCantDeleteArticle:{rc:52208,msg:`尚未登录，无法删除文档`},
                        userInPenalizeCantDeleteArticle:{rc:52210,msg:`管理员禁止删除文档`},*/
        },
    },

    logic:{
        //52240~52250
        get:{
            notCreatorCantReadCollectionContent:{rc:52240,msg:`无法读取他人的收藏夹内容`},
            unknownTypeCantGetCollection:{rc:52242,msg:`未设置读取类型，无法读取收藏夹`},
        },
        //52250~52260
        post:{
            parentCollectionIncorrect:{rc:52250,msg:{client:`父收藏夹不正确`,server:`父收藏夹必须是顶级收藏夹`}},
            cantFindTopParentCollectionId:{rc:52252,msg:{client:'内部错误',server:'无法查询到唯一的顶级收藏夹'}},
            // cantSendRecommendToSelf:{rc:52250,msg:`不能把文档分享给自己`},
            // receiversHasAlreadyGetRecommend:{rc:52252,msg:`接收者已经收到过此分享文档`},
            // articleStatusNotFinish:{rc:52254,msg:`文档作者尚未完成文档，无法分享`},
        },
        //52260~52270
        put:{
            onlyUpdateName:{rc:52260,msg:`只能更新收藏夹的名称`},
            notCreatorCantUpdateCollectionName:{rc:52262,msg:`不能更改他人收藏夹名称`},
            cantUpdateTopLevelCollectionName:{rc:52263,msg:`不能更改默认收藏夹名称`},
            fromToRecordIdNotExists:{rc:52264,msg:`收藏夹不存在`},
            notOwnFromToRecordId:{rc:52266,msg:`不能向他人的收藏夹添加删除文档`},

            articleStatusNotFinished:{rc:52267,msg:`文档未处于完成状态，无法操作`},
            alreadyCollect:{rc:52268,msg:`文档或者主题已经收藏`},
        },
        //52270~52280
        'delete':{
            notCreatorCantDelete:{rc:52270,msg:`不是收藏夹的创建者，无法删除收藏夹`},
            cantDeleteTopLevelCollection:{rc:52272,msg:`不能删除默认收藏夹`},
        },

    },


}

module.exports={
    controllerError,
}