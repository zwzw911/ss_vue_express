/**
 * Created by 张伟 on 2018/8/16.
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const moment=require('moment')
/**************  controller相关常量  ****************/
const controllerError=require('../article_setting/article_controllerError').controllerError
const controllerSetting=require('../article_setting/article_setting').setting

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')


const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const crypt=server_common_file_require.crypt


/****************  公共常量 ********************/
const mongoEnum=server_common_file_require.mongoEnum
const e_allUserType=mongoEnum.AllUserType.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env

/*************** app配置 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const regex=server_common_file_require.regex

const maxNum=server_common_file_require.globalConfiguration.maxNumber

//读取自己（他人）文档
async function normalGetArticle_async({req}){
    return await getArticle_async({req:req,forUpdate:false})
}
//读取（为了更新）自己文档
async function getArticleFroUpdate_async({req}){
    return await getArticle_async({req:req,forUpdate:true})
}

async function getArticle_async({req,forUpdate}){
    ap.inf('getArticle_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    // ap.inf('controller_setting.MAIN_HANDLED_COLL_NAME',controllerSetting)
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    // ap.inf('collName',collName)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    let recordId=req.params['articleId']
// ap.wrn('recordId',recordId)
    /**     如果读取文档是为了更新，那么需要检测用户类型已经是否为文档作者     **/
    if(true===forUpdate){
        /**********************************************/
        /***********    用户类型检测    **************/
        /*********************************************/
        //普通用户
        await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

        /**********************************************/
        /***********    用户权限检测    **************/
        /*********************************************/
        if(userType===e_allUserType.USER_NORMAL) {
            let result = await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
                dbModel: e_dbModel.article,
                recordId: recordId,
                ownerFieldsName: [e_field.ARTICLE.AUTHOR_ID],
                userId: userId,
                additionalCondition: undefined,
            })
            // ap.inf('ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async result',result)
            if (false === result) {
                return Promise.reject(controllerError.get.notAuthorCantGetFolder)
            }
        }
    }

    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({articleId:recordId,forUpdate:forUpdate})
// ap.inf('getRecord',getRecord)

    /*********************************************/
    /********    删除（保留）指定字段     *******/
    /*********************************************/
    let keepFields=[]
    if(true===forUpdate){
        //读取自己文档为了更新
        keepFields=[e_field.ARTICLE.NAME,e_field.ARTICLE.STATUS,e_field.ARTICLE.TAGS,e_field.ARTICLE.HTML_CONTENT,e_field.ARTICLE.ALLOW_COMMENT,e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID,e_field.ARTICLE.ARTICLE_IMAGES_ID,e_field.ARTICLE.CATEGORY_ID]
    }else{
        //纯粹读取
        keepFields=["cDate",e_field.ARTICLE.NAME,e_field.ARTICLE.AUTHOR_ID,e_field.ARTICLE.STATUS,e_field.ARTICLE.TAGS,e_field.ARTICLE.HTML_CONTENT,e_field.ARTICLE.ALLOW_COMMENT,e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID,e_field.ARTICLE.ARTICLE_IMAGES_ID,e_field.ARTICLE.CATEGORY_ID,e_field.ARTICLE.ARTICLE_COMMENTS_ID]
    }
    controllerHelper.keepFieldInRecord({record:getRecord,fieldsToBeKeep:keepFields})
    /*********************************************/
    /********    删除_id(否则和id重复)     *******/
    /*********************************************/
    // 删除_id
    let tmp=JSON.stringify(getRecord).replace(/"_id":"[0-9a-f]{24}",?/g,'')

    // ap.inf('after replace tmp',tmp)
    getRecord=JSON.parse(tmp)
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    // ap.inf('before cryote',getRecord)
    /*let populateFields=[
        {
            fieldName:e_field.ARTICLE.AUTHOR_ID,
            fkCollName:e_coll.USER,
        },
        {
            fieldName:e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID,
            fkCollName:e_coll.ARTICLE_ATTACHMENT,
        },
        {
            fieldName:e_field.ARTICLE.ARTICLE_COMMENTS_ID,
            fkCollName:e_coll.ARTICLE_COMMENT,
        },
    ]
    controllerHelper.encryptSingleRecord({record:getRecord,salt:tempSalt,collName:e_coll.ARTICLE,populateFields:populateFields})*/
    let populateFields={
        [e_field.ARTICLE.AUTHOR_ID]:{
            'collName':e_coll.USER,
            'subPopulateFields':undefined,
        },
        [e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID]:{
            'collName':e_coll.ARTICLE_ATTACHMENT,
            'subPopulateFields':undefined,
        },
        [e_field.ARTICLE.ARTICLE_COMMENTS_ID]:{
            'collName':e_coll.ARTICLE_COMMENT,
            'subPopulateFields':{
                [e_field.ARTICLE_COMMENT.AUTHOR_ID]:{
                    'collName':e_coll.USER,
                    'subPopulateFields':undefined,
                },
            },
        },
    }
    controllerHelper.encryptSingleRecord({record:getRecord,collName:e_coll.ARTICLE,salt:tempSalt,populateFields:populateFields})
    /*//comment还populate了authorId
    if(undefined!==getRecord[e_field.ARTICLE.ARTICLE_COMMENTS_ID] && getRecord[e_field.ARTICLE.ARTICLE_COMMENTS_ID].length>0){
        populateFields=[
            {
                fieldName:e_field.ARTICLE_COMMENT.AUTHOR_ID,
                fkCollName:e_coll.USER,},
        ]
        for(let singleComment of getRecord[e_field.ARTICLE.ARTICLE_COMMENTS_ID]){
            controllerHelper.encryptSingleRecord({record:singleComment,salt:tempSalt,collName:e_coll.ARTICLE_COMMENT,populateFields:populateFields})
        }
    }*/

    /*********************************************/
    /**********      如果是读取文档，则要获得文档统计信息       *********/
    /*********************************************/
    let staticResult
    if(false===forUpdate){
        staticResult=await static_async({articleId:recordId})
        // ap.inf('staticResult',staticResult)
    }

    return Promise.resolve({rc:0,msg:{article:getRecord,staticResult:staticResult}})
}



