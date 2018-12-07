/**
 * Created by 张伟 on 2018/11/28.
 * 读取 自己 的 未读 分享文档 列表。无需传入任何参数
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const moment=require('moment')
/**************  controller相关常量  ****************/
const controllerError=require('../recommend_setting/recommend_controllerError').controllerError
const controllerSetting=require('../recommend_setting/recommend_setting').setting

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

async function getReadReceiveRecommend_async({req}){
    return await getAllReceiveRecommend_async({req:req,type:'read'})
}
async function getUnreadReceiveRecommend_async({req}){
    return await getAllReceiveRecommend_async({req:req,type:'unread'})
}
/**     读取接收到的分享文档，通过type(read/unread)判断是 读取 已读还是未读 分享文档**/
async function getAllReceiveRecommend_async({req,type}){
    ap.inf('getAllReceiveRecommend_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    // ap.inf('controller_setting.MAIN_HANDLED_COLL_NAME',controllerSetting)
    let collName=e_coll.RECEIVE_RECOMMEND
    // ap.inf('collName',collName)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo


    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({userId:userId,type:type})
// ap.inf('getRecord',getRecord)

    /*********************************************/
    /********    删除（保留）指定字段     *******/
    /*********************************************/
    let keepFields
    if('unread'===type){
        keepFields=[e_field.RECEIVE_RECOMMEND.RECEIVER,e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS,e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS_NUM]
    }
    if('read'===type){
        keepFields=[e_field.RECEIVE_RECOMMEND.RECEIVER,e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS,e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS_NUM]
    }
    for(let singleRecordIdx in getRecord){
        // let getRecord[singleRecordIdx]=getRecord[singleRecordIdx]

        controllerHelper.keepFieldInRecord({record:getRecord[singleRecordIdx],fieldsToBeKeep:keepFields})
// ap.inf('after keep',getRecord[singleRecordIdx])
        /*********************************************/
        /********    删除_id(否则和id重复)     *******/
        /*********************************************/
        // 删除_id
        let tmp=JSON.stringify(getRecord[singleRecordIdx]).replace(/"_id":"[0-9a-f]{24}",?/g,'')

        // ap.inf('after replace tmp',tmp)
        getRecord[singleRecordIdx]=JSON.parse(tmp)
        /*********************************************/
        /**********      加密 敏感数据       *********/
        /*********************************************/
        // ap.inf('before cryote',getRecord)
        let populateFields={}
        if('unread'===type){
            populateFields={
                [e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]: {
                    'collName': e_coll.SEND_RECOMMEND,
                    'subPopulateFields': {
                        [e_field.SEND_RECOMMEND.ARTICLE_ID]: {
                            'collName': e_coll.ARTICLE,
                            'subPopulateFields': undefined,
                        },
                    }
                }
            }
/*            populateFields.push(
                {
                    fieldName:e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS,
                    fkCollName:e_coll.SEND_RECOMMEND,
                }
            )*/
        }
        if('read'===type){
            populateFields={
                [e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS]:{
                    'collName':e_coll.SEND_RECOMMEND,
                    'subPopulateFields':{
                        [e_field.SEND_RECOMMEND.ARTICLE_ID]:{
                            'collName':e_coll.ARTICLE,
                            'subPopulateFields':undefined,
                        },
                    }
                },
               }
/*            populateFields.push(
                {
                    fieldName:e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS,
                    fkCollName:e_coll.SEND_RECOMMEND,
                }
            )*/
        }
        controllerHelper.encryptSingleRecord({record:getRecord[singleRecordIdx],collName:collName,salt:tempSalt,populateFields:populateFields})
        /*controllerHelper.encryptSingleRecord({record:getRecord[singleRecordIdx],salt:tempSalt,collName:e_coll.RECEIVE_RECOMMEND,populateFields:populateFields})
        ap.inf('first crypt',getRecord[singleRecordIdx])
        controllerHelper.encryptSingleRecord({record:getRecord[singleRecordIdx][populateFields.],salt:tempSalt,collName:e_coll.RECEIVE_RECOMMEND,populateFields:populateFields})
        //(un)readRecommend还populate了article
        let subPopulateFieldName=e_field.SEND_RECOMMEND.ARTICLE_ID
        if(undefined!==getRecord[singleRecordIdx][subPopulateFieldName]){
            populateFields=[
                {
                    fieldName:e_field.SEND_RECOMMEND.ARTICLE_ID,
                    fkCollName:e_coll.ARTICLE,
                },
            ]
            for(let singleSubPopulateField of getRecord[singleRecordIdx][subPopulateFieldName]){
                controllerHelper.encryptSingleRecord({record:singleSubPopulateField,salt:tempSalt,collName:e_coll.ARTICLE,populateFields:populateFields})
            }
        }*/
        // ap.inf('after crypt',getRecord[singleRecordIdx])
    }



    /*********************************************/
    /**********      如果是读取文档，则要获得文档统计信息       *********/
    /*********************************************/
    /*let staticResult
    if(false===forUpdate){
        staticResult=await static_async({articleId:recordId})
        // ap.inf('staticResult',staticResult)
    }*/

    return Promise.resolve({rc:0,msg:getRecord})
}



/**************************************/
/***    读取接收到的分享文档列表    ***/
/**************************************/
async function businessLogic_async({userId,type}){
    /***        数据库操作            ****/
    /**         populate分享文档的名称，作者，日期   **/
    let populateOpt=[]
    let populateField
    if('read'===type){
        populateField=e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS
    }
    if('unread'===type){
        populateField=e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS
    }
    populateOpt.push(
        {
            path:populateField,
            // match:{},
            // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
            select:`${e_field.SEND_RECOMMEND.ARTICLE_ID} `, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
            // options:{limit:maxNumber.user_operation.maxRecommendPerPage},
            populate:{
                path:e_field.SEND_RECOMMEND.ARTICLE_ID,
                // match:{},
                // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
                select:`${e_field.ARTICLE.NAME} ${e_field.ARTICLE.AUTHOR_ID} cDate`, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
                // options:{limit:maxNumber.user_operation.maxRecommendPerPage},
                populate:{
                    path:e_field.ARTICLE.AUTHOR_ID,
                    // match:{},
                    // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
                    select:`${e_field.USER.PHOTO_DATA_URL} ${e_field.USER.NAME}`,
                }
            },

        },
    )
// ap.inf('populateOpt',populateOpt)

    let condition={
        [e_field.RECEIVE_RECOMMEND.RECEIVER]:userId,
        dDate:{'$exists':false},
    }
    let options={limit:maxNumber.user_operation.maxRecommendPerPage}
    // ap.inf('condition',condition)
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.receive_recommend,condition:condition,options:options,populateOpt:populateOpt})
    // ap.inf('populate result',result)
// result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.receive_recommend,id:result[0]["id"],populateOpt:populateOpt})
//     dataConvert.to
    dataConvert.convertDocumentToObject({src:result})
    return Promise.resolve(result)

}


/*/!**************************************!/
/!***      读取文档的统计信息       ***!/
/!**************************************!/
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
}*/
module.exports={
    // normalgetAllReceiveRecommend_async,
    // getArticleFroUpdate_async,
    // getAllReceiveRecommend_async,
    getReadReceiveRecommend_async,
    getUnreadReceiveRecommend_async
}