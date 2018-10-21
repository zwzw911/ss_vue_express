/**
 * Created by 张伟 on 2018/10/03.
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

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


/*************************************************************/
/**********              获得主页文档             ***********/
/*************************************************************/
async function getLatestArticle_async({req}){
    // ap.inf('getLatestArticle_async in')
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
    ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // let recordId=req.params['articleId']
// ap.wrn('recordId',recordId)

    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({})
// ap.inf('getRecord',getRecord)




    if(getRecord.length>0){
        /*********************************************/
        /********    删除（保留）指定字段     *******/
        /*********************************************/
        let keepFields=[
            'id',
            e_field.ARTICLE.NAME,
            /*e_field.ARTICLE.STATUS,
            e_field.ARTICLE.TAGS,
            e_field.ARTICLE.HTML_CONTENT,
            e_field.ARTICLE.AUTHOR_ID,
            // e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID,
            // e_field.ARTICLE.ARTICLE_IMAGES_ID,
            e_field.ARTICLE.CATEGORY_ID,*/
            // e_field.ARTICLE.ARTICLE_COMMENTS_ID
        ]
        /*//那些字段是被populate过的，以便对其中的objectId字段进行加解密
        let populateFields=[
            {
            fieldName:e_field.ARTICLE.AUTHOR_ID,
            fkCollName:e_coll.USER,},
        ]*/
        for(let idx in getRecord){
            /*********************************************/
            /********    删除（保留）指定字段     *******/
            /*********************************************/
            // ap.inf('before keep',getRecord[idx])
            controllerHelper.keepFieldInRecord({record:getRecord[idx],fieldsToBeKeep:keepFields})
            // ap.inf('after keep',getRecord[idx])
            /*********************************************/
            /**********      加密 敏感数据       *********/
            /*********************************************/
            // ap.inf('before cryote',getRecord[idx])
            controllerHelper.cryptRecordValue({record:getRecord[idx],salt:tempSalt,collName:e_coll.ARTICLE,populateFields:undefined})
            // ap.inf('after cryote',getRecord[idx])

        }
    }
    return Promise.resolve({rc:0,msg:getRecord})
// ap.inf('after keepFieldInRecord',getRecord)

}



/**************************************/
/***            读取文档            ***/
/**************************************/
async function businessLogic_async({}){
    /***        数据库操作            ****/
    let condition={}
    let options={
        sort:{'cDate':-1},
        limit:5,
    }
    /*let populateOpt=[
        {
            path:e_field.ARTICLE.AUTHOR_ID,
            // match:{},
            // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
            select:`${e_field.USER.NAME} ${e_field.USER.PHOTO_DATA_URL}`, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
            // options:{limit:maxNumber.article.attachmentNumberPerArticle},
        },
    ]*/
    // ap.inf('populateOpt',populateOpt)
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.article,condition:condition,options:options,populateOpt:undefined})
// ap.inf('result',result)

    if(result.length>0){

        for(let idx in result){
            // ap.inf('idx',idx)
            // ap.inf('before result[idx]',result[idx])
            result[idx]=result[idx].toObject()
            // ap.inf('after result[idx]',result[idx])
            //每个被populate的字段，需要删除多余的_id字段
/*            if(undefined!==populateOpt && populateOpt.length>0){
                for(let singlePopulateOpt of populateOpt){
                    delete result[idx][singlePopulateOpt['path']]['_id']
                }
            }*/
        }
    }
    return Promise.resolve(result)

}




module.exports={
    getLatestArticle_async,
}