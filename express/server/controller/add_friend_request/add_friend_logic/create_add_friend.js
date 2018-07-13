/**
 * Created by ada on 2017/9/1.
 * 记录用户添加朋友的请求
 * 当被请求者做出回应后（拒绝或者同意），设置相应的标志位（如果是同意，还要添加记录到friend_group；如果拒绝，在被添加人的页面上显示此条记录，并提供选项，可以再次同意）
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
const e_addFriendRule=mongoEnum.AddFriendRule.DB
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

const maxAddFriendRequest=server_common_file_require.globalConfiguration.addFriendRequest.max
const defaultGroupName=server_common_file_require.globalConfiguration.userGroupFriend.defaultGroupName.enumFormat
// const common_operation_helper=server_common_file_require.common_operation_helper

/*                      globalConfig                      */
// const userGroupFriend=server_common_file_require.globalConfiguration.userGroupFriend

async  function createAddFriend_async({req,applyRange}){
    // ap.wrn('createAddFriend_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.SINGLE_FIELD]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt,}=userInfo
    // ap.print('docValue',docValue)

    /**     特殊，addFriendRule应该是被添加人的addFriendRule   **/
    let addFriendRule
    //查找被添加用户的信息
    if(undefined!==docValue[e_field.ADD_FRIEND_REQUEST.RECEIVER]){
        tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.user,id:docValue[e_field.ADD_FRIEND_REQUEST.RECEIVER]})
        if(tmpResult===null || tmpResult.length===0){
            return Promise.reject(controllerError.create.receiverNotExist)
        }
    }
    addFriendRule=tmpResult[e_field.USER.ADD_FRIEND_RULE]
    // ap.wrn('addFriendRule',addFriendRule)
    /*************************************************************/
    /***************   业务特定逻辑检查    ***********************/
    /*************************************************************/
    if(addFriendRule===e_addFriendRule.NOONE_ALLOW){
        // ap.wrn('NOONE_ALLOW in')
        return Promise.reject(controllerError.create.addFriendNotAllow)
    }
/*    /!************************************************!/
    /!****     singleField field check      **********!/
    /!************************************************!/
    tmpResult=controllerChecker.ifSingleFieldContainExpectField({singleFieldValue:docValue,expectedFieldNames:[e_field.USER.PHOTO_DATA_URL]})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }*/

    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    // ap.inf('before constructCreateCriteria',docValue)
    dataConvert.constructCreateCriteria(docValue)
    // ap.inf('after constructCreateCriteria',docValue)

    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.inf('用户类型检测 done')



    /*************************************************************/
    /***************   业务特定逻辑检查    ***********************/
    /*************************************************************/
    //不能把自己加为好友
    if(userId.toString()===docValue[e_field.ADD_FRIEND_REQUEST.RECEIVER].toString()){
        return Promise.reject(controllerError.create.cantAddSelfAsFriend)
    }
    //是否已经为好友
    condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:docValue[e_field.ADD_FRIEND_REQUEST.RECEIVER],
        [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:userId,
    }
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})
    if(tmpResult.length>0){
        return Promise.reject(controllerError.create.alreadyFriendCantAddAgain)
    }

    // if(undefined===addFriendRule){
    //     return Promise.reject(controllerError.create.addFriendRuleUndefined)
    // }





    //addFriendRule是否为permit，是的话，需要检查addFriendRequest
    if(addFriendRule===e_addFriendRule.PERMIT_ALLOW){
        // ap.wrn('permit in')
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
            /*** 当前用户是否发出了过多的添加朋友的请求 ***/
            [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_UNTREATED_ADD_FRIEND_REQUEST_PER_USER],userId:userId,containerId:undefined}}},
        }
        await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
        //请求已经存在
        condition={
            [e_field.ADD_FRIEND_REQUEST.ORIGINATOR]:userId,
            [e_field.ADD_FRIEND_REQUEST.RECEIVER]:docValue[e_field.ADD_FRIEND_REQUEST.RECEIVER],

        }
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.add_friend_request,condition:condition})
        // ap.wrn('exist request tmpResult',tmpResult)
        if(tmpResult.length>0){
            //请求已经存在，
            //否则判断decline/acceptTimes是否超出
            if(tmpResult[0][e_field.ADD_FRIEND_REQUEST.ACCEPT_TIMES]>maxAddFriendRequest.maxAcceptTimes){
                return Promise.reject(controllerError.create.acceptTimesExceed)
            }
            if(tmpResult[0][e_field.ADD_FRIEND_REQUEST.DECLINE_TIMES]>maxAddFriendRequest.maxDeclineTimes){
                return Promise.reject(controllerError.create.declineTimesExceed)
            }
            //未被处理，直接返回
            if(tmpResult[0][e_field.ADD_FRIEND_REQUEST.STATUS]===e_addFriendStatus.UNTREATED){
                return {rc:0}
            }
        }

        /*************************************************************/
        /***************   业务处理    *******************************/
        /*************************************************************/
        let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})
// ap.inf('createdRecord',createdRecord)
        /*********************************************/
        /**********      删除指定字段       *********/
        /*********************************************/
        controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
        /*********************************************/
        /**********      加密 敏感数据       *********/
        /*********************************************/
        controllerHelper.cryptRecordValue({record:createdRecord,salt:tempSalt,collName:collName})

        // ap.inf('businessLogic_async done')
        return Promise.resolve({rc:0,msg:'请求已发出'})

        /***    通过COMPOUND_VALUE_UNIQUE，就可以知道是否已经添加过用户，如果添加过，报错退出   ***/
    }

    if(addFriendRule===e_addFriendRule.ANYONE_ALLOW){
        // ap.wrn('ANYONE_ALLOW in')
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
            /*** 当前被请求的用户的朋友数是否超过定义 ***/
            [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_FRIEND_NUM_PER_USER],userId:docValue[e_field.ADD_FRIEND_REQUEST.RECEIVER],containerId:undefined}}},
        }

        await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

        //不创建addFriendRequest，直接添加朋友到默认组：我的朋友
        condition={
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:docValue[e_field.ADD_FRIEND_REQUEST.RECEIVER],
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:defaultGroupName.MyFriend,
        }
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})
        if(tmpResult.length===0){
            return Promise.reject(controllerError.create.userGroupNotFind)
        }
        // ap.wrn('user default group', tmpResult)
        //直接把当前用户加入被请求用户的默认朋友组的列表
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.user_friend_group,id:tmpResult[0]['_id'],updateFieldsValue:{"$push":{[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:userId}}})
        return {rc:0,msg:'添加好友成功'}
    }

}



/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,userId,applyRange}){
    let internalValue={}
    internalValue[e_field.ADD_FRIEND_REQUEST.STATUS]=e_addFriendStatus.UNTREATED
    internalValue[e_field.ADD_FRIEND_REQUEST.ORIGINATOR]=userId
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
// ap.inf('after interval',docValue)
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

    // ap.inf('after compound',docValue)
    /***         数据库操作            ***/
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})

    return Promise.resolve(createdRecord.toObject())
}
module.exports={
    createAddFriend_async,
}