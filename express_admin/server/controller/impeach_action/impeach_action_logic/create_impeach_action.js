/**
 * Created by ada on 2017/9/1.
 *
 * 只处理USER相关的state变化（submit/revoke）
 */
'use strict'


/*                      controller setting                */
const controller_setting=require('../impeach_action_setting/impeach_action_setting').setting
const controllerError=require('../impeach_action_setting/impeach_action_controllerError').controllerError
const availableNextUserAction=require(`../impeach_action_setting/impeach_action_setting`).availableNextUserAction
const availableNextAdminAction=require(`../impeach_action_setting/impeach_action_setting`).availableNextAdminAction
const endState=require(`../impeach_action_setting/impeach_action_setting`).endState
const adminPriorityRelatedAction=require(`../impeach_action_setting/impeach_action_setting`).adminPriorityRelatedAction
const impeachActionMatchState=require(`../impeach_action_setting/impeach_action_setting`).impeachActionMatchState
const adminActionNeededPrioritye=require(`../impeach_action_setting/impeach_action_setting`).adminActionNeededPriority
/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/*                      server common：enum                                       */
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
// const e_userInfoField=nodeRuntimeEnum.UserInfoField
const e_impeachState=mongoEnum.ImpeachState.DB
const e_impeachAdminAction=mongoEnum.ImpeachAdminAction.DB
const e_impeachAllAction=mongoEnum.ImpeachAllAction.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB


const enumValue=require(`../../../constant/genEnum/enumValue`)
/*                      server common：function                                       */
//const algorithm=server_common_file_require.algorithm
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model

// const misc=server_common_file_require.misc
// const hash=server_common_file_require.crypt.hash

/*                      server common：other                                       */
// const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createImpeachAction_async(req){
    // console.log(`createImpeachAction_async in with values===========>${JSON.stringify(req.body.values)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // let userId=userInfo.userId,userCollName=userInfo[e_userInfoField.COLL_NAME],userType=[e_userInfoField.USER_TYPE]
    let {userId,userCollName,userType,userPriority}=userInfo
    let impeachDoc,impeachId,impeachCreator,impeachStateRecords,lastImpeachAction,condition
    /*******************************************************************************************/
    /*                                     用户类型检查                                        */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.ADMIN_NORMAL,e_allUserType.ADMIN_ROOT]})
    /*******************************************************************************************/
    /*                         传入的action是否为此类型用户可以操作                            */
    /*******************************************************************************************/
    //ACTION要兼顾user和adminUser，所以需要在logic中再次细分action是否属于user/adminUser
    if(-1===enumValue.ImpeachAdminAction.indexOf(docValue[e_field.IMPEACH_ACTION.ACTION])){
        return Promise.reject(controllerError.invalidActionForAdminUser)
    }
    /*******************************************************************************************/
    /*                                     参数转为server格式                                  */
    /*******************************************************************************************/
    dataConvert.constructCreateCriteria(docValue)
// console.log(`convert docValue============>${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                                     特殊字段 预 处理                                    */
    /*******************************************************************************************/

    /**********************************************************************************************************************************/
    /* *****************************************         ACTION是否有对应的priority支持       ***********************************************/
    /**********************************************************************************************************************************/
    //根据ACTION获得对应的权限
    // console.log(`docValue[e_field.IMPEACH_ACTION.ACTION]==============>${JSON.stringify(docValue[e_field.IMPEACH_ACTION.ACTION])}`)
    let matchPriority=adminActionNeededPrioritye[docValue[e_field.IMPEACH_ACTION.ACTION]]
    // console.log(`adminActionNeededPrioritye=======================>${JSON.stringify(adminActionNeededPrioritye)}`)
    // console.log(`matchPriority=======================>${JSON.stringify(matchPriority)}`)
    if(undefined===matchPriority){
        return  Promise.reject(controllerError.actionNoRelatedPriority)
    }
    //当前用户是否具有此权限
    let adminUserHasPriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:matchPriority})
    if(false===adminUserHasPriority){
        return  Promise.reject(controllerError.userHasNoPriorityToThisOption)
    }

    //adminOwnerId必须设置（即使REJECT/FINISH, 如此说明此impeach不再普通用户手中？）
    if(undefined===docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]){
        return Promise.reject(controllerError.ownerIdMustExists)
    }


    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/
    if(undefined!==fkConfig[collName]){
        await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
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
        return Promise.reject(controllerError.noPreviousActionRecords)
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
        return Promise.reject(controllerError.forbidToTakeActionForCurrentImpeach)
    }
    // console.log(`availableNextUserAction==========>${JSON.stringify(availableNextUserAction)}`)
    // console.log(`availableNextUserAction[lastImpeachAction]==========>${JSON.stringify(availableNextUserAction[lastImpeachAction])}`)
    // console.log(`docValue[e_field.IMPEACH_ACTION.ACTION]============>${JSON.stringify(docValue[e_field.IMPEACH_ACTION.ACTION])}`)
    //当前用户类型在当前ACTION下没有下一个ACTION，或者输入的action不在availableAction的范围内， 说明当前输入的ACTION是错误的
    if(undefined===availableNextAdminAction[lastImpeachAction] || -1===availableNextAdminAction[lastImpeachAction].indexOf(docValue[e_field.IMPEACH_ACTION.ACTION])){
        return Promise.reject(controllerError.invalidActionBaseOnCurrentAction)
    }
    // console.log(`after special field check docValue=======>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                  enum unique check(enum in array)                       */
    /*******************************************************************************************/
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
    tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    /*
    *   以下检测可以省略，因为
    *   impeach已经删除(如果已经删除，在fkValue check中就会报错)
    *   impeach已经结束（会在action check）
    * */
   /* //检查impeach 1. 是否为删除 2. 是否为结束（DONE（finish/reject））
    impeachId=docValue[e_field.IMPEACH_ACTION.IMPEACH_ID]
    //impeach为删除，则无法更改state（由ifFkValueExist_async确保impeachId是存在的)
    impeachDoc=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId,selectedFields:'-cDate'})
    // 1. impeach已经删除(如果已经删除，在fkValue check中就会报错)
    if(undefined!==impeachDoc['dDate']){
        return Promise.reject(controllerError.relatedImpeachAlreadyDeleted)
    }
    //2. impeach已经结束（会在action check）
    if(undefined!==impeachDoc[e_field.IMPEACH.CURRENT_STATE] && -1!==endState.indexOf(impeachDoc[e_field.IMPEACH.CURRENT_STATE])){
        return Promise.reject(controllerError.impeachAlreadyDone)
    }*/






    /*******************************************************************************************/
    /*                                       preCondition check                               */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                                          unique check                                   */
    /*******************************************************************************************/
    //单字段的unique check
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        let additionalCheckCondition//={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }


    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.IMPEACH_ACTION.CREATOR_COLL]=userCollName
    internalValue[e_field.IMPEACH_ACTION.CREATOR_ID]=userId

    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
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
    await  common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId,updateFieldsValue:docValueForUpdateImpeach})
    return Promise.resolve({rc:0})
}

module.exports={
    createImpeachAction_async,
}