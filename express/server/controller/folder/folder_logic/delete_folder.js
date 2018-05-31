/**
 * Created by 张伟 on 2018/4/24.
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controllerError=require('../folder_setting/folder_controllerError').controllerError
const controllerSetting=require('../folder_setting/folder_setting').setting

/**************      rule             *************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule

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
const e_docStatus=mongoEnum.DocStatus.DB
const e_allUserType=mongoEnum.AllUserType.DB

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType
const e_part=server_common_file_require.nodeEnum.ValidatePart

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env

/*************** app配置 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv



/*************************************************************/
/***************   主函数      *******************************/
/*************************************************************/
async function deleteFolder_async({req}){
    /**********************************************/
    /***********    define variant      ***********/
    /**********************************************/
    let tmpResult,condition,option
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let recordId=req.body.values.recordId
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt,}=userInfo

    /*********************************************/
    /*************    用户类型检测    ************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
/*    /!*********************************************!/
    /!************    解密recordId    ************!/
    /!*********************************************!/
    recordId=crypt.cryptSingleFieldValue({fieldValue:recordId,salt:tempSalt})
    if(false===regex.objectId.test(recordId)){
        return Promise.reject(controllerError.delete.inValidFolderId)
    }*/
    /*******************************************************************************************/
    /****************  当前用户为普通用户，检测是否为recordId对应的创建者    *******************/
    /*******************************************************************************************/
    if(e_allUserType.USER_NORMAL===userType){
        tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.folder,
            recordId:recordId,
            ownerFieldsName:[e_field.FOLDER.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===tmpResult){
            return Promise.reject(controllerError.delete.notAuthorCantDeleteFolder)
        }
    }

    await businessSpecificCheck_async({recordId:recordId})

    await businessLogic_async({collName:collName,recordId:recordId})

    return Promise.resolve({rc:0})

}

/*************************************************************/
/***************   业务特定逻辑检查    ***********************/
/*************************************************************/
async function businessSpecificCheck_async({recordId}){
    //1. folder下不能有任何文档
    let condition={
        [e_field.ARTICLE.FOLDER_ID]:recordId,
        'dDate':{$exists:false}
    }
    let articleNum=await common_operation_model.count_async({dbModel:e_dbModel.article,condition:condition})
    if(articleNum>0){
        return Promise.reject(controllerError.delete.articleInFolderCanDelete)
    }
    //1. folder下不能有任何folder
    condition={
        [e_field.FOLDER.PARENT_FOLDER_ID]:recordId,
        'dDate':{$exists:false}
    }
    // ap.inf('condition',condition)
    let childFolderNum=await common_operation_model.count_async({dbModel:e_dbModel.folder,condition:condition})
    // ap.inf('childFolderNum',childFolderNum)
    if(childFolderNum>0){
        return Promise.reject(controllerError.delete.childFolderInFolderCanDelete)
    }
}
/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({recordId}){
    await common_operation_model.findByIdAndDelete_async({dbModel:e_dbModel.folder,id:recordId})
}

module.exports={
    deleteFolder_async,
}