/**************************************/
/*** 读取文档的附件信息和评论信息 ***/
/**************************************/
async function businessLogic_async({articleId,forUpdate}){
    /***        数据库操作            ****/
    let populateOpt=[
        {
            path:e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID,
            // match:{},
            // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
            select:`${e_field.ARTICLE_ATTACHMENT.NAME} `, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
            options:{limit:maxNumber.article.attachmentNumberPerArticle},
        },
    ]
    if(true===forUpdate){
        // populateOpt=[
        //     {
        //     path:e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID,
        //     // match:{},
        //     // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
        //     select:`${e_field.ARTICLE_ATTACHMENT.NAME} `, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
        //     options:{limit:maxNumber.article.attachmentNumberPerArticle},
        // },
        // ]
    }else{
        populateOpt.push({
            path:e_field.ARTICLE.AUTHOR_ID,
            // match:{},
            // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
            select:`${e_field.USER.PHOTO_DATA_URL} ${e_field.USER.NAME} `, // ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
            // options:{limit:maxNumber.article.attachmentNumberPerArticle},

        })
        populateOpt.push({
            path:e_field.ARTICLE.ARTICLE_COMMENTS_ID,
            // match:{},
            // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
            select:`${e_field.ARTICLE_COMMENT.AUTHOR_ID} ${e_field.ARTICLE_COMMENT.CONTENT} cDate`, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
            options:{limit:maxNumber.article.attachmentNumberPerArticle},
            populate:{
                path:e_field.ARTICLE_COMMENT.AUTHOR_ID,
                // match:{},
                // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
                select:`${e_field.USER.PHOTO_DATA_URL} ${e_field.USER.NAME} `, //${e_field.USER.PHOTO_DATA_URL}   ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
                // options:{limit:maxNumber.article.attachmentNumberPerArticle},
            },
        })
    }


    // populateOpt=e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID
    // ap.inf('populateOpt',populateOpt)
    let result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.article,id:articleId,populateOpt:populateOpt})
    // ap.inf('populate result',result)
    if(null===result){
        return Promise.reject(controllerError.get.articleNotExist)
    }
    //读取他人文档，状态必须为public(读取自己文档，无需检查)
    // ap.inf('forUpdate',forUpdate)
    // ap.inf('result[e_field.ARTICLE.STATUS]',result[e_field.ARTICLE.STATUS])
    // ap.inf('e_articleStatus.FINISHED',e_articleStatus.FINISHED)
    if(false===forUpdate && result[e_field.ARTICLE.STATUS]!==e_articleStatus.FINISHED){
        return Promise.reject(controllerError.get.articleEditing)
    }
    //delete _id
    // result=result.toObject()
    // ap.inf('toobject doen')
    // for(let idx in result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID]){
    //     ap.inf('typeof result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx]]',typeof result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx])
    //     ap.inf('result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx]',result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx])
    //     ap.inf('result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx][\'_id\']',result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx]['_id'])
    //     ap.inf('typeof result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx][\'_id\']',typeof result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx]['_id'])
    //     delete result[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID][idx]['_id']
    // }
    return Promise.resolve(result.toObject())

}


/**************************************/
/***      读取文档的统计信息       ***/
/**************************************/
async function static_async({articleId}){
    let condition={
        [e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]:articleId,
        [e_field.ARTICLE_LIKE_DISLIKE.LIKE]:true,
    }
    let likeCount=await common_operation_model.count_async({dbModel:e_dbModel.article_like_dislike,condition:condition})
    condition={
        [e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]:articleId,
        [e_field.ARTICLE_LIKE_DISLIKE.LIKE]:false,
    }
    let dislikeCount=await common_operation_model.count_async({dbModel:e_dbModel.article_like_dislike,condition:condition})
    return Promise.resolve({like:likeCount,dislike:dislikeCount})
}
module.exports={
    normalGetArticle_async,
    getArticleFroUpdate_async,
}