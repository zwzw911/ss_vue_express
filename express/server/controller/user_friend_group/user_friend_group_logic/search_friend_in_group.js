/**
 * Created by zhang wei on 2018-10-23.
 * 根据名字搜索 好友（范围限定为好友，而不是所有用户）
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../user_friend_group_setting/user_friend_group_setting').setting
const controllerError=require('../user_friend_group_setting/user_friend_group_controllerError').controllerError

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
const userGroupFriend_Configuration=server_common_file_require.globalConfiguration.userGroupFriend
const maxNum=server_common_file_require.globalConfiguration.maxNumber
/*
* arr_queryParams: 和ifQueryStringAllParamValid中一样，保证每个被使用的param都被检查过
* */
async  function searchFriendInGroup_async({req,arr_queryParams}){

    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // let docValue=req.body.values[e_part.RECORD_INFO]
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
    // dataConvert.constructCreateCriteria(docValue)

    /*/!**********************************************!/
    /!**  CALL FUNCTION:inputValueLogicValidCheck **!/
    /!**********************************************!/
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
        /!**   public group num **!/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_FRIEND_GROUP_NUM_PER_USER],userId:userId,containerId:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})*/



    /**     db操作        **/
    let createdRecord=await businessLogic_async({collName:collName,userId:userId})
// ap.inf('createdRecord',createdRecord)
    let fieldsToDelete=['_id']
    if(createdRecord.length>0){
        for(let singleRecord of createdRecord){
            /*********************************************/
            /**********      删除指定字段       *********/
            /*********************************************/

            controllerHelper.deleteFieldInRecord({record:singleRecord,fieldsToBeDeleted:fieldsToDelete})
            /*********************************************/
            /**********      加密 敏感数据       *********/
            /*********************************************/
            controllerHelper.cryptRecordValue({record:singleRecord,salt:tempSalt,collName:collName})
        }

    }


    // ap.inf('createdRecord done',createdRecord)
    return Promise.resolve({rc:0,msg:createdRecord})


}
async function businessLogic_async({collName,userId,searchUserName}) {

    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    /**     从friend_group中查找朋友  **/
    let condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId
    }
    let populateOpt={
        path:e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP,
        match:{
            [e_field.USER.NAME]:new RegExp(searchUserName,"i"),//采用模糊查询
        },
        // select:`{id:0, ${e_field.ARTICLE_ATTACHMENT.NAME}:1, ${e_field.ARTICLE_ATTACHMENT.HASH_NAME}:1}`,
        select:`${e_field.USER.NAME} `, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
        options:{limit:maxNumber.friend.searchMaxFriend},
    }
    // ap.inf('condition',condition)
    // ap.inf('collName',collName)
    let neededFieldName=`id ${e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME}`
    let createdRecord= await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],selectedFields:neededFieldName,condition:condition})
    dataConvert.convertDocumentToObject({src:createdRecord})
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
    return Promise.resolve(createdRecord)
}
module.exports={
    searchFriendInGroup_async,
}