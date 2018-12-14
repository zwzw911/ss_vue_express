/**
 * Created by ada on 2017/12/25.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../add_friend_setting/add_friend_setting').setting
const controllerError=require('../add_friend_setting/add_friend_controllerError').controllerError

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

// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
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

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

const globalConfiguration=server_common_file_require.globalConfiguration

async function acceptAddFriend_async({req,expectedPart,applyRange}){
    return await updateAddFriend_async({req:req,expectedPart:expectedPart,addFriendStatus:e_addFriendStatus.ACCEPT,applyRange:applyRange})
}
async function declineAddFriend_async({req,expectedPart,applyRange}){
    return await updateAddFriend_async({req:req,expectedPart:expectedPart,addFriendStatus:e_addFriendStatus.DECLINE,applyRange:applyRange})
}

async function updateAddFriend_async({req,expectedPart,addFriendStatus,applyRange}){
    // ap.inf(`updateAddFriend_async req.body`,req.body)
    // ap.inf(`updateAddFriend_async addFriendStatus`,addFriendStatus)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
// ap.wrn('updateAddFriend_async recordId',recordId)
//     ap.wrn('updateAddFriend_async userId',userId)
    /*/!************************************************!/
    /!***********        转换null字段      **********!/
    /!************************************************!/
    // ap.inf('before constructUpdateCriteria done',docValue)
    dataConvert.constructUpdateCriteria(docValue)
    // ap.inf('after constructUpdateCriteria done',docValue)*/
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

/*    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.CREATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToCreateUser)
    }*/
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /**********************************************/
    /***   用户权限检测(兼检查记录是否存在)    ****/
    /*********************************************/
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.add_friend_request,
            recordId:recordId,
            ownerFieldsName:[e_field.ADD_FRIEND_REQUEST.RECEIVER],
            userId:userId,
            additionalCondition:undefined,//为了显示具体错误，不能设置额外条件{[e_field.ADD_FRIEND_REQUEST.STATUS]:{$in:[e_addFriendStatus.UNTREATED,e_addFriendStatus.DECLINE]}}, //
        })
        // ap.inf('originalDoc',originalDoc)
        if(false===originalDoc){
            return Promise.reject(controllerError.update.notReceiverCantUpdate)
        }
    }
    /******************************************************************************************/
    /*******   特定逻辑检查(可以在inputValueLogicValidCheck，因为没有recordInfo传入)    ******/
    /*****************************************************************************************/
    //如果被请求者要执行 拒绝 操作，那么原始请求的状态只能为UNTREATED
    if(e_addFriendStatus.DECLINE===addFriendStatus){
        if(originalDoc[e_field.ADD_FRIEND_REQUEST.STATUS]!==e_addFriendStatus.UNTREATED){
            return Promise.reject(controllerError.update.requestAlreadyBeTreatedCantDeclineAgain)
        }
    }
    //如果被请求者要执行 同意 操作，那么原始请求的状态只能为UNTREATED/REJECT（被请求者拒绝后，又同意）
    if(e_addFriendStatus.ACCEPT===addFriendStatus){
        if(originalDoc[e_field.ADD_FRIEND_REQUEST.STATUS]!==e_addFriendStatus.UNTREATED && originalDoc[e_field.ADD_FRIEND_REQUEST.STATUS]!==e_addFriendStatus.DECLINE){
            return Promise.reject(controllerError.update.requestAlreadyBeAcceptCantAcceptAgain)
        }
    }

    /*/!************************************************!/
    /!*** CALL FUNCTION:inputValueLogicValidCheck ****!/
    /!************************************************!/
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
    // ap.inf('inputValueLogicValidCheck done')*/
    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,addFriendStatus:addFriendStatus,applyRange:applyRange})
    // ap.inf('businessLogic_async done')
/*    /!*********************************************!/
    /!**********      加密 敏感数据       *********!/
    /!*********************************************!/
    controllerHelper.encryptSingleRecord({record:updatedRecord,salt:tempSalt,collName:collName})
    /!*********************************************!/
    /!**********      删除指定字段       *********!/
    /!*********************************************!/
    controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})*/

    //无需返回更新后记录，只需返回操作结果
    return Promise.resolve({rc:0})





}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,recordId,addFriendStatus,applyRange}){

    /********************************************************/
    /*************       生成内部值          ***************/
    /********************************************************/
    let internalValue={}
    internalValue[e_field.ADD_FRIEND_REQUEST.STATUS]=addFriendStatus

    // ap.wrn('before checkInternalValue')
    // internalValue[e_field.ADD_FRIEND_REQUEST.ORIGINATOR]=userId
    // internalValue[e_field.IMPEACH.CREATOR_ID]=userId
    // console.log(`7`)
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


    /***         根据处理结果，为accept/declineTimes字段自增            ***/
    if(addFriendStatus===e_addFriendStatus.DECLINE){
        docValue["$inc"]={
            [e_field.ADD_FRIEND_REQUEST.DECLINE_TIMES]:1
        }
    }
    if(addFriendStatus===e_addFriendStatus.ACCEPT){
        docValue["$inc"]={
            [e_field.ADD_FRIEND_REQUEST.ACCEPT_TIMES]:1
        }
    }
    // ap.wrn('docValue',docValue)
    /***         数据库操作            ***/
    let updatedRecord= await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue,updateOption:undefined})

    /**     如果用户接受了request，那么就要自动加入到请求人的“我的好友”中  **/
    let condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:updatedRecord[e_field.ADD_FRIEND_REQUEST.ORIGINATOR],
        [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:globalConfiguration.userGroupFriend.defaultGroupName.enumFormat.MyFriend
    }
    let updateValue={
        '$addToSet':{
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:updatedRecord[e_field.ADD_FRIEND_REQUEST.RECEIVER],
        }
    }
    // ap.wrn('condition',condition)
    // ap.wrn('updateValue',updateValue)
    await common_operation_model.updateDirect_returnRecord_async({dbModel:e_dbModel.user_friend_group,condition:condition,values:updateValue})

    //无需任何返回值
    return Promise.resolve()
}

module.exports={
    acceptAddFriend_async,
    declineAddFriend_async,
}