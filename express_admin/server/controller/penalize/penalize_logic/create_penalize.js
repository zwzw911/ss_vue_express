/**
 * Created by ada on 2017/9/1.
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controllerSetting=require('../penalize_setting/penalize_setting').setting
const controllerError=require('../penalize_setting/penalize_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
/********************  rule   ********************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const inputValueLogicValidCheck_async=server_common_file_require.controllerInputValueLogicCheck.inputValueLogicValidCheck_async
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig


//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createPenalize_async({req}){
    // ap.inf('createPenalize_async in ')
    // ap.inf('req ',req.body.values)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
// console.log(`userId===> ${JSON.stringify(userId)}`)
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)
    delete docValue[e_field.ADMIN_PENALIZE.REVOKE_REASON] //创建处罚的时候，必须没有处罚原因
    // console.log(`delete revoke reson`)
    /*********************************************/
    /*************    用户类型检测    ************/
    /*********************************************/
    //检测当前用户是否为adminUser
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.ADMIN_ROOT,e_allUserType.ADMIN_NORMAL]})
    //当前adminUser是否有权限实施（create）处罚
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.PENALIZE_USER]})
    // console.log(`hasCreatePriority===>${JSON.stringify(hasCreatePriority)}`)
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.create.currentUserHasNotPriorityToCreatePenalize)
    }
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
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:{optionalParam:undefined}}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:undefined}},
    }
    await inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    // console.log(`docValue===> ${JSON.stringify(docValue)}`)
    // console.log(`fkConfig[collName]===> ${JSON.stringify(fkConfig[collName])}`)
    // console.log(`e_chineseName[collName]===> ${JSON.stringify(e_chineseName[collName])}`)
    // await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    /*******************************************************************************************/
    /*                            logic priority check                                         */
    /*******************************************************************************************/
    //检查用户valid的处罚记录(处罚的用户，处罚类型)，有的话，直接返回（只能有一个有效记录）
    // valid的条件
/*    let condition={
        // "$or":[{'dDate':{'$exists':false}},{'isExpire':false}],
        "$or":[{[e_field.ADMIN_PENALIZE.DURATION]:0},{'endDate':{'$gt':Date.now()}}],
        //未被删除，同时也未到期或者duration=0（永久未到期），才能视为valid的penalize
        'dDate':{'$exists':false},
        // [e_field.ADMIN_PENALIZE.END_DATE]:{'$lt':Date.now()},
        [e_field.ADMIN_PENALIZE.PUNISHED_ID]:docValue[e_field.ADMIN_PENALIZE.PUNISHED_ID],
        [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:docValue[e_field.ADMIN_PENALIZE.PENALIZE_TYPE],
        [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:docValue[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE],
    }*///,,
    // console.log(`docValue+++++++++>${JSON.stringify(docValue)}`)
    tmpResult=await controllerChecker.ifPenalizeOngoing_async({userId:docValue[e_field.ADMIN_PENALIZE.PUNISHED_ID],penalizeType:docValue[e_field.ADMIN_PENALIZE.PENALIZE_TYPE],penalizeSubType:docValue[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]})
    // console.log(`valid penalize result+++++++++>${JSON.stringify(tmpResult)}`)
    if(true===tmpResult){
        return Promise.reject(controllerError.create.currentUserHasValidPenalizeRecord)
    }
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                  enum unique check(enum in array)                       */
    /*******************************************************************************************/
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
   /* tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }*/
// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                 因为name是unique，所以要检查用户名是否存在(unique check)                */
    /*******************************************************************************************/
   /* if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }*/
// console.log(`ifFieldInDocValueUnique_async done===>`)
    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    // ap.inf('start to logic check')
    let createdRecord=await businessLogic_async({userId:userId,docValue:docValue,collName:collName})
    // ap.inf('created penalize record',createdRecord)

    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    // createdRecord=createdRecord.toObject()
    controllerHelper.cryptRecordValue({record:createdRecord,salt:tempSalt,collName:collName})



    return Promise.resolve({rc:0,msg:createdRecord})


}
/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({userId,docValue,collName}){
    /*********************************************/
    /**********    添加internal value    *********/
    /*********************************************/
    // ap.inf('logic in')
    let internalValue={}
    internalValue[e_field.ADMIN_PENALIZE.CREATOR_ID]=userId
    if(0!==docValue[e_field.ADMIN_PENALIZE.DURATION]){
        internalValue[e_field.ADMIN_PENALIZE.END_DATE]=Date.now()+docValue[e_field.ADMIN_PENALIZE.DURATION]*24*3600*1000
    }
    //处罚100年（永久）
    if(0===docValue[e_field.ADMIN_PENALIZE.DURATION]){
        internalValue[e_field.ADMIN_PENALIZE.END_DATE]=Date.now()+docValue[e_field.ADMIN_PENALIZE.DURATION]*36500*24*3600*1000
    }
    // ap.inf('internalValue',internalValue)
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:e_applyRange.CREATE})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    // ap.inf('check interval done')
    Object.assign(docValue,internalValue)
    // console.log(`internal check  is ${JSON.stringify(docValue)}`)
    // let currentColl=e_coll.USER_SUGAR
    // console.log(`value to be insert is ${JSON.stringify(docValue)}`)
    // let doc=new dbModel[currentColl](values[e_part.RECORD_INFO])


    // console.log(`docValue ${JSON.stringify(docValue)}`)
    /***        数据库操作            ****/
    let userCreateTmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_penalize,value:docValue})
    /*****  转换格式 *******/
    // for(let idx in userCreateTmpResult) {
    //     userCreateTmpResult[idx] = userCreateTmpResult[idx].toObject()
    // }
    return Promise.resolve(userCreateTmpResult.toObject())
}
module.exports={
    createPenalize_async,
}