/**
 * Created by ada on 2017/9/1.
 */
'use strict'


/*                      controller setting                */
const controller_setting=require('../impeach_state_setting/impeach_state_setting').setting
const controllerError=require('../impeach_state_setting/impeach_state_controllerError').controllerError
const availableNextState=require(`../impeach_state_setting/impeach_state_setting`).availableNextState
const endState=require(`../impeach_state_setting/impeach_state_setting`).endState

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
const e_userInfoMandatoryField=nodeRuntimeEnum.userInfoMandatoryField
const e_impeachState=mongoEnum.ImpeachState.DB


/*                      server common：function                                       */
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
async  function createImpeachState_async(req){
    // console.log(`create user in`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId,userCollName=userInfo[e_userInfoMandatoryField.COLL_NAME],userType=[e_userInfoMandatoryField.USER_TYPE]
    let impeachDoc,impeachId,impeachCreator,impeachStateRecords,lastImpeachState,condition
    /*******************************************************************************************/
    /*                                     参数转为server格式                                  */
    /*******************************************************************************************/
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructCreateCriteria(docValue)

    /**********************************************************************************************************************************/
    /******************************************特殊，先检查输入值的正确性，然后权限检查***********************************************/
    /**********************************************************************************************************************************/

    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
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
    impeachId=docValue[e_field.IMPEACH_STATE.IMPEACH_ID]
    //impeach为删除，则无法更改state（由ifFkValueExist_async确保impeachId是存在的)
    impeachDoc=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId,selectedFields:'-cDate'})
    // console.log(`impeachDoc=============>${JSON.stringify(impeachDoc)}`)
    if(undefined!==impeachDoc['dDate']){
        return Promise.reject(controllerError.relatedImpeachAlreadyDeleted)
    }
    //首先判断当前如果是普通用户，需要根据impeachId判断对应的impeach是否为其所创，且owner为其；如果是admin，只要判断owner是否为其
    //普通用户，是否为impeach的创建人
    if(userCollName===e_coll.USER){
        // console.log(`impeachId===========>${JSON.stringify(impeachId)}`)
        impeachCreator=impeachDoc[e_field.IMPEACH.CREATOR_ID]
        // console.log(`impeachCreator===========>${JSON.stringify(impeachCreator)}`)
        // console.log(`userId===========>${JSON.stringify(userId)}`)
        // onsole.log(`impeachCreator!==userId`)
        if(impeachCreator.toString()!==userId){
            return Promise.reject(controllerError.notCreatorOfImpeach)
        }
    }
    //查找impeach最近的一个impeach_state(至少有一个，即用户创建impeach的时候，自动生成的“new” impeach_state)
    condition={[e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId}
    let options={sort:{'cDate':-1}}//
    // console.log(`condition =============>${JSON.stringify(condition)}`)
    impeachStateRecords=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.impeach_state,condition:condition,options:options})
    // console.log(`impeachStateRecords =============>${JSON.stringify(impeachStateRecords)}`)
    if(0===impeachStateRecords.length){
        return Promise.reject(controllerError.cantCreateSinceNoPreviousState)
    }
    //第一个state必须是NEW
    if(e_impeachState.NEW!==impeachStateRecords[impeachStateRecords.length-1][e_field.IMPEACH_STATE.STATE]){
        return Promise.reject(controllerError.firstStateMustBeNew)
    }
    //如果最后一个记录是REJECT/DONE，无法继续输入状态
    let lastState=impeachStateRecords[0][e_field.IMPEACH_STATE.STATE]//降序查找
    if(-1!==endState.indexOf(lastState)){
        return Promise.reject(controllerError.impeachEndedNoMoreStateChangeAllow)
    }
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                 因为name是unique，所以要检查用户名是否存在(unique check)                */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }
// console.log(`ifFieldInDocValueUnique_async done===>`)

    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    //当前传入的state不能为NEW（NEW是创建impeach的时候自动生成的）
    if(e_impeachState.NEW===docValue[e_field.IMPEACH_STATE.STATE]){
        return Promise.reject(controllerError.NEWStateNotAllow)
    }
    //根据最近一个state的记录，判断输入state是否OK
    lastImpeachState=impeachStateRecords[0][e_field.IMPEACH_STATE.STATE]
        //当前用户类型在当前状态下没有下一个状态，说明当前输入的docValue是错误的（例如，如果当前是NEW，则admin无法更改状态）
    if(undefined===availableNextState[lastImpeachState] || undefined===availableNextState[lastImpeachState][userType]){
        if(undefined!==docValue[e_field.IMPEACH_STATE.STATE]){
            return Promise.reject(controllerError.invalidStateBaseOnCurrentState)
        }
    }
        //有下一个状态，判断输入state是否位于其中
    let availableNextStateForCurrentState=availableNextState[lastImpeachState][userType]
    if(-1===availableNextStateForCurrentState.indexOf(docValue[e_field.IMPEACH_STATE.STATE])){
        return Promise.reject(controllerError.invalidStateBaseOnCurrentState)
    }

    //如果是REVOKE，则自动将state变成NEW
    if(docValue[e_field.IMPEACH_STATE.STATE]===e_impeachState.REVOKE){
        docValue[e_field.IMPEACH_STATE.STATE]===e_impeachState.NEW
    }

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.IMPEACH_STATE.DEALER_COLL]=userCollName
    internalValue[e_field.IMPEACH_STATE.DEALER_ID]=userId
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName]})
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
    //用户插入 db
    let userCreateTmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_state,value:docValue})
    return Promise.resolve({rc:0})
}

module.exports={
    createImpeachState_async,
}