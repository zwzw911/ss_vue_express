/**
 * Created by ada on 2017/9/1.
 * 只能更新朋友群的名称
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../user_friend_group_setting/user_friend_group_setting').setting
const controllerError=require('../user_friend_group_setting/user_friend_group_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/***************  rule   ****************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule



const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_documentStatus=mongoEnum.DocumentStatus.DB
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt
const array=server_common_file_require.array

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const compoundUniqueFieldConfig=server_common_file_require.compound_unique_field_config.compound_unique_field_config
const globalConfiguration=server_common_file_require.globalConfiguration

async function updateUserFriendGroup_async({req,applyRange}){
    // console.log(`updateUser_async in`)
    // ap.print('expectedPart',expectedPart)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange=false,editSubFieldValueNotChange=false //检测是否需要做update
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // let subFieldValue=req.body.values[e_part.EDIT_SUB_FIELD]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)

    //没有输入任何更改信息，直接返回
    if(Object.keys(docValue).length===0){
        return {rc:0}
    }
    /**********************************************/
    /*********    特殊检测        ************/
    /*********************************************/
    //recordInfo只能包好name一个字段
    if(1!==Object.keys(docValue).length){
        return Promise.reject(controllerError.update.onlyUpdateName)
    }
    if(undefined===docValue[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]){
        return Promise.reject(controllerError.update.onlyUpdateName)
    }
    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /********  删除undefined/null字段  ***********/
    /*********************************************/
    if(undefined!==docValue){
        dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    }
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是user_group的创建人，且user_group未被删除
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.user_friend_group,
            recordId:recordId,
            ownerFieldsName:[e_field.USER_FRIEND_GROUP.OWNER_USER_ID],
            userId:userId,
            additionalCondition:{'dDate':{'$exists':false}},
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.update.notUserGroupOwnerCantUpdate)
        }
    }
    /**********************************************/
    /*********    是否未做任何更改    ************/
    /*********************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }

    /**********************************************/
    /***********      特定检测      **************/
    /*********************************************/
    let defaultGroupName=globalConfiguration.userGroupFriend.defaultGroupName.enumFormat
    let notAllowChangeField={
        [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:[defaultGroupName.MyFriend,defaultGroupName.BlackList]
    }
/*    //名称不能改为默认名称
    if(undefined!==docValue){
        for(let singleNotAllowChangeField in notAllowChangeField){
            //如果要更改的字段处于notAllowChangeField中，且有值，其值位是默认值
            if(undefined!==originalDoc[singleNotAllowChangeField] && -1!==notAllowChangeField[singleNotAllowChangeField].indexOf(originalDoc[singleNotAllowChangeField])){
                return Promise.reject(controllerError.update.notAllowUpdateDefaultRecord)
            }
        }
    }*/
    //默认的组名称不能更改
    if(-1!==notAllowChangeField[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME].indexOf(originalDoc[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME])){
        if(undefined!==docValue[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]){
            return Promise.reject(controllerError.update.notAllowUpdateDefaultRecord)
        }
    }

    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('commonParam',commonParam)
    let stepParam={
        /********  ********/
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //[e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /*****  无需对资源进行检查，因为都是更新操作  ******/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined,resourceProfileRange:undefined,userId:undefined,containerId:undefined}}},
    }

    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,userId:userId,collName:collName,recordId:recordId,applyRange:applyRange})

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.encryptSingleRecord({record:updatedRecord,salt:tempSalt,collName:collName})
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})

    //无需返回更新后记录，只需返回操作结果
    return Promise.resolve({rc:0,msg:updatedRecord})



}
/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,userId,collName,recordId,applyRange}) {
    /******************************************/
    /**    添加internal field，然后检查     **/
    /******************************************/
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    if(undefined===docValue){
        docValue=internalValue
    }else{
        Object.assign(docValue,internalValue)
    }

// ap.print('internal check done')
    /*******************************************************************************************/
    /******************          compound field value unique check                  ************/
    /*******************************************************************************************/
    if(undefined!==docValue){
        //2017-07-05：如果compound字段不为空+某些字段为internal+某些字段可以执行update，那么需要补全internal字段，以便执行检查（update=internal是否为unique）
        let compoundDocValue=misc.objectDeepCopy(docValue)

        if(undefined!==compoundUniqueFieldConfig[collName]){
            compoundDocValue[e_field.USER_FRIEND_GROUP.OWNER_USER_ID]=userId
        }

        let compoundFiledValueUniqueCheckAdditionalCheckCondition
        await controllerInputValueLogicCheck.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:compoundDocValue,
            additionalCheckCondition:compoundFiledValueUniqueCheckAdditionalCheckCondition,
        })
    }

    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    // let promiseTobeExec=[]

    // if(false===recordInfoNotChange){
        //普通update操作
        // promiseTobeExec.push()
    // }
    let updatedRecord=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue})

    //同步执行
    // await Promise.all(promiseTobeExec)
    return Promise.resolve(updatedRecord)

}
module.exports={
    updateUserFriendGroup_async,
}