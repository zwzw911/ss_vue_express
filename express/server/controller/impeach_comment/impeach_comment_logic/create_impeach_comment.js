/**
 * Created by ada on 2017/9/1.
 */
'use strict'


/*                      controller setting                */
const controller_setting=require('../impeach_comment_setting/impeach_comment_setting').setting
const controllerError=require('../impeach_comment_setting/impeach_comment_controllerError').controllerError

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
const e_documentStatus=mongoEnum.DocumentStatus.DB
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


//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createImpeachComment_async({req}){
    // console.log(`create impeach in`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
/*    let docValue={
        [e_field.IMPEACH.TITLE]:'新举报',
        [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
    }*/
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority}=userInfo
// console.log(`docValue===> ${JSON.stringify(docValue)}`)
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)

    /*******************************************************************************************/
    /*                                     参数转为server格式                                  */
    /*******************************************************************************************/
    dataConvert.constructCreateCriteria(docValue)
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    //在fkConfig中定义的外键检查;外键对应的impeach是没有删除，且没有结束的impeach（fkConfig中设置查询条件）
    if(undefined!==fkConfig[collName]) {
        await controllerChecker.ifFkValueExist_async({
            docValue: docValue,
            collFkConfig: fkConfig[collName],
            collFieldChineseName: e_chineseName[collName]
        })
    }


    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是impeach的创建人
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({dbModel:e_dbModel.impeach,recordId:docValue[e_field.IMPEACH_COMMENT.IMPEACH_ID],ownerFieldName:[e_field.IMPEACH.CREATOR_ID],ownerFieldValue:userId,})
    if(false===tmpResult){
        return Promise.reject(controllerError.notImpeachCreatorCantCreateComment)
    }
    /*******************************************************************************************/
    /*                                  logic part1                                            */
    /*******************************************************************************************/
    //impeach是否处于submit之后的状态（即非 revoke和new状态：revoke由fkCheck检查，所以只要检查非new即可）
    if(tmpResult[e_field.IMPEACH.CURRENT_STATE]===e_impeachState.NEW){
        return Promise.reject(controllerError.impeachNotSubmitNoNeedToAddComment)
    }
    /*******************************************************************************************/
    /*                              检查是否有为完成的doc，以便复用                            */
    /*******************************************************************************************/
    //当前用户，对此impeach是否有未完成的impeachComment
    condition={
        [e_field.IMPEACH_COMMENT.IMPEACH_ID]:docValue[e_field.IMPEACH_COMMENT.IMPEACH_ID],
        [e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]:e_documentStatus.NEW,
        [e_field.IMPEACH_COMMENT.AUTHOR_ID]:userId,
    }
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.impeach_comment,condition:condition})
    //如果有未完成的impeachComment,直接使用
    if(tmpResult.length>0){
        return Promise.resolve({rc:0,msg:tmpResult[0][`_id`]})
    }
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

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
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    //content内容进行XSS检测
    let XssCheckField=[e_field.IMPEACH_COMMENT.CONTENT]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})


    // console.log(`========================>special check done<--------------------------`)
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]=e_documentStatus.NEW
    internalValue[e_field.IMPEACH_COMMENT.AUTHOR_ID]=userId

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

    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    //new impeach插入db
    tmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})

    return Promise.resolve({rc:0,msg:tmpResult[`_id`]})
}

module.exports={
    createImpeachComment_async,
}