/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
const fs=require('fs')
/**************  controller相关常量  ****************/
// const controller_setting=require('../article_setting/article_setting').setting
const controllerError=require('../article_setting/article_controllerError').controllerError

/***************  数据库相关常量   ****************/
/*const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll*/
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
/***************  rule   ****************/
/*const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule*/


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
/*const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
//上传文件的定义
const e_resourceFieldName=nodeEnum.ResourceFieldName
const e_uploadFileDefinitionFieldName=nodeEnum.UploadFileDefinitionFieldName

// const e_resourceRange=nodeEnum.Resource
const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit
const e_uploadFileRange=nodeRuntimeEnum.UploadFileRange
const e_hashType=nodeRuntimeEnum.HashType

const e_resourceRange=mongoEnum.ResourceRange.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_resourceType=mongoEnum.ResourceType.DB
const e_allUserType=mongoEnum.AllUserType.DB


const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange*/


/**************  公共函数   ******************/
// const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
// const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
/*const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash
const resourceCheck=server_common_file_require.resourceCheck
const uploadFile=server_common_file_require.upload
const file=server_common_file_require.file*/
/*************** 配置信息 *********************/
/*const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const uploadFileDefine=server_common_file_require.globalConfiguration.uploadFileDefine

const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const e_gmGetter=nodeRuntimeEnum.GmGetter*/

async function downloadArticleAttachment_async({req}){

    // console.log(`downloadArticleAttachment_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    // let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME

    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // ap.inf('userInfo',userInfo)
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let docValue=req.body.values[e_part.RECORD_INFO]

    let recordId=req.params['attachmentId']

    /**     获得附件数据      **/
    let populateOpt=[
        {
            path:e_field.ARTICLE_ATTACHMENT.PATH_ID,
            // match:{},
            // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
            select:`${e_field.STORE_PATH.PATH}`, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
            options:{limit:1},//一个附件只有一个路径
            model:e_dbModel.store_path,//因为是cross db，需要显示指明目标model
        },
    ]
    // ap.inf('populateOpt',populateOpt)
    let attachmentRecord= await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.article_attachment,id:recordId,populateOpt:populateOpt})
    if(null===attachmentRecord){
        return Promise.reject(controllerError.download.attachmentNotExist)
    }
    // ap.inf('attachmentRecord',attachmentRecord)
    /**     获得附件路径      **/
    let path=attachmentRecord[e_field.ARTICLE_ATTACHMENT.PATH_ID][e_field.STORE_PATH.PATH]+attachmentRecord[e_field.ARTICLE_ATTACHMENT.HASH_NAME]
    if(false===fs.existsSync(path)){
        return Promise.reject(controllerError.download.attachmentNotExist)
    }
    return Promise.resolve({rc:0,msg:{'path':path,fileName:attachmentRecord[e_field.ARTICLE_ATTACHMENT.NAME]}})

}



module.exports={
    downloadArticleAttachment_async,
}