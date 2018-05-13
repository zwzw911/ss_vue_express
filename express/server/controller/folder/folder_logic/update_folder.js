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
const inputValueLogicValidCheck_async=server_common_file_require.controllerInputValueLogicCheck.inputValueLogicValidCheck_async
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc


const crypt=server_common_file_require.crypt
/****************  公共常量 ********************/
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB
const e_allUserType=mongoEnum.AllUserType.DB

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_resourceFieldName=nodeEnum.ResourceFieldName

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber


/*************************************************************/
/***************   主函数      *******************************/
/*************************************************************/
async function updateFolder_async({req}){
    /************************************************/
    /**************   define variant   *************/
    /***********************************************/
    let tmpResult,condition,option
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // let collFkConfig=fkConfig[collName]
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority}=userInfo


    /************************************************/
    /***********    参数转为server格式    **********/
    /************************************************/
    dataConvert.constructUpdateCriteria(docValue)

    /************************************************/
    /******   传入的敏感数据（objectId）解密   ******/
    /************************************************/
    controllerHelper.decryptRecordValue({record:docValue,collName:collName})
    recordId=crypt.cryptSingleFieldValue({fieldValue:recordId})
    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:undefined,collName:collName}
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.DISK_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:undefined}}},
    }
    await inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId})
    return Promise.resolve(updatedRecord)
}


/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,recordId}){
    //添加internal value
    let internalValue={}
    if(undefined!==docValue[e_field.FOLDER.PARENT_FOLDER_ID]){
        let parentFolder=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.folder,id:docValue[e_field.FOLDER.PARENT_FOLDER_ID]})
        internalValue[e_field.FOLDER.LEVEL]=parentFolder[e_field.FOLDER.LEVEL]+1
    }else{
        internalValue[e_field.FOLDER.LEVEL]=1
    }
    //判断level是否超出定义
    if(internalValue[e_field.FOLDER.LEVEL]>maxNumber.folder.folderLevel){

    }
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        //ap.inf('req.body.values',req.body.values)
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:e_applyRange.UPDATE_SCALAR})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)

    /*              数据库操作               */
    let updatedRecord=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.folder,id:recordId,updateFieldsValue:docValue,updateOption:undefined})
    return Promise.resolve(updatedRecord)
}
module.exports={
    updateFolder_async,
}