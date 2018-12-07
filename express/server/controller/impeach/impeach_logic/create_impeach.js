/**
 * Created by ada on 2017/9/1.
 * 和article；类似，
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../impeach_setting/impeach_setting').setting
const controllerError=require('../impeach_setting/impeach_controllerError').controllerError

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
// const e_impeachType=mongoEnum.ImpeachType.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig





async function createImpeachForArticle_async({req,applyRange}){
   return await createImpeach_async({req:req,applyRange:applyRange,impeachType:e_impeachType.ARTICLE})
}

async function createImpeachForComment_async({req,applyRange}){
    return await createImpeach_async({req:req,applyRange:applyRange,impeachType:e_impeachType.COMMENT})
}
//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createImpeach_async({req,applyRange,impeachType}){
    // console.log(`create impeach in`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
// ap.inf('docValue',docValue)
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.inf('用户类型检测 done')


    /**********************************************/
    /***********      特定检查      **************/
    /*********************************************/
    //impeachArticleId/impeachCommentId 不能同时存在
    if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID] && undefined!==docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
        return Promise.reject(controllerError.create.cantImpeachMultiItem)
    }
    //impeachArticleId/impeachCommentId 必须存在一个
    if(undefined===docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID] && undefined===docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
        return Promise.reject(controllerError.create.noImpeachedItem)
    }
    //必须和impeachType匹配
    switch (impeachType){
        case e_impeachType.ARTICLE:
            if(undefined===docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]){
                return Promise.reject(controllerError.create.notSetImpeachedArticle)
            }
            break;
        case e_impeachType.COMMENT:
            if(undefined===docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
                return Promise.reject(controllerError.create.notSetImpeachedComment)
            }
            break;
        default:
            return Promise.reject(controllerError.create.unknownImpeachType)
    }

    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    // ap.inf('before constructCreateCriteria',docValue)
    dataConvert.constructCreateCriteria(docValue)
    
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
        /**   判断 撤销/编辑中/提交但未被处理 的举报数是否超出预订范围 **/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_SIMULTANEOUS_NEW_OR_EDITING_IMPEACH_PER_USER,e_resourceRange.MAX_SIMULTANEOUS_WAIT_FOR_ASSIGN_IMPEACH_PER_USER],userId:userId,containerId:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})


    /**     db操作        **/
    let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange,impeachType:impeachType})
    // ap.inf('createdRecord done',createdRecord)
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.encryptSingleRecord({record:createdRecord,salt:tempSalt,collName:collName})

    // ap.inf('createdRecord done',createdRecord)
    return Promise.resolve({rc:0,msg:createdRecord})
}

async function businessLogic_async({docValue,collName,userId,applyRange,impeachType}){

    /*****************************************************/
    /****            添加internal field，然后检查      ***/
    /******************************************************/
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

    // internalValue[e_field.IMPEACH.CREATOR_ID]=userId
    internalValue[e_field.IMPEACH.CURRENT_STATE]=e_impeachState.NEW
    // console.log(`add internal done`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange})
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
    // ap.inf('docValue',docValue)
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
    // ap.inf('CompoundFiledValueUnique done')
    // ap.inf('collName',collName)
    /*******************************************************************************************/
    /*****                            db operation                                         *****/
    /*******************************************************************************************/
    //new impeach插入db
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})
// console.log(`create result is ====>${JSON.stringify(tmpResult)}`)
//     ap.inf('createdRecord',createdRecord.toObject())
    //插入关联数据（impeach action=create）
    let impeachStateValue={
        [e_field.IMPEACH_ACTION.IMPEACH_ID]:createdRecord['_id'],
        // [e_field.IMPEACH_STATE.OWNER_ID]:userId,
        // [e_field.IMPEACH_STATE.OWNER_COLL]:e_coll.USER,
        [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.CREATE,
        [e_field.IMPEACH_ACTION.CREATOR_ID]:userId,
        [e_field.IMPEACH_ACTION.CREATOR_COLL]:e_coll.USER,
    }
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_action,value:impeachStateValue})

    return Promise.resolve(createdRecord.toObject())
}
module.exports={
    createImpeachForArticle_async,
    createImpeachForComment_async
}