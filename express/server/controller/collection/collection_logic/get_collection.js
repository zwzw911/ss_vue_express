/**
 * Created by 张伟 on 2018/11/28.
 * 读取 所有 collection
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const moment=require('moment')
/**************  controller相关常量  ****************/
const controllerError=require('../collection_setting/collection_controllerError').controllerError
const controllerSetting=require('../collection_setting/collection_setting').setting

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

async function getTopLevelCollection_async({req}){
    return await getCollection_async({req:req,type:'top'})
}
async function get2ndLevelCollection_async({req}){
    return await getCollection_async({req:req,type:'nonTop'})
}
/***    读取 所有 level collection（以便页面一次显示所有collection，用户体验更好）     ****/
async function getAllCollection_async({req}){
    return await getCollection_async({req:req,type:'all'})
}
/**     读取所有收藏夹的信息      **/
async function getCollection_async({req,type}){
    // ap.inf('getCollection_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    // ap.inf('controller_setting.MAIN_HANDLED_COLL_NAME',controllerSetting)
    let collName=e_coll.COLLECTION
    // ap.inf('collName',collName)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo

    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    //普通用户
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({userId:userId,type:type})
// ap.inf('getRecord',getRecord)

    /*********************************************/
    /********    删除（保留）指定字段     *******/
    /*********************************************/
    let keepFields=[e_field.COLLECTION.NAME,e_field.COLLECTION.PARENT_ID,e_field.COLLECTION.ID]

    for(let singleRecordIdx in getRecord){
        // let getRecord[singleRecordIdx]=getRecord[singleRecordIdx]

        controllerHelper.keepFieldInRecord({record:getRecord[singleRecordIdx],fieldsToBeKeep:keepFields})
// ap.inf('after keep',getRecord[singleRecordIdx])
        /*********************************************/
        /********    删除_id(否则和id重复)     *******/
        /*********************************************/
        // 删除_id
        getRecord[singleRecordIdx]=dataConvert.delete_id({srcObj:getRecord[singleRecordIdx]})
        // ap.inf('after delete id',getRecord[singleRecordIdx])
/*        let tmp=JSON.stringify(getRecord[singleRecordIdx]).replace(/"_id":"[0-9a-f]{24}",?/g,'')

        // ap.inf('after replace tmp',tmp)
        getRecord[singleRecordIdx]=JSON.parse(tmp)*/
        /*********************************************/
        /**********      加密 敏感数据       *********/
        /*********************************************/
        // ap.inf('before cryote',getRecord)
        /*let populateFields={}
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
/!*            populateFields.push(
                {
                    fieldName:e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS,
                    fkCollName:e_coll.SEND_RECOMMEND,
                }
            )*!/
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
/!*            populateFields.push(
                {
                    fieldName:e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS,
                    fkCollName:e_coll.SEND_RECOMMEND,
                }
            )*!/
        }*/
        controllerHelper.encryptSingleRecord({record:getRecord[singleRecordIdx],collName:collName,salt:tempSalt,populateFields:undefined})
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
    // ap.inf('businessLogic_async in')
    /***        数据库操作            ****/
    let condition={
        [e_field.COLLECTION.CREATOR_ID]:userId,
        // [e_field.C]
        dDate:{'$exists':false},
    }
    if(type==='top'){
        condition[e_field.COLLECTION.PARENT_ID]={$exists:false}
    }else if(type==='nonTop'){
        condition[e_field.COLLECTION.PARENT_ID]={$exists:true}
    }else if(type==='all'){
        // condition[e_field.COLLECTION.PARENT_ID]={$exists:true}
    }
    else{
        return Promise.reject(controllerError.logic.get.unknownTypeCantGetCollection)
    }
    let options={limit:maxNumber.user_operation.maxReadCollectionPerPage}
    // ap.inf('condition',condition)
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.collection,condition:condition,options:options,populateOpt:undefined})
    // ap.inf('populate result',result)
// result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.receive_recommend,id:result[0]["id"],populateOpt:populateOpt})
//     dataConvert.to
    dataConvert.convertDocumentToObject({src:result})
    return Promise.resolve(result)

}



module.exports={
    getTopLevelCollection_async,
    get2ndLevelCollection_async,
    getAllCollection_async,
    // getArticleFroUpdate_async,
    // getCollection_async,
    // getReadReceiveRecommend_async,
    // getUnreadReceiveRecommend_async
}