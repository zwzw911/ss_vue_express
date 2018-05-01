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


const hash=server_common_file_require.crypt.hash
/****************  公共常量 ********************/
const e_docStatus=server_common_file_require.mongoEnum.DocStatus.DB
const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType
const e_part=server_common_file_require.nodeEnum.ValidatePart

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env



/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber


/*************************************************************/
/***************   主函数      *******************************/
/*************************************************************/
async function createFolder_async({req}){
    /*******************************************************************************************/
    /************************           define variant                    **********************/
    /*******************************************************************************************/
    let tmpResult,condition,option
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // let collFkConfig=fkConfig[collName]
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority}=userInfo

    let inputValueLogicValidCheckSkip //数组，inputValueLogicValidCheck函数中，需要skip的步骤

    let uniqueCheckAdditionalCondition //object：key从DB_unqiueField.js或者compound_uniqueFIeld_config.js中获得，value是查询条件。进行unique检测（singleField和compoundField），需要的额外检测条件。
    /*******************************************************************************************/
    /*************************            参数转为server格式           ************************/
    /*******************************************************************************************/
    dataConvert.constructCreateCriteria(docValue)

    /*******************************************************************************************/
    /******************           传入的敏感数据（objectId）解密           ********************/
    /*******************************************************************************************/
    controllerHelper.decryptRecordValue({record:docValue,collName:collName})

    /*******************************************************************************************/
    /*************************              用户类型检测              *************************/
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /*******************************************************************************************/
    /******************     CALL FUNCTION:inputValueLogicValidCheck        *********************/
    /*******************************************************************************************/
    await inputValueLogicValidCheck_async({
        docValue:docValue,
        userId:userId,collName:collName,
        skipStep:inputValueLogicValidCheckSkip, //数组，需要skip的函数名称。undefined，不进行skip
        uniqueCheckAdditionalCondition:uniqueCheckAdditionalCondition, //object。undefined，只对field的value进行unique的检查
    })
}

async function  inputValueLogicValidCheck_async({docValue,userId,collName,skipStep,uniqueCheckAdditionalCondition}){
    let tmpResult

    //创建显式flag，默认false，即都要执行
    let skipStepFlag={
        ifFkValueExist_And_FkHasPriority_async:false,
        ifEnumHasDuplicateValue:false,
    }
    if(undefined!==skipStep){
        for(let singleSkipStep of skipStep){
            skipStepFlag[singleSkipStep]=true
        }
    }
    /*******************************************************************************************/
    /******************          fk value exists and owner check                    ************/
    /*******************************************************************************************/
    if(false===skipStepFlag['ifFkValueExist_And_FkHasPriority_async']){
        await controllerChecker.ifFkValueExist_And_FkHasPriority_async({docValue:docValue,userId:userId,collName:collName})
    }

    /*******************************************************************************************/
    /******************              enum(array) unique check                       ************/
    /*******************************************************************************************/
    if(false===skipStepFlag['ifEnumHasDuplicateValue']) {
        tmpResult = controllerChecker.ifEnumHasDuplicateValue({
            collValue: docValue,
            collRule: collName,
        })
        // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
        if (tmpResult.rc > 0) {
            return Promise.reject(tmpResult)
        }
    }

    /*******************************************************************************************/
    /******************          single field value unique check                    ************/
    /*******************************************************************************************/
    if(false===skipStepFlag['ifSingleFieldValueUnique_async']) {
        await controllerChecker.ifSingleFieldValueUnique_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:uniqueCheckAdditionalCondition})
    }

    /*******************************************************************************************/
    /******************          compound field value unique check                  ************/
    /*******************************************************************************************/
    if(false===skipStepFlag['ifSingleFieldValueUnique_async']) {
        await controllerChecker.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:uniqueCheckAdditionalCondition})
    }
}
module.exports={
    createFolder_async,
}