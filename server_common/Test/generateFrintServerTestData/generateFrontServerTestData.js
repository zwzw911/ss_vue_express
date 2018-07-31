/**
 * Created by 张伟 on 2018/7/20.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
const app=require('../../../express/app')
const adminApp=require(`../../../express_admin/app`)

/******************    公共常量       **************/
const e_field=require('../../constant/genEnum/DB_field').Field
const e_part=require('../../constant/enum/nodeEnum').ValidatePart
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_dbModel=require('../../constant/genEnum/dbModel')

const e_addFriendRule=require('../../constant/enum/mongoEnum').AddFriendRule.DB
/****************  公共函数 ********************/
// const server_common_file_require=require('../../server_common_file_require')

/*const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const common_operation_model=server_common_file_require.common_operation_model
// const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API
const impeachAPI=server_common_file_require.impeach_API
const impeachActionAPI=server_common_file_require.impeachAction_API
const impeachCommentAPI=server_common_file_require.impeachComment_API
const publicGroupAPI=server_common_file_require.publicGroup_API
const friendGroupAPI=server_common_file_require.friend_group_API

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const articleComponentFunction=server_common_file_require.article_component_function*/
const db_operation_helper=require('../db_operation_helper')//require("../../../server_common/Test/db_operation_helper")
const common_operation_model=require('../../model/mongo/operation/common_operation_model')
// const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const commonAPI=require('../API/common_API')

const userAPI=require('../API/express/user_API')//require('../API_helper/API_helper')
const folderAPI=require('../API/express/folder_API')
const penalizeAPI=require('../API/express/penalize_API')
const articleAPI=require('../API/express/article_API')
const impeachAPI=require('../API/express/impeach_API')
const impeachActionAPI=require('../API/express/impeachAction_API')
const impeachCommentAPI=require('../API/express/impeachComment_API')
const publicGroupAPI=require('../API/express/publicGroup_API')
const friendGroupAPI=require('../API/express/friend_group_API')

const userComponentFunction=require('../component_function/express/user_component_function')
const adminUserComponentFunction=require('../component_function/express_admin/admin_user_component_function')
const articleComponentFunction=require('../component_function/express/article_component_function')

const removeInitSettingData=require('../../maintain/preDeploy/removeInitSettingData')
const insertInitRecord=require('../../maintain/preDeploy/insertInitRecord')
// const rePreDeploy_async=require('../../maintain/preDeploy/main').rePreDeploy_async
/****************  测试数据 ********************/
const user={
    user1:{name:'zw',account:'12341234123',password:'123456',[e_field.USER.ADD_FRIEND_RULE]:e_addFriendRule.NOONE_ALLOW},
}

/**     API     **/

async function generateFrontTestData(){
    let tmpResult
    /***            re predeploy               **/
    await removeInitSettingData.remove_all_async()
    await insertInitRecord.all()
    /**             insert test data                **/
    //user register
    let userInfo=await userComponentFunction.reCreateUser_returnSessUserId_async({userData:user.user1,app:app})
    let user1sess=userInfo['sess']
    let user1Id=userInfo['userId']
    // insert folder
    await generateFolder({sess:user1sess})
    await generateArticle({userId:user1Id,sess:user1sess})
}

async function generateFolder({sess}){
    let tmpResult
    let folderData={values:{
            [e_part.RECORD_INFO]:{
                [e_field.FOLDER.NAME]:'顶级目录1'
            }
        }}
    tmpResult=await folderAPI.createFolder_async({sess:sess,data:folderData,app:app})
    let topFolderId=tmpResult['id']
    folderData={values:{
            [e_part.RECORD_INFO]:{
                [e_field.FOLDER.NAME]:'顶级目录1的子目录1',
                [e_field.FOLDER.PARENT_FOLDER_ID]:topFolderId,
            }
        }}
    await folderAPI.createFolder_async({sess:sess,data:folderData,app:app})
    folderData={values:{
            [e_part.RECORD_INFO]:{
                [e_field.FOLDER.NAME]:'顶级目录1的子目录2',
                [e_field.FOLDER.PARENT_FOLDER_ID]:topFolderId,
            }
        }}
    await folderAPI.createFolder_async({sess:sess,data:folderData,app:app})
    folderData={values:{
            [e_part.RECORD_INFO]:{
                [e_field.FOLDER.NAME]:'顶级目录2'
            }
        }}
    tmpResult=await folderAPI.createFolder_async({sess:sess,data:folderData,app:app})
    topFolderId=tmpResult['id']
    folderData={values:{
            [e_part.RECORD_INFO]:{
                [e_field.FOLDER.NAME]:'顶级目录2的子目录1',
                [e_field.FOLDER.PARENT_FOLDER_ID]:topFolderId,
            }
        }}
    await folderAPI.createFolder_async({sess:sess,data:folderData,app:app})
    folderData={values:{
            [e_part.RECORD_INFO]:{
                [e_field.FOLDER.NAME]:'顶级目录2的子目录2',
                [e_field.FOLDER.PARENT_FOLDER_ID]:topFolderId,
            }
        }}
    await folderAPI.createFolder_async({sess:sess,data:folderData,app:app})
    folderData={values:{
            [e_part.RECORD_INFO]:{
                [e_field.FOLDER.NAME]:'顶级目录2的子目录3',
                [e_field.FOLDER.PARENT_FOLDER_ID]:topFolderId,
            }
        }}
    await folderAPI.createFolder_async({sess:sess,data:folderData,app:app})
}

