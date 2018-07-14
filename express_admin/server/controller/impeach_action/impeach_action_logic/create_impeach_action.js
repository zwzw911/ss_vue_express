/**
 * Created by ada on 2017/9/1.
 *
 * 只处理USER相关的state变化（submit/revoke）
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controller_setting=require('../impeach_action_setting/impeach_action_setting').setting
const controllerError=require('../impeach_action_setting/impeach_action_controllerError').controllerError
const adminActionNeededPriority=require('../impeach_action_setting/impeach_action_setting').adminActionNeededPriority
const availableNextAdminAction=require('../impeach_action_setting/impeach_action_setting').availableNextAdminAction
const impeachActionMatchState=require('../impeach_action_setting/impeach_action_setting').impeachActionMatchState
/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/********************  rule   ********************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule

const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=server_common_file_require.nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const enumValue=require('../../../constant/genEnum/enumValue')
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck

const misc=server_common_file_require.misc
const arr=server_common_file_require.array

const hash=server_common_file_require.crypt.hash
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv


//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createImpeachAction_async({req,applyRange}){
    // console.log(`createImpeachAction_async in with values===========>${JSON.stringify(req.body.values)}`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // let userId=userInfo.userId,userCollName=userInfo[e_userInfoField.COLL_NAME],userType=[e_userInfoField.USER_TYPE]
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    let impeachDoc,impeachId,impeachCreator,impeachStateRecords,lastImpeachAction,condition
    /*********************************************/
    /*************    用户类型检测    ************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.ADMIN_NORMAL,e_allUserType.ADMIN_ROOT]})
    /*******************************************************************************************/
    /**                        传入的action是否为此类型用户可以操作                           **/
    /*******************************************************************************************/
    //ACTION要兼顾user和adminUser，所以需要在logic中再次细分action是否属于user/adminUser
    if(-1===enumValue.ImpeachAdminAction.indexOf(docValue[e_field.IMPEACH_ACTION.ACTION])){
        return Promise.reject(controllerError.create.invalidActionForAdminUser)
    }
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)
// console.log(`convert docValue============>${JSON.stringify(docValue)}`)

    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('userId',userId)
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:false,optionalParam:undefined},//impeachId可以被creator和adminUser操作，所以不能自行PRIORITY的操作
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /**   判断 撤销/编辑中/提交但未被处理 的举报数是否超出预订范围 **/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined,resourceProfileRange:undefined,userId:undefined,containerId:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    /*********************************************/
    /******      特殊处理（impeach）       *******/
    /*********************************************/

    /*******************************************************************************************/
    /******************         ACTION是否有对应的priority支持          ************************/
    /*******************************************************************************************/
    //根据ACTION获得对应的权限
    // console.log(`docValue[e_field.IMPEACH_ACTION.ACTION]==============>${JSON.stringify(docValue[e_field.IMPEACH_ACTION.ACTION])}`)
    let matchPriority=adminActionNeededPriority[docValue[e_field.IMPEACH_ACTION.ACTION]]
    // console.log(`adminActionNeededPrioritye=======================>${JSON.stringify(adminActionNeededPrioritye)}`)
    // console.log(`matchPriority=======================>${JSON.stringify(matchPriority)}`)
    if(undefined===matchPriority){
        return  Promise.reject(controllerError.create.actionNoRelatedPriority)
    }
    //当前用户是否具有此权限
    let adminUserHasPriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:matchPriority})
    if(false===adminUserHasPriority){
        return  Promise.reject(controllerError.create.userHasNoPriorityToThisOption)
    }

    //adminOwnerId必须设置（即使REJECT/FINISH, 如此说明此impeach不再普通用户手中？）
    if(undefined===docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]){
        return Promise.reject(controllerError.create.ownerIdMustExists)
    }


    /**********************************************************************************************************************************/
    /* *****************************************         特殊字段检查(cont)       ***********************************************/
    /**********************************************************************************************************************************/
    //查找最近一个action，判断当前输入的action是否可用
    impeachId=docValue[e_field.IMPEACH_ACTION.IMPEACH_ID]
    condition={[e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId}
    let options={sort:{'cDate':-1}}//
    // console.log(`condition =============>${JSON.stringify(condition)}`)
    impeachStateRecords=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.impeach_action,condition:condition,options:options})
    // console.log(`impeachStateRecords =============>${JSON.stringify(impeachStateRecords)}`)
    //如果没有任何action，返回错误
    if(impeachStateRecords.length===0){
        return Promise.reject(controllerError.create.noPreviousActionRecords)
    }
    //
    //根据最近一个action的记录，判断1. adminUserOwnerId是否为当前用户  2. 输入action是否OK
    lastImpeachAction=impeachStateRecords[0][e_field.IMPEACH_ACTION.ACTION]
    // console.log(`impeachStateRecords[0][e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=======================>${JSON.stringify(impeachStateRecords[0][e_field.IMPEACH_ACTION.ADMIN_OWNER_ID])}`)
    // console.log(`userId=======================>${JSON.stringify(userId)}`)
    // console.log(`typeof impeachStateRecords[0][e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]===========>${JSON.stringify(typeof impeachStateRecords[0][e_field.IMPEACH_ACTION.ADMIN_OWNER_ID])}`)
    // console.log(`typeof impeachStateRecords[0][e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]===========>${JSON.stringify(typeof impeachStateRecords[0][e_field.IMPEACH_ACTION.ADMIN_OWNER_ID].toString())}`)
    // console.log(`typeof userId===========>${JSON.stringify(typeof userId)}`)
    if(impeachStateRecords[0][e_field.IMPEACH_ACTION.ADMIN_OWNER_ID].toString()!==userId){
        return Promise.reject(controllerError.create.forbidToTakeActionForCurrentImpeach)
    }
    // console.log(`availableNextUserAction==========>${JSON.stringify(availableNextUserAction)}`)
    // console.log(`availableNextUserAction[lastImpeachAction]==========>${JSON.stringify(availableNextUserAction[lastImpeachAction])}`)
    // console.log(`docValue[e_field.IMPEACH_ACTION.ACTION]============>${JSON.stringify(docValue[e_field.IMPEACH_ACTION.ACTION])}`)
    //当前用户类型在当前ACTION下没有下一个ACTION，或者输入的action不在availableAction的范围内， 说明当前输入的ACTION是错误的
    if(undefined===availableNextAdminAction[lastImpeachAction] || -1===availableNextAdminAction[lastImpeachAction].indexOf(docValue[e_field.IMPEACH_ACTION.ACTION])){
        return Promise.reject(controllerError.create.invalidActionBaseOnCurrentAction)
    }
    // console.log(`after special field check docValue=======>${JSON.stringify(docValue)}`)






    return await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})



}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,userId,applyRange}){
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.IMPEACH_ACTION.CREATOR_COLL]=e_coll.ADMIN_USER
    internalValue[e_field.IMPEACH_ACTION.CREATOR_ID]=userId

    if(e_env.DEV===currentEnv){
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
    // console.log(`internal check  is ${JSON.stringify(docValue)}`)
    // let currentColl=e_coll.USER_SUGAR
    // console.log(`value to be insert is ${JSON.stringify(docValue)}`)
    // let doc=new dbModel[currentColl](values[e_part.RECORD_INFO])


    // console.log(`docValue ${JSON.stringify(docValue)}`)
    //根据action获得对应的state，更新到impeach（如果是submit，需要自动选择合适的screener）
    let currentAction=docValue[e_field.IMPEACH_ACTION.ACTION]
    let docValueForUpdateImpeach={
        [e_field.IMPEACH.CURRENT_STATE]:impeachActionMatchState[currentAction],
        [e_field.IMPEACH.CURRENT_ADMIN_OWNER_ID]:docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]
    }
    /*    if(e_impeachAdminAction.CREATE===currentAction || e_impeachAdminAction.REVOKE===currentAction){
            docValueForUpdateImpeach[e_field.IMPEACH.CURRENT_ADMIN_OWNER_ID]=null
        }*/
    /*    if(e_impeachAdminAction.SUBMIT===currentAction ){
            // let adminUser=await controllerHelper.chooseProperAdminUser_async({arr_priorityType:[e_adminPriorityType.IMPEACH_ASSIGN]})
            docValueForUpdateImpeach[e_field.IMPEACH_ACTION.CURRENT_ADMIN_OWNER_ID]=docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]
        }*/
    //action插入 db
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_action,value:docValue})
    //state更新到impeach
    let impeachId=docValue[e_field.IMPEACH_ACTION.IMPEACH_ID]
    await  common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId,updateFieldsValue:docValueForUpdateImpeach})
    return Promise.resolve({rc:0})
}
module.exports={
    createImpeachAction_async,
}