/**
 * Created by ada on 2017/9/1.
 * update实际完成的新建的功能：comment创建后无法更新和删除，以便保留记录
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../impeach_comment_setting/impeach_comment_setting').setting
const controllerError=require('../impeach_comment_setting/impeach_comment_controllerError').controllerError

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
const e_impeachState=mongoEnum.ImpeachState.DB
const e_documentStatus=mongoEnum.DocumentStatus.DB
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


/**     update相当于用户提交评论，之后再无机会进行update  **/
async function updateImpeachComment_async({req,applyRange}){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
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
    /*******************************************************************************************/
    /**                         通过rule判断是否可以update impeachId                       **/
    /*******************************************************************************************/
/*    //以下字段，CREATE是client输入，但是update时候，无法更改，所以需要删除
    let notAllowUpdateFields=[e_field.IMPEACH_COMMENT.IMPEACH_ID]
    for(let singleNotAllowUpdateField of notAllowUpdateFields){
        delete docValue[singleNotAllowUpdateField]
    }*/

    //然后通过recordId获得impeachId,加入docValue进行判断（impeach是否被删除）
    // console.log(`recordId==========>${recordId}`)
    /**     impeachId 不能更改**/
/*    let recordToBeUpdate=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[collName],id:recordId})
    // console.log(`tmpResult==========>${JSON.stringify(tmpResult)}`)
    if(recordToBeUpdate===null){
        return Promise.reject(controllerError.impeachCommentNotExist)
    }
    docValue[e_field.IMPEACH_COMMENT.IMPEACH_ID]=recordToBeUpdate[e_field.IMPEACH_COMMENT.IMPEACH_ID]*/
    // console.log(`after delete doc==========>${JSON.stringify(docValue)}`)

    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.impeach_comment,
            recordId:recordId,
            ownerFieldsName:[e_field.IMPEACH_COMMENT.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.update.notImpeachCreatorCantUpdateComment)
        }
    }
    /**********************************************/
    /*********    是否未做任何更改    ************/
    /*********************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }

    /**********************************************/
    /** 特定检查（非NEW，无法update）**/
    /*********************************************/
    //comment不运行传统意义上的update。此处update指的新建的update
    if(e_documentStatus.NEW!==originalDoc[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]){
        return Promise.reject(controllerError.update.impeachCommentAlreadyCommitCantBeUpdate)
    }

    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('commonParam',commonParam)
    let stepParam={
        /********  ********/
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
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined,resourceProfileRange:undefined,userId:undefined,containerId:undefined}}},
    }

    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/
    //在fkConfig中定义的外键检查;外键对应的impeach是 没有删除，且没有结束的impeach(fkConfig中设置查询条件)
/*    if(undefined!==fkConfig[collName]) {
        await controllerChecker.ifFkValueExist_async({
            docValue: docValue,
            collFkConfig: fkConfig[collName],
            collFieldChineseName: e_chineseName[collName]
        })
    }*/


    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是impeach comment的创建人，且impeach comment未被删除
/*    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
        dbModel:e_dbModel.impeach_comment,
        recordId:recordId,
        ownerFieldsName:[e_field.IMPEACH_COMMENT.AUTHOR_ID],
        userId:userId,
        additionalCondition:undefined
    })
    if(false===tmpResult){
        return Promise.reject(controllerError.notImpeachCreatorCantUpdateComment)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)*/

    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/
    //此处只允许修改content，所以无需在进行处理（1个字段什么的，直接update就可以了）
    // controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
/*    if(0===Object.keys(docValue).length){
        return {rc:0}
    }*/
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]
    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/


    /*******************************************************************************************/
    /*                                  enum unique check(enum in array)                       */
    /*******************************************************************************************/
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
/*    tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }*/

    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    // console.log(`docValue==============>${JSON.stringify(docValue)}`)
 /*   let XssCheckField=[e_field.IMPEACH_COMMENT.CONTENT]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})*/

    //如果content存在，XSS和图片检测
    let contentContainImage=[e_field.IMPEACH_COMMENT.CONTENT]
    for(let singleContent of contentContainImage){
        if(undefined!==docValue[singleContent]){
            // let xssValue=docValue[singleContent]
            // let content=docValue[e_field.IMPEACH.CONTENT]
            // await controllerHelper.contentXSSCheck_async({content:content,fieldName:e_field.IMPEACH.CONTENT})

            let collConfig={
                collName:e_coll.IMPEACH_COMMENT,  //存储内容（包含图片DOM）的coll名字
                fkFieldName:e_field.IMPEACH_COMMENT.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
                contentFieldName:e_field.IMPEACH_COMMENT.CONTENT, //coll中，存储内容的字段名
                ownerFieldName:e_field.IMPEACH_COMMENT.AUTHOR_ID,// coll中，作者的字段名
            }
            let collImageConfig={
                collName:e_coll.IMPEACH_COMMENT_IMAGE,//实际存储图片的coll名
                fkFieldName:e_field.IMPEACH_COMMENT_IMAGE.IMPEACH_COMMENT_ID, //字段名，记录图片存储在那个coll中
                imageHashFieldName:e_field.IMPEACH_COMMENT_IMAGE.HASH_NAME //记录图片hash名字的字段名
            }
            let {content,deletedFileNum,deletedFileSize}=await controllerHelper.contentDbDeleteNotExistImage_async({
                content:content,
                recordId:recordId,
                collConfig:collConfig,
                collImageConfig:collImageConfig,
            })
            docValue[e_field.IMPEACH_COMMENT.CONTENT]=content

            /***    更新article的size和num    ***/
            let updateFieldsValue
            updateFieldsValue={
                "$inc":{
                    [e_field.IMPEACH.IMAGES_NUM]:-deletedFileNum,
                    [e_field.IMPEACH.IMAGES_SIZE_IN_MB]:-deletedFileSize
                }
            }

            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.article,id:recordId,updateFieldsValue:updateFieldsValue})

            docValue[e_field.IMPEACH_COMMENT.CONTENT]=content
        }
    }


    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,applyRange:applyRange})

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.encryptSingleRecord({record:updatedRecord,salt:tempSalt,collName:collName})
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})

    //无需返回更新后记录，只需返回操作结果
    return Promise.resolve({rc:0,msg:updatedRecord})


    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
/*    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }*/




}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,recordId,applyRange}){
    /******************************************/
    /**    添加internal field，然后检查     **/
    /******************************************/
    let internalValue={}
    internalValue[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]=e_documentStatus.COMMIT
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
    updateImpeachComment_async,
}