async function generateArticle({userId,sess}){
    // ap.wrn('generateArticle in')
    let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:{[e_field.FOLDER.NAME]:'顶级目录1'}})
    // ap.wrn('tmpResult',tmpResult)
    let topFolder1=await  commonAPI.cryptObjectId_async({objectId:tmpResult[0]['id'],sess:sess})

    let articleId1=await articleAPI.createNewArticle_returnArticleId_async({userSess:sess,app:app})
    let articleData={
        values:{
            [e_part.RECORD_ID]:articleId1,
            [e_part.RECORD_INFO]:{[e_field.ARTICLE.NAME]:'文档1',[e_field.ARTICLE.FOLDER_ID]:topFolder1}
        }
    }
    await articleAPI.updateArticle_returnArticleId_async({userSess:sess,data:articleData,app:app})

    let articleId2=await articleAPI.createNewArticle_returnArticleId_async({userSess:sess,app:app})
    articleData={
        values:{
            [e_part.RECORD_ID]:articleId2,
            [e_part.RECORD_INFO]:{[e_field.ARTICLE.NAME]:'文档2',[e_field.ARTICLE.FOLDER_ID]:topFolder1}
        }
    }
    await articleAPI.updateArticle_returnArticleId_async({userSess:sess,data:articleData,app:app})

    let articleId3=await articleAPI.createNewArticle_returnArticleId_async({userSess:sess,app:app})
    articleData={
        values:{
            [e_part.RECORD_ID]:articleId3,
            [e_part.RECORD_INFO]:{[e_field.ARTICLE.NAME]:'文档3',[e_field.ARTICLE.FOLDER_ID]:topFolder1}
        }
    }
    await articleAPI.updateArticle_returnArticleId_async({userSess:sess,data:articleData,app:app})


    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:{[e_field.FOLDER.NAME]:'顶级目录1的子目录1'}})
    // ap.wrn('tmpResult',tmpResult)
    let topFolder2=await  commonAPI.cryptObjectId_async({objectId:tmpResult[0]['id'],sess:sess})

    let articleId11=await articleAPI.createNewArticle_returnArticleId_async({userSess:sess,app:app})
    articleData={
        values:{
            [e_part.RECORD_ID]:articleId11,
            [e_part.RECORD_INFO]:{[e_field.ARTICLE.NAME]:'文档11',[e_field.ARTICLE.FOLDER_ID]:topFolder2}
        }
    }
    await articleAPI.updateArticle_returnArticleId_async({userSess:sess,data:articleData,app:app})

    let articleId12=await articleAPI.createNewArticle_returnArticleId_async({userSess:sess,app:app})
    articleData={
        values:{
            [e_part.RECORD_ID]:articleId12,
            [e_part.RECORD_INFO]:{[e_field.ARTICLE.NAME]:'文档12',[e_field.ARTICLE.FOLDER_ID]:topFolder2}
        }
    }
    await articleAPI.updateArticle_returnArticleId_async({userSess:sess,data:articleData,app:app})

    /*let articleId13=await articleAPI.createNewArticle_returnArticleId_async({userSess:sess,app:app})
    articleData={
        values:{
            [e_part.RECORD_ID]:articleId13,
            [e_part.RECORD_INFO]:{[e_field.ARTICLE.NAME]:'文档13',[e_field.ARTICLE.FOLDER_ID]:topFolder2}
        }
    }
    await articleAPI.updateArticle_returnArticleId_async({userSess:sess,data:articleData,app:app})*/

}
generateFrontTestData().then(
    (v)=>{ap.inf('generateFrontTestData done',v)},
    (e)=>{ap.inf('generateFrontTestData fail',e)}
)
module.exports={
    generateFrontTestData
}
