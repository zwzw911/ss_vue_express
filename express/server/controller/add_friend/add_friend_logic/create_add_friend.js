/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const ap=require(`awesomeprint`)

/*                      controller setting                */
const controller_setting=require('../add_friend_setting/add_friend_setting').setting
const controllerError=require('../add_friend_setting/add_friend_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const enumValue=require(`../../../constant/genEnum/enumValue`)

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
// const e=server_common_file_require.enum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

// const e_hashType=nodeRuntimeEnum.

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_allUserType=mongoEnum.AllUserType.DB


/*                      server common：function                                       */
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash

/*                      server common：other                                       */
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

const common_operation_helper=server_common_file_require.common_operation_helper

/*                      globalConfig                      */
const userGroupFriend=server_common_file_require.globalConfiguration.userGroupFriend
//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createAddFriend_async({req}){
    // console.log(`add friend in`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,condition,option
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
/*    let docValue={
        [e_field.IMPEACH.TITLE]:'新举报',
        [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
    }*/
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority}=userInfo
    // ap.print('docValue',docValue)
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
/*    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.CREATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToCreateUser)
    }*/
    /*******************************************************************************************/
    /*                                     参数转为server格式                                  */
    /*******************************************************************************************/
    dataConvert.constructCreateCriteria(docValue)
    // ap.print('docValue',docValue)
    /*******************************************************************************************/
    /*                                     status设成UNTREATER                                 */
    /*******************************************************************************************/
    docValue[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.UNTREATED
    // ap.print('docValue',docValue)
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/
    //检查‘我的好友’是否已经达到上限
    condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,
        [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend.defaultGroupName.enumFormat.MyFriend,
    }
    // ap.print(`condition`,condition)
    tmpResult=await common_operation_model.find_returnRecords_async({
        dbModel:e_dbModel[e_coll.USER_FRIEND_GROUP],
        condition:condition,
        //selectedFields:[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]
    })
    // ap.print('tmpResult',tmpResult)
    if(0===tmpResult.length){
        return Promise.reject(controllerError.defaultGroupNotExist)
    }
    let count=tmpResult[0][e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP].length
    // ap.print('count',count)
    // ap.print('userGroupFriend.max.maxUserPerDefaultGroup',userGroupFriend.max.maxUserPerDefaultGroup)
    if(count>=userGroupFriend.max.maxUserPerDefaultGroup){
        return Promise.reject(controllerError.defaultGroupNumberExceed)
    }
    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    //在fkConfig中定义的外键检查(fkConfig中设置查询条件)
    if(undefined!==fkConfig[collName]) {
        await controllerChecker.ifFkValueExist_async({
            docValue: docValue,
            collFkConfig: fkConfig[collName],
            collFieldChineseName: e_chineseName[collName]
        })
    }
    // console.log(`========================>fk value done<--------------------------`)
    //自定义外键的检查
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
    // console.log(`========================>enum unique check<--------------------------`)
// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                 因为name是unique，所以要检查用户名是否存在(unique check)                */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        // let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        // await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
    }
    // console.log(`========================>unique check<--------------------------`)
    // console.log(`3`)
