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
    /*                                       authorization check                               */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/
    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
/*    //content内容进行XSS检测
    let contentFieldName=e_field.IMPEACH.CONTENT
    if(undefined!==docValue[contentFieldName]){
        let content=docValue[contentFieldName]
        //XSS检查
        await controllerHelper.contentXSSCheck_async({content:content,fieldName:contentFieldName})
        //content中图片和db中的图片比较，决定是否要删除content中DOM，以及是否要删除db中的记录
        /!*
         create中因为没有recordId，所以无法执行contentDbDeleteNotExistImage_async
         同时，create中content为初始化内容，无image，也不必要执行contentDbDeleteNotExistImage_async
         docValue[contentFieldName]=await controllerHelper.contentDbDeleteNotExistImage_async({content:content,recordId:recordId,collConfig:collConfig,collImageConfig:collImageConfig})
         *!/
    }*/

    //impeachType是否为预定义的一种
    if(-1===Object.values(enumValue.ImpeachType).indexOf(impeachType)){
        return Promise.reject(controllerError.unknownImpeachType)
    }
//IMPEACHED_ARTICLE_ID/IMPEACHED_COMMENT_ID2者只能有一个存在
/*    if(undefined===docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID] && undefined===docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
        return Promise.reject(controllerError.noImpeachedObject)
    }
    if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID] && undefined!==docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
        return Promise.reject(controllerError.noImpeachedObject)
    }*/
    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    //在fkConfig中定义的外键检查
    // console.log(`docValue for fk check ================>${JSON.stringify(docValue)}`)
    // console.log(`fkConfig[collName] for fk check ================>${JSON.stringify(fkConfig[collName])}`)
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    // console.log(`2`)
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
// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                 因为name是unique，所以要检查用户名是否存在(unique check)                */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        // let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        // await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
    }
    /*//复合unique index检查(用户是否对此文档/评论进行过impeach)
    let condition={}
    condition[e_field.IMPEACH.CREATOR_ID]=userId
    let oneOfTwoFields=[e_field.IMPEACH.IMPEACHED_ARTICLE_ID,e_field.IMPEACH.IMPEACHED_COMMENT_ID]
    for(let oneField of oneOfTwoFields){
        if(undefined!==docValue[oneField]){
            condition[oneField]=docValue[oneField]
            tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
            if(tmpResult.length>0){
                if(oneField===e_field.IMPEACH.IMPEACHED_ARTICLE_ID){
                    return Promise.reject(controllerError.articleAlreadyImpeached)
                }
                if(oneField===e_field.IMPEACH.IMPEACHED_COMMENT_ID){
                    return Promise.reject(controllerError.articleCommentAlreadyImpeached)
                }
            }
        }
    }*/






// console.log(`compound index check done`)

// console.log(`ifFieldInDocValueUnique_async done===>`)

    // console.log(`preDefined type done`)
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
    // console.log(`impeachedThingId=================>${impeachedThingId}`)
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
    // console.log(`add internal done`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
    // console.log(`docValue==============>${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
    // console.log(`collName===================>${JSON.stringify(collName)}`)
    // console.log(`docValue===================>${JSON.stringify(docValue)}`)
    //复合字段的unique check
    //如果用户删除了之前impeach，实施的是物理删除，所以不会有重复
    //如果检测到重复，那就是真正的重复（已有的记录正在被admin处理，或者已经处理结束）
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
        /*//如果是已经delete，则直接将此doc设成可用，而不是再创建新记录（防止用户恶意删除后再次创建）
         tmpResult[0][`cDate`]=Date.now()
         tmpResult[0][`$unset`]={'dDate':''}
         // console.log(`compound field check result===================>${JSON.stringify(tmpResult)}`)
         //删除关联IMPEACH_ACTION操作,并新创一个CREATE
         await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[e_coll.IMPEACH_ACTION],id:tmpResult[0][`_id`],updateFieldsValue,updateOption})*/
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
    // console.log(`impeach_action tt=======================>${JSON.stringify(tt)}`)
    return Promise.resolve({rc:0,msg:tmpResult})
}

module.exports={
    createImpeach_async,
}