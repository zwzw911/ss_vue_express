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
const availableNextUserAction=require('../impeach_action_setting/impeach_action_setting').availableNextUserAction
const endState=require(`../impeach_action_setting/impeach_action_setting`).endState
const impeachActionMatchState=require(`../impeach_action_setting/impeach_action_setting`).impeachActionMatchState
/**************      rule             *************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const enumValue=require(`../../../constant/genEnum/enumValue`)

const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
/****************  公共常量 ********************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_resourceFieldName=nodeEnum.ResourceFieldName

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
// const e_impeachType=mongoEnum.ImpeachType.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

/**         普通用户的action     **/
async  function createImpeachAction_async({req,applyRange}){
    // ap.wrn('createImpeachAction_async in')
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
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    /**     普通用户的action     **/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)

    /*********************************************/
    /**********         特殊处理         *********/
    /*********************************************/

    /**   传入的action是否为此类型用户可以操作   **/
    //ACTION要兼顾user和adminUser，所以需要在logic中再次细分action是否属于user/adminUser
    if(-1===enumValue.ImpeachUserAction.indexOf(docValue[e_field.IMPEACH_ACTION.ACTION])){
        return Promise.reject(controllerError.create.invalidActionForUser)
    }
    /**     操作不能为CREATE(create是创建impeach的时候自动创建的)     **/
    if(e_impeachUserAction.CREATE=== docValue[e_field.IMPEACH_ACTION.ACTION]){
        return Promise.reject(controllerError.create.forbidActionForUser)
    }
    /**  adminOwnerId只能由admin设置  **/
    if(undefined!==docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]){
        return Promise.reject(controllerError.create.forbidInputOwnerId)
    }
    // ap.wrn('before inputValueLogicValidCheck')
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
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /**   判断 撤销/编辑中/提交但未被处理 的举报数是否超出预订范围 **/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined,resourceProfileRange:undefined,userId:undefined,containerId:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.wrn('after inputValueLogicValidCheck')
    /*********************************************/
    /******      特殊处理（impeach）       *******/
    /*********************************************/
    //检查impeach 1. 是否为删除 2. 是否为结束（DONE（finish/reject）） 3. 是否为当前普通用户所创
    impeachId=docValue[e_field.IMPEACH_ACTION.IMPEACH_ID]
    //impeach为删除，则无法更改state（由ifFkValueExist_async确保impeachId是存在的)
    impeachDoc=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId,selectedFields:'-cDate'})
    // console.log(`impeachDoc=============>${JSON.stringify(impeachDoc)}`)
    if(undefined!==impeachDoc['dDate']){
        return Promise.reject(controllerError.create.relatedImpeachAlreadyDeleted)
    }
    if(undefined!==impeachDoc[e_field.IMPEACH.CURRENT_STATE] && -1!==endState.indexOf(impeachDoc[e_field.IMPEACH.CURRENT_STATE])){
        return Promise.reject(controllerError.create.impeachAlreadyDone)
    }
    //根据impeachId判断对应的impeach是否为其所创(在fk中检查)
    // console.log(`impeachId===========>${JSON.stringify(impeachId)}`)
