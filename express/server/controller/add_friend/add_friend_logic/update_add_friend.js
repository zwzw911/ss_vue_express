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



async function acceptAddFriend_async({req,expectedPart,applyRange}){
    return await updateAddFriend_async({req:req,expectedPart:expectedPart,addFriendStatus:e_addFriendStatus.ACCEPT_BUT_NOT_ASSIGN,applyRange:applyRange})
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

    /************************************************/
    /***********        转换null字段      **********/
    /************************************************/
    // ap.inf('before constructUpdateCriteria done',docValue)
    dataConvert.constructUpdateCriteria(docValue)
    // ap.inf('after constructUpdateCriteria done',docValue)
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
            dbModel:e_dbModel.add_friend,
            recordId:recordId,
            ownerFieldsName:[e_field.ADD_FRIEND.RECEIVER],
            userId:userId,
            additionalCondition:undefined,//为了显示具体错误，不能设置额外条件{[e_field.ADD_FRIEND.STATUS]:{$in:[e_addFriendStatus.UNTREATED,e_addFriendStatus.DECLINE]}}, //
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
        if(originalDoc[e_field.ADD_FRIEND.STATUS]!==e_addFriendStatus.UNTREATED){
            return Promise.reject(controllerError.update.requestAlreadyBeTreatedCantDeclineAgain)
        }
    }
    //如果被请求者要执行 同意 操作，那么原始请求的状态只能为UNTREATED/REJECT（被请求者拒绝后，又同意）
    if(e_addFriendStatus.ACCEPT_BUT_NOT_ASSIGN===addFriendStatus){
        if(originalDoc[e_field.ADD_FRIEND.STATUS]!==e_addFriendStatus.UNTREATED && originalDoc[e_field.ADD_FRIEND.STATUS]!==e_addFriendStatus.DECLINE){
            return Promise.reject(controllerError.update.requestAlreadyBeAcceptCantAcceptAgain)
        }
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
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.inf('inputValueLogicValidCheck done')
    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,addFriendStatus:addFriendStatus,applyRange:applyRange})

/*    /!*********************************************!/
    /!**********      加密 敏感数据       *********!/
    /!*********************************************!/
    controllerHelper.cryptRecordValue({record:updatedRecord,salt:tempSalt,collName:collName})
    /!*********************************************!/
    /!**********      删除指定字段       *********!/
    /!*********************************************!/
    controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})*/

    //无需返回更新后记录，只需返回操作结果
    return Promise.resolve({rc:0})

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
/*    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    Object.assign(docValue,internalValue)*/

    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
    //根据compound_unique_field_config中的设置，进行唯一查询
    //如果不唯一，返回已经存在的记录，以便进一步处理
    /*let compoundUniqueCheckResult=await controllerChecker.ifCompoundFiledUnique_returnExistRecord_async({collName:collName,docValue:docValue})
    // console.log(`compound field check result===================>${JSON.stringify(compoundUniqueCheckResult)}`)
    //复合字段唯一返回true或者已有的doc
    //有重复值，且重复记录数为1（大于1，已经直接reject）
    if(true!==compoundUniqueCheckResult){
        if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]){
            return Promise.reject(controllerError.articleAlreadyImpeached)
        }
        if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
            return Promise.reject(controllerError.articleCommentAlreadyImpeached)
        }
    }
    ap.print(`docValue`,docValue)*/
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    /*let promiseTobeExec=[]
    //如果用户接受添加朋友的请求，需要同时更新发起申请人的user_friend_group
    if(e_addFriendStatus.ACCEPT===docValue[e_field.ADD_FRIEND.STATUS]){
        let friendGroupCondition={
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:originalDoc[e_field.ADD_FRIEND.ORIGINATOR],
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:globalConfiguration.userGroupFriend.defaultGroupName.enumFormat.MyFriend,
        }
        ap.print(`friendGroupCondition`,friendGroupCondition)
        let friendGroupResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:friendGroupCondition})
        ap.print(`friendGroupResult`,friendGroupResult)
        let friendGroupId=friendGroupResult[0][`_id`]
        // for(let singleRecordId in convertedNoSql){
        promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[e_coll.USER_FRIEND_GROUP],id:friendGroupId,updateFieldsValue:{"$addToSet":{[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:userId}}}))
        // }

    }

    //普通update操作
    promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue}))

    //同步执行
    await Promise.all(promiseTobeExec)
    return Promise.resolve({rc:0})*/



}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,recordId,addFriendStatus,applyRange}){
/*    /!********************************************************!/
    /!*************      define variant        ***************!/
    /!********************************************************!/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})*/
    /********************************************************/
    /*************       生成内部值          ***************/
    /********************************************************/
    let internalValue={}
    internalValue[e_field.ADD_FRIEND.STATUS]=addFriendStatus
    // internalValue[e_field.ADD_FRIEND.ORIGINATOR]=userId
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

    /***         数据库操作            ***/
    let updatedRecord= await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue,updateOption:undefined})

    return Promise.resolve(updatedRecord.toObject())
}

module.exports={
    acceptAddFriend_async,
    declineAddFriend_async,
}