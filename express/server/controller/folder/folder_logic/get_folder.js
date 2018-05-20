/**
 * Created by 张伟 on 2018/4/24.
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controllerError=require('../folder_setting/folder_controllerError').controllerError
const controllerSetting=require('../folder_setting/folder_setting').setting

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

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env

/*************** app配置 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const regex=server_common_file_require.regex


/*************************************************************/
/***************        获得所有一级目录      ****************/
/*************************************************************/
async function getRootFolder_async({req}){
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

    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    //普通用户
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({userId:userId,folderId:undefined})

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    for(let idx in getRecord['folder']){
        getRecord['folder'][idx]=getRecord['folder'][idx].toObject()
        controllerHelper.cryptRecordValue({record:getRecord['folder'][idx],salt:tempSalt,collName:collName})
    }
    for(let idx in getRecord['article']){
        getRecord['article'][idx]=getRecord['article'][idx].toObject()
        controllerHelper.cryptRecordValue({record:getRecord['article'][idx],salt:tempSalt,collName:collName})
    }

    return Promise.resolve({rc:0,msg:getRecord})
}

/*************************************************************/
/***************        获得指定目录下所有目录和文档      ****************/
/*************************************************************/
async function getNonRootFolder_async({req}){
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
    ap.inf('req.params',req.params)
    let recordId=req.params.folderId


    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /*********************************************/
    /************    解密recordId    ************/
    /*********************************************/
    recordId=crypt.decryptSingleFieldValue({fieldValue:recordId,salt:tempSalt})
    if(false===regex.objectId.test(recordId)){
        return Promise.reject(controllerError.get.inValidFolderId)
    }
    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    if(userType===e_allUserType.USER_NORMAL){
        let result=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.folder,
            recordId:recordId,
            ownerFieldName:e_field.FOLDER.AUTHOR_ID,
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===result){
            return Promise.reject(controllerError.get.notAuthorCantGetFolder)
        }
    }
}

/**************************************/
/*** 读取目录下的内容（目录和文档） ***/
/**************************************/
async function businessLogic_async({folderId,userId}){
    let parentFolderId
    let childFolderCondition={
        [e_field.FOLDER.AUTHOR_ID]:userId
    }
    let childArticleCondition={
        [e_field.ARTICLE.AUTHOR_ID]:userId
    }
    //folderId undefined，说明只能读取最高级的目录，此时无任何文档
    if(undefined===folderId){
        childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]={"$exists":false}
    }else{
        childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]=folderId
        childArticleCondition[e_field.ARTICLE.FOLDER_ID]=folderId
    }

    let childFolderResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:childFolderCondition})
    let childArticleResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.article,condition:childFolderCondition})

    return Promise.resolve({folder:childFolderResult,article:childArticleResult})
}
module.exports={
    getRootFolder_async,
    getNonRootFolder_async,
}