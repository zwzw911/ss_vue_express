/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../user_friend_group_setting/user_friend_group_setting').setting
const controllerError=require('../user_friend_group_setting/user_friend_group_controllerError').controllerError

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
const e_adminUserType=mongoEnum.AdminUserType.DB
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

async function updateUserFriendGroup_async({req}){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.CREATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToCreateUser)
    }
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是impeach comment的创建人，且impeach comment未被删除
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({dbModel:e_dbModel.impeach_comment,recordId:recordId,ownerFieldName:e_field.IMPEACH_COMMENT.AUTHOR_ID,ownerFieldValue:userId,additionalCondition:undefined})
    if(false===tmpResult){
        return Promise.reject(controllerError.notImpeachCreatorCantUpdateComment)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)
    /*******************************************************************************************/
    /*                          delete field cant be update from client                        */
    /*******************************************************************************************/
    //以下字段，CREATE是client输入，但是update时候，无法更改，所以需要删除
    let notAllowUpdateFields=[e_field.IMPEACH.IMPEACHED_ARTICLE_ID,e_field.IMPEACH.IMPEACHED_COMMENT_ID,e_field.IMPEACH.CURRENT_STATE]
    for(let singleNotAllowUpdateField of notAllowUpdateFields){
        delete docValue[singleNotAllowUpdateField]
    }
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
    let XssCheckField=[e_field.IMPEACH.TITLE,e_field.IMPEACH.CONTENT]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

    //如果content存在，XSS和图片检测
    if(undefined!==docValue[e_field.IMPEACH.CONTENT]){
        let content=docValue[e_field.IMPEACH.CONTENT]
        // let content=docValue[e_field.IMPEACH.CONTENT]
        // await controllerHelper.contentXSSCheck_async({content:content,fieldName:e_field.IMPEACH.CONTENT})

        let collConfig={
            collName:e_coll.IMPEACH,  //存储内容（包含图片DOM）的coll名字
            fkFieldName:e_field.IMPEACH.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
            contentFieldName:e_field.IMPEACH.CONTENT, //coll中，存储内容的字段名
            ownerFieldName:e_field.IMPEACH.CREATOR_ID,// coll中，作者的字段名
        }
        let collImageConfig={
            collName:e_coll.IMPEACH_IMAGE,//实际存储图片的coll名
            fkFieldName:e_field.IMPEACH_IMAGE.REFERENCE_ID, //字段名，记录图片存储在那个coll中
            imageHashFieldName:e_field.IMPEACH_IMAGE.HASH_NAME //记录图片hash名字的字段名
        }
        docValue[e_field.IMPEACH.CONTENT]=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:content,
            recordId:recordId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
        })
    }
    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[e_coll.ARTICLE]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    Object.assign(docValue,internalValue)
    /*******************************************************************************************/
    /*                                          unique check                                   */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
        //await controllerHelper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue,e_uniqueField:e_uniqueField,e_chineseName:e_chineseName})
    }
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
        if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]){
            return Promise.reject(controllerError.articleAlreadyImpeached)
        }
        if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
            return Promise.reject(controllerError.articleCommentAlreadyImpeached)
        }
    }
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    // await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,values:docValue})
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue})
    return Promise.resolve({rc:0})


}

module.exports={
    updateUserFriendGroup_async,
}