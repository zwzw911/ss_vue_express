/**
 * Created by ada on 2017/9/1.
 */
'use strict'


/*                      controller setting                */
const controller_setting=require('../impeach_setting/impeach_setting').setting
const controllerError=require('../impeach_setting/impeach_controllerError').controllerError

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


//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createImpeach_async({req,impeachType}){
    // console.log(`create impeach in`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult
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
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.CREATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToCreateUser)
    }
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/



    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    //在fkConfig中定义的外键检查
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
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    //content内容进行XSS检测
    let XssCheckField=[e_field.IMPEACH.TITLE,e_field.IMPEACH.CONTENT]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

    // console.log(`4`)
    //impeachType是否为预定义的一种
    if(-1===Object.values(enumValue.ImpeachType).indexOf(impeachType)){
        return Promise.reject(controllerError.unknownImpeachType)
    }
    // console.log(`========================>special check done<--------------------------`)
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.IMPEACH.IMPEACH_TYPE]=impeachType
    internalValue[e_field.IMPEACH.CREATOR_ID]=userId
    //根据被举报的类型（文档还是评论）获得其作者ID
    let impeachedThingId //articleId/comment的id
    let impeachedThingFieldName //impeach中，id位于（article/comment）的那个coll
    let impeachedThingRelatedColl //id对应哪个coll，以便从中获得userId
    let impeachedThingRelatedCollFieldName //id对应哪个coll，其中哪个字段代表userId
    switch (impeachType){
        case e_impeachType.ARTICLE:
            impeachedThingRelatedColl=e_coll.ARTICLE
            impeachedThingRelatedCollFieldName=e_field.ARTICLE.AUTHOR_ID

            impeachedThingFieldName=e_field.IMPEACH.IMPEACHED_ARTICLE_ID
            break;
        case e_impeachType.COMMENT:
            impeachedThingRelatedColl=e_coll.ARTICLE_COMMENT
            impeachedThingRelatedCollFieldName=e_field.ARTICLE_COMMENT.AUTHOR_ID

            impeachedThingFieldName=e_field.IMPEACH.IMPEACHED_COMMENT_ID
            break;
        default:
            return Promise.reject(controllerError.unknownImpeachType)

    }
    impeachedThingId=docValue[impeachedThingFieldName]
    let impeachedRecord=await  common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[impeachedThingRelatedColl],id:impeachedThingId})
    // console.log(`impeachedRecord==========>${JSON.stringify(impeachedRecord)}`)
    if(null===impeachedRecord){
        return Promise.reject(controllerError.impeachObjectNotExist)
    }
    // console.log(`impeachedRecord[impeachedThingRelatedCollFieldName]==》${impeachedRecord[impeachedThingRelatedCollFieldName]}`)
    // console.log(`impeachedRecord[impeachedThingRelatedCollFieldName]==》${impeachedRecord[impeachedThingRelatedCollFieldName].toString()}`)
    internalValue[e_field.IMPEACH.IMPEACHED_USER_ID]=impeachedRecord[impeachedThingRelatedCollFieldName].toString()    //返回mongoose文档，其中每个字段的值都是object，需要手工转换，以便通过OBJECT_ID的测试（字符）

    internalValue[e_field.IMPEACH.CREATOR_ID]=userId
    internalValue[e_field.IMPEACH.CURRENT_STATE]=e_impeachState.NEW
    // console.log(`7`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName]})
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
    //new impeach插入db
    tmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})
// console.log(`create result is ====>${JSON.stringify(tmpResult)}`)

    //插入关联数据（impeach action=create）
    let impeachStateValue={
        [e_field.IMPEACH_ACTION.IMPEACH_ID]:tmpResult['_id'],
        // [e_field.IMPEACH_STATE.OWNER_ID]:userId,
        // [e_field.IMPEACH_STATE.OWNER_COLL]:e_coll.USER,
        [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.CREATE,
        [e_field.IMPEACH_ACTION.CREATOR_ID]:userId,
        [e_field.IMPEACH_ACTION.CREATOR_COLL]:e_coll.USER,
    }
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_action,value:impeachStateValue})
    return Promise.resolve({rc:0,msg:tmpResult})
}

module.exports={
    createImpeach_async,
}