// console.log(`ifFieldInDocValueUnique_async done===>`)
    /*******************************************************************************************/
    /*                              检查是否被添加用户已经为friend，或者被拒绝                 */
    /*******************************************************************************************/
    //是否已经添加过此朋友，
    //1. 查找最后（新）一条记录
    condition={
        [e_field.ADD_FRIEND.RECEIVER]:docValue[e_field.ADD_FRIEND.RECEIVER],
        [e_field.ADD_FRIEND.ORIGINATOR]:userId,
        // [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.UNTREATED,
    }
    option={limit:1, sort:{'cDate':'-1'}}
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition,options:option})
    // ap.print('tmpResult',tmpResult)
    //2. 已经向receiver发起过请求
    if(tmpResult.length>0){
        switch (tmpResult[0][e_field.ADD_FRIEND.STATUS]){
            //3. 已经添加，但是尚未被处理，返回rc:0
            case e_addFriendStatus.UNTREATED:
                return Promise.resolve({rc:0})
            //3. 已经添加，且被接受；需要进一步检查user_friend_group中的friend字段，判断receiver是否还未好友（有可能用户已经删除了此好友，想要重新添加）
            case e_addFriendStatus.ACCEPT:
                //检查是否已经为ORIGINATOR的好友（包括黑名单）
                condition={
                    [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,
                    [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:docValue[e_field.ADD_FRIEND.RECEIVER],
                }
                let populateOpt=[
                    {path:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,select:e_field.USER.NAME}
                    ]
                // ap.print('check group friend',tmpResult)
                // ap.print('condition',condition)
                // ap.print('populateOpt',populateOpt)
                tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition,populateOpt:populateOpt})
                // ap.print('tmpResult',tmpResult)
                //是，报错，已经为好友
                if(tmpResult.length>0){
                    return Promise.reject(controllerError.receiverAlreadyBeFriend(tmpResult[0][e_field.USER.NAME]))
                }
                break;
            //3. 已经添加，但被拒绝，直接将状态改成UNTREATED（告知RECEIVER又一次发起了请求）
            case e_addFriendStatus.REJECT:
                ap.print('reject')
                await  common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:tmpResult[0][`_id`],updateFieldsValue:{[e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.UNTREATED}})
                return Promise.resolve({rc:0})
                // break
        }
    }
    /*//1. 未被处理，直接返回
    condition={
        [e_field.ADD_FRIEND.RECEIVER]:docValue[e_field.ADD_FRIEND.RECEIVER],
        [e_field.ADD_FRIEND.ORIGINATOR]:userId,
        [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.UNTREATED,
    }
    ap.print('condition',condition)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    ap.print('tmpResult',tmpResult)
    if(tmpResult.length>0){
        return Promise.resolve({rc:0})
    }
    //2. 已经被接受，返回错误，告知已经接受
    condition={
        [e_field.ADD_FRIEND.RECEIVER]:docValue[e_field.ADD_FRIEND.RECEIVER],
        [e_field.ADD_FRIEND.ORIGINATOR]:userId,
        [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.ACCEPT,
    }
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    //如果有记录，说明已经添加，无需再加
    if(tmpResult.length>0){
        tmpResult=await common_operation_helper.populateSingleDoc_async(tmpResult[0],[{path:[e_field.ADD_FRIEND.RECEIVER],select:[e_field.USER.NAME]}])
        return Promise.reject(controllerError.receiverAlreadyBeFriend(tmpResult[e_field.USER.NAME]))
    }
    //3. 被拒绝，更新记录的status为untreated
    condition={
        [e_field.ADD_FRIEND.RECEIVER]:docValue[e_field.ADD_FRIEND.RECEIVER],
        [e_field.ADD_FRIEND.ORIGINATOR]:userId,
        [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.REJECT,
    }
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    //如果有记录，更改状态为untreated
    if(tmpResult.length>0){
        await  common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:tmpResult[0][`_id`],updateFieldsValue:{[e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.UNTREATED}})
        return Promise.resolve({rc:0})
    }*/
    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    /*//content内容进行XSS检测
    let XssCheckField=[e_field.IMPEACH.TITLE,e_field.IMPEACH.CONTENT]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

    // console.log(`4`)
    //impeachType是否为预定义的一种
    if(-1===Object.values(enumValue.ImpeachType).indexOf(impeachType)){
        return Promise.reject(controllerError.unknownImpeachType)
    }*/
    // console.log(`========================>special check done<--------------------------`)
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.ADD_FRIEND.ORIGINATOR]=userId
    // internalValue[e_field.IMPEACH.CREATOR_ID]=userId
    // console.log(`7`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
// console.log(`========================>internal check  done<--------------------------`)
    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
    //根据compound_unique_field_config中的设置，进行唯一查询
    //如果不唯一，返回已经存在的记录，以便进一步处理
   /* let compoundUniqueCheckResult=await controllerChecker.ifCompoundFiledUnique_returnExistRecord_async({collName:collName,docValue:docValue})
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
    }*/
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    //new impeach插入db
    tmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})
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
    return Promise.resolve({rc:0,msg:tmpResult})
}

module.exports={
    createAddFriend_async,
}