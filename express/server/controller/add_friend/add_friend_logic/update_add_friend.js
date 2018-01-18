/**
 * Created by ada on 2017/12/25.
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

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const e_hashType=nodeRuntimeEnum.HashType

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
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

const globalConfiguration=server_common_file_require.globalConfiguration

/*      只允许接受STATUS一个字段         */
async function updateAddFriend_async({req,expectedPart}){
    // console.log(`updateUser_async in`)
    // ap.print('req',req.body.values)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

/*    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.CREATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToCreateUser)
    }*/
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是receiver，且状态是为处理，才能修改状态
    // ap.inf('recordId',recordId)
    // ap.inf('userId',userId)
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
        dbModel:e_dbModel.add_friend,
        recordId:recordId,
        ownerFieldName:e_field.ADD_FRIEND.RECEIVER,
        ownerFieldValue:userId,
        additionalCondition:{[e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.UNTREATED}, //添加朋友的记录必须是未被处理
    })
    // ap.inf('tmpResult',tmpResult)
    if(false===tmpResult){
        return Promise.reject(controllerError.notReceiverCantUpdate)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)
    /*/!*******************************************************************************************!/
    /!*                          delete field cant be update from client                        *!/
    /!*******************************************************************************************!/
    //以下字段，CREATE是client输入，但是update时候，无法更改，所以不能存在
    let forbidUpdateFields=[e_field.ADD_FRIEND.RECEIVER]
    for(let singleForbidUpdateField of forbidUpdateFields){
        if(undefined!==docValue && undefined!== docValue[singleForbidUpdateField]){
            return Promise.reject(controllerError.forbidUpdateFieldExist(singleForbidUpdateField))
        }
        if(undefined!==subFieldValue && undefined!== subFieldValue[singleForbidUpdateField]){
            return Promise.reject(controllerError.forbidUpdateFieldExist(singleForbidUpdateField))
        }
    }*/
/*    /!*******************************************************************************************!/
    /!*                 check non-require, but mandatory field for update                       *!/
    /!*******************************************************************************************!/
    //以下字段，虽然定义是非required，但是在update的时候必须存在
    let mandatoryUpdateFields=[e_field.ADD_FRIEND.STATUS]
    for(let singleMandatoryUpdateField of mandatoryUpdateFields){
        if(undefined=== docValue[singleMandatoryUpdateField]){
            return Promise.reject(controllerError.mandatoryFieldNotExist)
        }
    }*/
/*    for(let singleNotAllowUpdateField of notAllowUpdateFields){
        delete docValue[singleNotAllowUpdateField]
    }*/
    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]
    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/
    //在fkConfig中定义的外键检查(fkConfig中设置查询条件)
    if(undefined!==fkConfig[collName]){
        await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    }
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

    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    /*              为防御性措施，因为如果输入为UNTREATED，那么会被认为没有改变的数据而直接返回rc:0      */
    //status必须是reject或者accept
    let allowStatus=[e_addFriendStatus.ACCEPT,e_addFriendStatus.REJECT]
    // ap.print('allowStatus',allowStatus)
    // ap.print('docValue',docValue)
    if(-1===allowStatus.indexOf(docValue[e_field.ADD_FRIEND.STATUS])){
        return Promise.reject(controllerError.statusValueInvalid)
    }
    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        // let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        let additionalCheckCondition
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    Object.assign(docValue,internalValue)

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
    let promiseTobeExec=[]
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
    return Promise.resolve({rc:0})



}

module.exports={
    updateAddFriend_async,
}