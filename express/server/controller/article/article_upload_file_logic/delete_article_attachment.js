/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
/**************  controller相关常量  ****************/
const controller_setting=require('../article_setting/article_setting').setting
const controllerError=require('../article_setting/article_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
/***************  rule   ****************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
//上传文件的定义
const e_resourceFieldName=nodeEnum.ResourceFieldName
const e_uploadFileType=nodeEnum.UploadFileType
const e_uploadFileDefinitionFieldName=nodeEnum.UploadFileDefinitionFieldName

// const e_resourceRange=nodeEnum.Resource
const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit

const e_resourceRange=mongoEnum.ResourceRange.DB
// const e_resourceRange=mongoEnum.AdminUserType.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_resourceType=mongoEnum.ResourceType.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash
const resourceCheck=server_common_file_require.resourceCheck
/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const uploadFileDefine=server_common_file_require.globalConfiguration.uploadFileDefine

const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const e_gmGetter=nodeRuntimeEnum.GmGetter

async function deleteArticleAttachment_async({req}){
    // console.log(`deleteArticleAttachment_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME

    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    let originalAttachmentDoc,originalArticleDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalAttachmentDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.article_attachment,
            recordId:recordId,
            ownerFieldsName:[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===originalAttachmentDoc){
            return Promise.reject(controllerError.delete.notAttachmentAuthorCantDeleteAttachment)
        }

        //根据attachmentId查找对应的article是否有权限（因为除了attachment，还要更新article）
        originalArticleDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.article,
            recordId:originalAttachmentDoc[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID],
            ownerFieldsName:[e_field.article.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===originalArticleDoc){
            return Promise.reject(controllerError.delete.notArticleAuthorCantDeleteAttachment)
        }
    }


    /**********************************************/
    /***********    读取附件信息    **************/
    /*********************************************/

    let sizeInMb=originalAttachmentDoc[e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB]
    let absPathResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.store_path,id:originalAttachmentDoc[e_field.ARTICLE_ATTACHMENT.PATH_ID]})
    let absPath=absPathResult[e_field.STORE_PATH.PATH]+originalAttachmentDoc[e_field.ARTICLE_ATTACHMENT.HASH_NAME]

    fs.unlink(absPath)




    /*************************************************/
    /****           更新表（attachment）        ******/
    /************************************************/
    let attachmentId=originalAttachmentDoc[e_field.ARTICLE_ATTACHMENT.ID]
    await common_operation_model.findByIdAndRemove_async({dbModel:e_dbModel.article_attachment,id:attachmentId})


    /*              更新记录到article                  */
    let updateValues={}
    updateValues["$pull"]={[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID]:attachmentId}
    //image/attachment移动到article本身了
    updateValues["$inc"]={
        [e_field.ARTICLE.ATTACHMENTS_NUM]:-1,
        [e_field.ARTICLE.ATTACHMENTS_SIZE_IN_MB]:-sizeInMb,
    }

    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.article,id:recordId,updateFieldsValue:updateValues})

    return Promise.resolve({rc:0})

}

module.exports={
    deleteArticleAttachment_async,
}