/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../article_setting/article_setting').setting
const controllerError=require('../article_setting/article_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/***************  rule   ****************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule



const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB

/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

async function updateArticle_async({req,applyRange}){

    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)

    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /********  删除undefined/null字段  ***********/
    /*********************************************/
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.article,
            recordId:recordId,
            ownerFieldsName:[e_field.ARTICLE.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.update.notAuthorCantUpdateArticle)
        }
    }
    /**********************************************/
    /*********    特殊数据处理        ************/
    /*********************************************/
    //更新时，如果原始状态为NEW，且没有输入新状态，那么自动改为“EDITING”
    if(undefined===docValue[e_field.ARTICLE.STATUS] && e_articleStatus.NEW===originalDoc[e_field.ARTICLE.STATUS]){
        docValue[e_field.ARTICLE.STATUS]=e_articleStatus.EDITING
    }

    /**********************************************/
    /*********    是否未做任何更改    ************/
    /*********************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
    // ap.inf('special doen')
    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('commonParam',commonParam)
    let stepParam={
        /******** fk需要检查folder是否为自己 ********/
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //[e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /*****  无需对资源进行检查，因为都是更新操作  ******/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined}}},
    }

    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.inf('inputValueLogicValidCheck_async done')

    /************************************************/
    /***                 是否删除了图片          ****/
    /************************************************/
    //如果content存在，图片检测
    if(undefined!==docValue[e_field.ARTICLE.HTML_CONTENT]){
        // let content=docValue[e_field.ARTICLE.HTML_CONTENT]
        // console.log(`0`)
        // let content=docValue[e_field.ARTICLE.HTML_CONTENT]
        // await controllerHelper.contentXSSCheck_async({content:content,error:controllerError.htmlContentSanityFailed})
        let collConfig={
            collName:e_coll.ARTICLE,  //存储内容（包含图片DOM）的coll名字
            fkFieldName:e_field.ARTICLE.ARTICLE_IMAGES_ID,//coll中，存储图片objectId的字段名
            contentFieldName:e_field.ARTICLE.HTML_CONTENT, //coll中，存储内容的字段名
            ownerFieldName:e_field.ARTICLE.AUTHOR_ID,// coll中，作者的字段名

        }
        // ap.inf('collConfig',collConfig)
        let collImageConfig={
            collName:e_coll.ARTICLE_IMAGE,//实际存储图片的coll名
            fkFieldName:e_field.ARTICLE_IMAGE.ARTICLE_ID, //字段名，记录图片存储在那个coll中
            sizeFieldName:e_field.ARTICLE_IMAGE.SIZE_IN_MB,//字段名，记录图片的size存储在那个field中，以便需要的话，对user_resource_static更新
            imageHashFieldName:e_field.ARTICLE_IMAGE.HASH_NAME, //记录图片hash名字的字段名
            storePathPopulateOpt:[{path:e_field.ARTICLE_IMAGE.PATH_ID,select:e_field.STORE_PATH.PATH}], //需要storePath，以便执行fs.unlink
        }
        // ap.inf('collImageConfig',collImageConfig)
        // ap.inf('content',content)
        // ap.inf('recordId',recordId)
        // ap.inf('resourceRange',e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON)
        // content,recordId,collConfig,collImageConfig,resourceRange
        let {content,deletedFileNum,deletedFileSize}=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:docValue[e_field.ARTICLE.HTML_CONTENT],
            recordId:recordId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
            //resourceRange:e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON, //控制是否需要对user_resource_static进行更新时，使用的resourceType，可以为undefined
        })
        /***    更新article的size和num    ***/
        let updateFieldsValue
        updateFieldsValue={
            "$inc":{
                [e_field.IMPEACH.IMAGES_NUM]:-deletedFileNum,
                [e_field.IMPEACH.IMAGES_SIZE_IN_MB]:-deletedFileSize
            }
        }
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.article,id:recordId,updateFieldsValue:updateFieldsValue})
        /***    更新user_resource_static的size和num    ***/
        await e_dbModel.user_resource_static.update({
            [e_field.USER_RESOURCE_STATIC.USER_ID]:userId,
            [e_field.USER_RESOURCE_STATIC.RESOURCE_RANGE]:e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON,
        },{
            $inc:{
                [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:-deletedFileNum,
                [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:-deletedFileSize,
            }
        })

        docValue[e_field.IMPEACH.CONTENT]=content
    }

    // ap.inf('contentDbDeleteNotExistImage_async done')

    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,applyRange:applyRange})

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.cryptRecordValue({record:updatedRecord,salt:tempSalt,collName:collName})
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})

    //无需返回更新后记录，只需返回操作结果
    return Promise.resolve({rc:0,msg:updatedRecord})



}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,recordId,applyRange}){
    let internalValue={}

    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    if(undefined===docValue){
        docValue=internalValue
    }else{
        Object.assign(docValue,internalValue)
    }
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
    /***         数据库操作            ***/
    let updatedRecord=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue})
    return Promise.resolve(updatedRecord.toObject())
}


module.exports={
    updateArticle_async,
}