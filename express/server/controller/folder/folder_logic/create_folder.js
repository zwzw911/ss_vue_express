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
const inputValueLogicValidCheck_async=server_common_file_require.controllerInputValueLogicCheck.inputValueLogicValidCheck_async
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc


const hash=server_common_file_require.crypt.hash
/****************  公共常量 ********************/
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_resourceRange=server_common_file_require.mongoEnum.ResourceRange.DB
const e_allUserType=mongoEnum.AllUserType.DB

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_resourceFieldName=nodeEnum.ResourceFieldName

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const miscConfiguration=server_common_file_require.globalConfiguration.miscConfiguration
const maxNumber=server_common_file_require.globalConfiguration.maxNumber


/*************************************************************/
/***************   主函数      *******************************/
/*************************************************************/
async function createFolder_async({req}){
    // ap.inf('in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    // ap.inf('controller_setting.MAIN_HANDLED_COLL_NAME',controllerSetting)
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    // ap.inf('collName',collName)
    let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo



    //={requiredResource:{sizeInMb:xxx,num:yyy,filesAbsPath:['如果检测失败，需要删除文件']},resourceProfileRange,containerId}

    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    // ap.inf('docValue',docValue)
    dataConvert.constructCreateCriteria(docValue)
    ap.inf('after constructCreateCriteria',docValue)

    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.inf('用户类型检测 done')
    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('userId',userId)
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:{optionalParam:undefined}}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.FOLDER_NUM],userId:userId,containerId:undefined}}},
    }
    await inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.inf('inputValueLogicValidCheck_async done')

    let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId})

    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.cryptRecordValue({record:createdRecord,salt:tempSalt,collName:collName})

    // ap.inf('businessLogic_async done')
    return Promise.resolve({rc:0,msg:createdRecord})
}


/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,userId}){
    // ap.inf('businessLogic_async in')
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
        return Promise.reject(controllerError.create.folderLevelExceed)
    }

    //添加创建人
    internalValue[e_field.FOLDER.AUTHOR_ID]=userId
    // ap.inf('interval check before')
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        //ap.inf('req.body.values',req.body.values)
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:e_applyRange.CREATE})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
    //ap.inf('docValue mergerd',docValue)
    /***        数据库操作            ****/
    let createdRecord=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.folder,value:docValue})
    // /*****  转换格式 *******/
    // for(let idx in createdRecord) {
    //     createdRecord[idx] = createdRecord[idx].toObject()
    // }

    return Promise.resolve(createdRecord.toObject())
}
module.exports={
    createFolder_async,
}