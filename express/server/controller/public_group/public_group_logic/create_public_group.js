/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../public_group_setting/public_group_setting').setting
const controllerError=require('../public_group_setting/public_group_controllerError').controllerError

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
const array=server_common_file_require.array
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
const e_documentStatus=mongoEnum.DocumentStatus.DB
// const e_impeachType=mongoEnum.ImpeachType.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

/*                      configuration                                               */
// const publicGroup_Configuration=server_common_file_require.globalConfiguration.PublicGroup

async  function createPublicGroup_async({req,applyRange}){
    // console.log(`createPublicGroup_async in`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo

    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)

    /**********************************************/
    /***********      特定检测      **************/
    /*********************************************/
    //只能包含name和rule
    let expectedFields=[e_field.PUBLIC_GROUP.NAME,e_field.PUBLIC_GROUP.JOIN_IN_RULE]
    let inputKeys=Object.keys(docValue)
    if(false===array.ifArrayEleContainInArray({expectedArray:expectedFields,toBeCheckArray:inputKeys})){
        return Promise.reject(controllerError.create.unExpectedInputFiled)
    }


    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('userId',userId)
    let stepParam={
        //fk: impeach的state不能为NEW,EDITING或者DONE
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
        /**   public group num **/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_PUBLIC_GROUP_NUM],userId:userId,containerId:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    /*******************************************************************************************/
    /**                         添加默认的client field                                        **/
    /*******************************************************************************************/
    docValue[e_field.PUBLIC_GROUP.ADMINS_ID]=[userId]
    docValue[e_field.PUBLIC_GROUP.MEMBERS_ID]=[userId]

    /**     db操作        **/
    let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})

    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.encryptSingleRecord({record:createdRecord,salt:tempSalt,collName:collName})

    // ap.inf('createdRecord done',createdRecord)
    return Promise.resolve({rc:0,msg:createdRecord})


}
async function businessLogic_async({docValue,collName,userId,applyRange}) {
    /*****************************************************/
    /****            添加internal field，然后检查      ***/
    /******************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    // internalValue[e_field.USER_FRIEND_GROUP.]=impeachType
    internalValue[e_field.PUBLIC_GROUP.CREATOR_ID]=userId
    // ap.inf('collname',collName)
    // ap.inf('internalInputRule[collName]',internalInputRule[collName])
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
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
// console.log(`========================>internal check  done<--------------------------`)
    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
    if(undefined!==docValue){
        let compoundFiledValueUniqueCheckAdditionalCheckCondition
        await controllerInputValueLogicCheck.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:compoundFiledValueUniqueCheckAdditionalCheckCondition,
        })
    }
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    //new impeach插入db
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})
// console.log(`create result is ====>${JSON.stringify(tmpResult)}`)

    /* //插入关联数据（impeach action=create）
     let impeachStateValue={
         [e_field.IMPEACH_ACTION.IMPEACH_ID]:tmpResult['_id'],
         // [e_field.IMPEACH_STATE.OWNER_ID]:userId,
         // [e_field.IMPEACH_STATE.OWNER_COLL]:e_coll.USER,
         [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.CREATE,
         [e_field.IMPEACH_ACTION.CREATOR_ID]:userId,
         [e_field.IMPEACH_ACTION.CREATOR_COLL]:e_coll.USER,
     }
     await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_action,value:impeachStateValue})*/
    return Promise.resolve(createdRecord.toObject())
}
module.exports={
    createPublicGroup_async,
}