/*    impeachCreator=impeachDoc[e_field.IMPEACH.CREATOR_ID]
    // console.log(`impeachCreator===========>${JSON.stringify(impeachCreator)}`)
    // console.log(`userId===========>${JSON.stringify(userId)}`)
    // onsole.log(`impeachCreator!==userId`)
    if(impeachCreator.toString()!==userId){
        return Promise.reject(controllerError.create.notCreatorOfImpeach)
    }*/
    // ap.wrn('after special check')

    /***  submit的时候，才需要选定一个admin；其他的user操作，都无需admin_owner_id（隐式使用creatorId）***/
    // console.log(`docValue=======>${JSON.stringify(docValue)}`)
    if(docValue[e_field.IMPEACH_ACTION.ACTION]===e_impeachUserAction.SUBMIT){
        // console.log(`submit in=======>`)
        let validAdminUser=await controllerHelper.chooseProperAdminUser_async({arr_priorityType:[e_adminPriorityType.IMPEACH_ASSIGN]})
        // console.log(`submit admin=======>${JSON.stringify(validAdminUser)}`)
        // console.log(`validAdminUser['_id']============>${JSON.stringify(validAdminUser['_id'])}`)
        // console.log(` e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]============>${JSON.stringify(e_field.IMPEACH_ACTION.ADMIN_OWNER_ID)}`)
        // console.log(`docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]================>${JSON.stringify(docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID])}`)
        docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=validAdminUser['_id']
        // console.log(`docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]================>${JSON.stringify(docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID])}`)
        // console.log(`docValue after choose =================>${JSON.stringify(docValue)}`)
    }
    // ap.wrn('docValue',docValue)
    /**     查找最近一个action，判断当前输入的action是否可用      **/
    impeachId=docValue[e_field.IMPEACH_ACTION.IMPEACH_ID]
    condition={[e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId}
    let options={sort:{'cDate':-1}}//
    // console.log(`condition =============>${JSON.stringify(condition)}`)
    impeachStateRecords=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.impeach_action,condition:condition,options:options})
    // console.log(`impeachStateRecords =============>${JSON.stringify(impeachStateRecords)}`)
    //如果没有任何action，要手动添加(补全)一个CREATE。同时无需更改impeach的state
    if(impeachStateRecords.length===0){
        let value={
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId,
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.CREATE,
            [e_field.IMPEACH_ACTION.CREATOR_ID]:userId,
            [e_field.IMPEACH_ACTION.CREATOR_COLL]:e_coll.USER,
        }
        // ap.wrn('value',value)
        await  common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_action,value:value})
        // ap.wrn('done')
        lastImpeachAction=e_impeachUserAction.CREATE
    }else{
        //根据最近一个action的记录，判断输入action是否OK
        lastImpeachAction=impeachStateRecords[0][e_field.IMPEACH_ACTION.ACTION]
    }

    //当前用户类型在当前ACTION下没有下一个ACTION，或者输入的action不在availableAction的范围内， 说明当前输入的ACTION是错误的
    if(undefined===availableNextUserAction[lastImpeachAction] || -1===availableNextUserAction[lastImpeachAction].indexOf(docValue[e_field.IMPEACH_ACTION.ACTION])){
        return Promise.reject(controllerError.create.invalidActionBaseOnCurrentAction)
    }
    //无任何返回值，直接返回
    // ap.wrn('before businessLogic_async',docValue)
    return await businessLogic_async({docValue:docValue,userCollName:userCollName,collName:collName,userId:userId,applyRange:applyRange,optionParam:{userCollName:collName,impeachId:impeachId}})
    // ap.wrn('after businessLogic_async')

}

async function businessLogic_async({docValue,collName,userId,applyRange,optionParam}){
    /*****************************************************/
    /****            添加internal field，然后检查      ***/
    /******************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.IMPEACH_ACTION.CREATOR_COLL]=e_coll.USER
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
    /**   根据action获得对应的state，更新到impeach（如果是submit，需要自动选择合适的screener）  **/
    let currentAction=docValue[e_field.IMPEACH_ACTION.ACTION]
    let docValueForUpdateImpeach={
        [e_field.IMPEACH.CURRENT_STATE]:impeachActionMatchState[currentAction]
    }
    /*    if(e_impeachUserAction.CREATE===currentAction || e_impeachUserAction.REVOKE===currentAction){
            docValueForUpdateImpeach[e_field.IMPEACH.CURRENT_ADMIN_OWNER_ID]=null
        }*/
    if(e_impeachUserAction.SUBMIT===currentAction ){
        // let adminUser=await controllerHelper.chooseProperAdminUser_async({arr_priorityType:[e_adminPriorityType.IMPEACH_ASSIGN]})
        docValueForUpdateImpeach[e_field.IMPEACH.CURRENT_ADMIN_OWNER_ID]=docValue[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]
    }
    //action插入 db
    // console.log(`docValue=================>${JSON.stringify(docValue)}`)
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_action,value:docValue})
    //state更新到impeach
    await  common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:optionParam.impeachId,updateFieldsValue:docValueForUpdateImpeach})
    return Promise.resolve({rc:0})
}
module.exports={
    createImpeachAction_async,
}