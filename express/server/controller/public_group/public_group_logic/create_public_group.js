/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const ap=require('awesomeprint')

/*                      controller setting                */
const controller_setting=require('../public_group_setting/public_group_setting').setting
const controllerError=require('../public_group_setting/public_group_controllerError').controllerError

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

/*                      configuration                                               */
const publicGroup_Configuration=server_common_file_require.globalConfiguration.PublicGroup

async  function createPublicGroup_async({req,}){
    // console.log(`createPublicGroup_async in`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority}=userInfo
    // let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
// console.log(`docValue===> ${JSON.stringify(docValue)}`)
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    /*******************************************************************************************/
    /*                                     参数转为server格式                                  */
    /*******************************************************************************************/
    dataConvert.constructCreateCriteria(docValue)
    /*******************************************************************************************/
    /*                          delete field cant be create from client                        */
    /*******************************************************************************************/
    //有些字段只能从client进行update，而无法从cleent进行create（create时，ADMINSID内部添加，而MENBERSIS则为空）
    let forbidCreateFields=[e_field.PUBLIC_GROUP.MEMBERS_ID,e_field.PUBLIC_GROUP.ADMINS_ID]
    for(let singleForbidUpdateField of forbidCreateFields){
        if(undefined!== docValue[singleForbidUpdateField]){
            return Promise.reject(controllerError.forbidUpdateFieldExist(singleForbidUpdateField))
        }
    }
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       limitation check                                  */
    /*******************************************************************************************/
    condition={
        [e_field.PUBLIC_GROUP.CREATOR_ID]:userId,
/*        "$or":[
            {[e_field.PUBLIC_GROUP.CREATOR_ID]:userId,},
            {[e_field.PUBLIC_GROUP.ADMINS_ID]:userId,}
            ],*/
    }
    let existPublicGroupNum=await common_operation_model.count_async({dbModel:e_dbModel[collName],condition:condition})
    // ap.print('existPublicGroupNum',existPublicGroupNum)
    // ap.print('userGroupFriend_Configuration.maxUserFriendGroupNum',userGroupFriend_Configuration.max.maxUserFriendGroupNum)
    if(existPublicGroupNum>=publicGroup_Configuration.max.maxPublicGroupNumber){
        return Promise.reject(controllerError.publicGroupNumberExceed)
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
/*    //此处unique是对用户，而非对整个coll
    condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,
        [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:docValue[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]
    }
    tmpResult=await common_operation_model.count_async({dbModel:e_dbModel.user_friend_group,condition:condition})
    if(tmpResult>0){
        return Promise.reject(controllerError.groupNameAlreadyExistCantUpdate)
    }*/

    /*******************************************************************************************/
    /*                              检查是否有为完成的doc，以便复用                            */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    //content内容进行XSS检测
    let XssCheckField=[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})


    // console.log(`========================>special check done<--------------------------`)
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    // internalValue[e_field.USER_FRIEND_GROUP.]=impeachType
    internalValue[e_field.USER_FRIEND_GROUP.OWNER_USER_ID]=userId
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
    let compoundUniqueCheckResult=await controllerChecker.ifCompoundFiledUnique_returnExistRecord_async({collName:collName,docValue:docValue})
    // console.log(`compound field check result===================>${JSON.stringify(compoundUniqueCheckResult)}`)
    //复合字段唯一返回true或者已有的doc
    //有重复值，且重复记录数为1（大于1，已经直接reject）
    if(true!==compoundUniqueCheckResult){
        if(undefined!==docValue[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]){
            return Promise.reject(controllerError.groupNameAlreadyExistCantCreate)
        }
/*        if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
            return Promise.reject(controllerError.articleCommentAlreadyImpeached)
        }*/
    }
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
    createPublicGroup_async,
}