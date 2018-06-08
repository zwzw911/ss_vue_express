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
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc


const crypt=server_common_file_require.crypt
/****************  公共常量 ********************/
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
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
async function updateFolder_async({req,applyRange}){
    /************************************************/
    /**************   define variant   *************/
    /***********************************************/
    let tmpResult,condition,option
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    // let collFkConfig=fkConfig[collName]
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo


    /************************************************/
    /***********        转换null字段      **********/
    /************************************************/
    // ap.inf('before constructUpdateCriteria done',docValue)
    dataConvert.constructUpdateCriteria(docValue)
    // ap.inf('after constructUpdateCriteria done',docValue)
    /************************************************/
    /*************        用户类型检测    **********/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.inf('ifExpectedUserType_async done',docValue)
/*    /!************************************************!/
    /!******   传入的敏感数据（recordId）解密，recordInfo中的objectId在dispatch中解密   ******!/
    /!************************************************!/
    // controllerHelper.decryptRecordValue({record:docValue,collName:collName})
    recordId=crypt.decryptSingleFieldValue({fieldValue:recordId,salt:tempSalt})
    if(false===regex.objectId.test(recordId)){
        return Promise.reject(controllerError.update.inValidFolderId)
    }*/
    /**********************************************/
    /***    用户权限检测(兼检查记录是否存在)   ***/
    /*********************************************/
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.folder,
            recordId:recordId,
            ownerFieldsName:[e_field.FOLDER.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        // ap.inf('originalDoc',originalDoc)
        if(false===originalDoc){
            return Promise.reject(controllerError.update.notAuthorCantUpdateFolder)
        }
    }
    /**********************************************/
    /*********    自连接，外键不能为自己   ********/
    /*********************************************/
    if(recordId===docValue[e_field.FOLDER.PARENT_FOLDER_ID]){
        return Promise.reject(controllerError.update.parentFolderIdCantBeSelf)
    }
    // ap.inf('priority check done',docValue)
    /**********************************************/
    /*********    是否未做任何更改    ************/
    /*********************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
// ap.inf('delete not change done',docValue)
    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.inf('inputValueLogicValidCheck_async done',docValue)
    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,applyRange:applyRange})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.cryptRecordValue({record:updatedRecord,salt:tempSalt,collName:collName})
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})

    return Promise.resolve(updatedRecord)
}


/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,recordId,applyRange}){
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
        return Promise.reject(controllerError.update.folderLevelExceed)
    }
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        //ap.inf('req.body.values',req.body.values)
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    if(undefined===docValue){
        docValue=internalValue
    }else{
        Object.assign(docValue,internalValue)
    }

    /*******************************************************************************************/
    /******************          compound field value unique check                  ************/
    /*******************************************************************************************/
    if(undefined!==docValue){
        let compoundFiledValueUniqueCheckAdditionalCheckCondition
        await controllerInputValueLogicCheck.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:compoundFiledValueUniqueCheckAdditionalCheckCondition,
        })
    }
    /***         数据库操作            ***/
    let updatedRecord=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.folder,id:recordId,updateFieldsValue:docValue,updateOption:undefined})
/*    /!*****  转换格式 *******!/
    for(let idx in updatedRecord) {
        updatedRecord[idx] = updatedRecord[idx].toObject()
    }*/
    return Promise.resolve(updatedRecord.toObject())
}
module.exports={
    updateFolder_async,
}