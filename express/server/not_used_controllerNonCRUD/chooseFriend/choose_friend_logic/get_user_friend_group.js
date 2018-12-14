/**
 * Created by ada on 2017/9/1.
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
const globalConfiguration=server_common_file_require.globalConfiguration

/**     只获得group信息      **/
async  function getUserFriendGroup_async({req}){

    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // ap.inf('userId',userId)
// console.log(`docValue===> ${JSON.stringify(docValue)}`)
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})


    /**     db操作        **/
    let getRecord=await businessLogicToGetFriendGroup_async({collName:collName,userId:userId})
// ap.inf('getRecord',getRecord)
//     let fieldsToBeKeep=['id','friendGroupName']
    if(getRecord.length>0){
        for(let singleRecord of getRecord){
            /*********************************************/
            /**********      删除指定字段       *********/
            /*********************************************/

            // controllerHelper.keepFieldInRecord({record:singleRecord,fieldsToBeKeep:fieldsToBeKeep})
            /*********************************************/
            /**********      加密 敏感数据       *********/
            /*********************************************/
            controllerHelper.encryptSingleRecord({record:singleRecord,salt:tempSalt,collName:collName})
        }

    }


    // ap.inf('getRecord done',getRecord)
    return Promise.resolve({rc:0,msg:getRecord})


}
async function businessLogicToGetFriendGroup_async({collName,userId}) {
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    let condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId
    }
    // ap.inf('condition',condition)
    // ap.inf('collName',collName)
    let getRecord= await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition,selectedFields:'id friendGroupName'})
    dataConvert.convertDocumentToObject({src:getRecord})

    return Promise.resolve(getRecord)
}


/**     同时获得group以及其中的成员        **/
async  function getUserFriendGroupAndItsMember_async({req}){

    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // ap.inf('userId',userId)
// console.log(`docValue===> ${JSON.stringify(docValue)}`)
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})


    /**     db操作        **/
    let getRecord=await businessLogicToGetFriendGroupAndItsMember_async({collName:collName,userId:userId})
    /*********************************************/
    /********    删除_id(否则和id重复)     *******/
    /*********************************************/
    // 删除_id
    getRecord=JSON.parse(JSON.stringify(getRecord).replace(/"_id":"[0-9a-f]{24}",?/g,''))

    // ap.inf('after replace tmp',tmp)
    // getRecord=JSON.parse(tmp)
    
//     let fieldsToBeKeep=['id','friendGroupName']
    let populateFields={
        [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
            'collName':e_coll.USER,
            'subPopulateFields':undefined,
        }
    }
    if(getRecord.length>0){
        for(let singleRecord of getRecord){
            /*********************************************/
            /**********      删除指定字段       *********/
            /*********************************************/

            // controllerHelper.keepFieldInRecord({record:singleRecord,fieldsToBeKeep:fieldsToBeKeep})
            /*********************************************/
            /**********      加密 敏感数据       *********/
            /*********************************************/

            controllerHelper.encryptSingleRecord({record:singleRecord,salt:tempSalt,collName:collName,populateFields:populateFields})
        }

    }


    // ap.inf('getRecord done',getRecord)
    return Promise.resolve({rc:0,msg:getRecord})


}
async function businessLogicToGetFriendGroupAndItsMember_async({collName,userId}) {
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    let condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,
        [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:{'$nin':globalConfiguration.userGroupFriend.defaultGroupName.enumFormat.BlackList}
    }
    let populateOpt=[{
        'path':`${e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP}`,
        select:` ${e_field.USER.NAME} `, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
        // options:{limit:maxNumber.article.attachmentNumberPerArticle},
    }]
    ap.inf('condition',condition)
    ap.inf('populateOpt',populateOpt)
    let getRecord= await common_operation_model.find_returnRecords_async({
        dbModel:e_dbModel[collName],
        condition:condition,
        selectedFields:`${[e_field.USER_FRIEND_GROUP.ID]} ${[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]} ${[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]}`,
        populateOpt:populateOpt,
    })
    dataConvert.convertDocumentToObject({src:getRecord})

    return Promise.resolve(getRecord)
}


/**     获得group中的成员        **/
async  function getUserFriendGroupMember_async({req}){
// ap.wrn('getUserFriendGroupMember_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    let recordId=req.params['friendGroupId']
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    if(userType===e_allUserType.USER_NORMAL) {
        let result = await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel: e_dbModel.user_friend_group,
            recordId: recordId,
            ownerFieldsName: [e_field.USER_FRIEND_GROUP.OWNER_USER_ID],
            userId: userId,
            additionalCondition: undefined,
        })
        // ap.inf('ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async result',result)
        if (false === result) {
            return Promise.reject(controllerError.create.notOwnerCantGetGroupMember)
        }
    }
    // ap.wrn('getUserFriendGroupMember_async before db check done')
    /**     db操作        **/
    let getRecord=await businessLogicToGetFriendGroupMember_async({collName:collName,userId:userId,recordId:recordId})
    ap.wrn('getUserFriendGroupMember_async  before db op',getRecord)
    /*********************************************/
    /********    删除_id(否则和id重复)     *******/
    /*********************************************/
    // 删除_id
    getRecord=JSON.parse(JSON.stringify(getRecord).replace(/"_id":"[0-9a-f]{24}",?/g,''))
    ap.wrn('getUserFriendGroupMember_async delete _id',getRecord)
    // ap.inf('after replace tmp',tmp)
    // getRecord=JSON.parse(tmp)
    /*********************************************/
    /********    删除（保留）指定字段     *******/
    /*********************************************/
    //id会被查询，即使没有在select field中，所以要去掉
    let fieldsToBeKeep=[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]
    controllerHelper.keepFieldInRecord({record:getRecord,fieldsToBeKeep:fieldsToBeKeep})

    let populateFields={
        [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
            'collName':e_coll.USER,
            'subPopulateFields':undefined,
        }
    }

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/

    controllerHelper.encryptSingleRecord({record:getRecord,salt:tempSalt,collName:collName,populateFields:populateFields})


    // ap.inf('getRecord done',getRecord)
    return Promise.resolve({rc:0,msg:getRecord})


}
async function businessLogicToGetFriendGroupMember_async({collName,userId,recordId}) {
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
/*    let condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,
        [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:{'$nin':globalConfiguration.userGroupFriend.defaultGroupName.enumFormat.BlackList}
    }*/
    let populateOpt=[{
        'path':`${e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP}`,
        select:` ${e_field.USER.NAME} `, //${e_field.ARTICLE_ATTACHMENT.HASH_NAME}是为了防止文件名冲突，导致文件覆盖，无需传递到前端
        // options:{limit:maxNumber.article.attachmentNumberPerArticle},
    }]
    // ap.inf('condition',condition)
    // ap.inf('populateOpt',populateOpt)
    let getRecord= await common_operation_model.findById_returnRecord_async({
        dbModel:e_dbModel[collName],
        id:recordId,
        selectedFields:`${[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]}`, //只需要返回FRIENDS_IN_GROUP即可
        populateOpt:populateOpt,
    })
    dataConvert.convertDocumentToObject({src:getRecord})


    return Promise.resolve(getRecord)
}


module.exports={
    getUserFriendGroup_async,
    getUserFriendGroupAndItsMember_async,
    getUserFriendGroupMember_async,
}