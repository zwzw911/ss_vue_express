/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../impeach_comment_setting/impeach_comment_setting').setting
const controllerError=require('../impeach_comment_setting/impeach_comment_controllerError').controllerError

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
const e_documentStatus=mongoEnum.DocumentStatus.DB
// const e_impeachType=mongoEnum.ImpeachType.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createImpeachComment_async({req,applyRange}){
    // console.log(`create impeach in`)
    // ap.wrn('createImpeachComment in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,createdRecord
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
/*    let docValue={
        [e_field.IMPEACH.TITLE]:'新举报',
        [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
    }*/
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
// console.log(`docValue===> ${JSON.stringify(docValue)}`)
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)

/*    /!*******************************************************************************************!/
    /!*                                  fk value是否存在                                       *!/
    /!*******************************************************************************************!/
    //在fkConfig中定义的外键检查;外键对应的impeach是没有删除，且没有结束的impeach（fkConfig中设置查询条件）
    if(undefined!==fkConfig[collName]) {
        await controllerChecker.ifFkValueExist_async({
            docValue: docValue,
            collFkConfig: fkConfig[collName],
            collFieldChineseName: e_chineseName[collName]
        })
    }*/



    /**********************************************/
    /***********    用户权限检测(create无需权限检测)    **************/
    /*********************************************/
/*    //当前用户必须是impeach的创建人
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.impeach,
            recordId:docValue[e_field.IMPEACH_COMMENT.IMPEACH_ID],
            ownerFieldsName:[e_field.IMPEACH.CREATOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.create.notImpeachCreatorCantCreateComment)
        }
    }*/
    // ap.wrn('owner check done')
    /**********************************************/
    /***********      特定检查      **************/
    /*********************************************/
/*    //impeach是否处于submit之后的状态（即非 revoke和new状态：revoke由fkCheck检查，所以只要检查非new即可）
    if(tmpResult[e_field.IMPEACH.CURRENT_STATE]===e_impeachState.NEW){
        return Promise.reject(controllerError.impeachNotSubmitNoNeedToAddComment)
    }*/

    //当前用户，对此impeach是否有未完成的impeachComment，以便复用
    condition={
        [e_field.IMPEACH_COMMENT.IMPEACH_ID]:docValue[e_field.IMPEACH_COMMENT.IMPEACH_ID],
        [e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]:e_documentStatus.NEW,
        [e_field.IMPEACH_COMMENT.AUTHOR_ID]:userId,
    }
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.impeach_comment,condition:condition})
    //如果有未完成的impeachComment,直接使用
    if(tmpResult.length>0){

        createdRecord=tmpResult[0].toObject()
        // ap.wrn('can be reuse record',createdRecord)
        // return Promise.resolve({rc:0,msg:tmpResult[0][`_id`]})
    }else{
        // ap.wrn('special check done')
        /**********************************************/
        /**  CALL FUNCTION:inputValueLogicValidCheck **/
        /**********************************************/
        let commonParam={docValue:docValue,userId:userId,collName:collName}
        // ap.inf('userId',userId)
        let stepParam={
            //fk: impeach的state不能为NEW,EDITING或者DONE
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
            [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_COMMENT_PER_IMPEACH_PER_USER],userId:userId,containerId:docValue[e_field.IMPEACH_COMMENT.IMPEACH_ID]}}},
        }
        await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})



        // ap.wrn('inputValueLogicValidCheck_async done')
        /**     db操作        **/
        createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})
    }

    // ap.wrn('createdRecord done',createdRecord)
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.cryptRecordValue({record:createdRecord,salt:tempSalt,collName:collName})

    // ap.inf('createdRecord done',createdRecord)
    return Promise.resolve({rc:0,msg:createdRecord})
    /*/!*******************************************************************************************!/
    /!*                                       resource check                                    *!/
    /!*******************************************************************************************!/

    /!*******************************************************************************************!/
    /!*                                  enum unique check(enum in array)                       *!/
    /!*******************************************************************************************!/
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
    tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    // console.log(`========================>enum unique check<--------------------------`)
// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)

    /!*******************************************************************************************!/
    /!*                 因为name是unique，所以要检查用户名是否存在(unique check)                *!/
    /!*******************************************************************************************!/
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        // let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        // await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
    }
    // console.log(`========================>unique check<--------------------------`)
    // console.log(`3`)
// console.log(`ifFieldInDocValueUnique_async done===>`)

    /!*******************************************************************************************!/
    /!*                                       特定字段的处理（检查）                            *!/
    /!*******************************************************************************************!/
    //content内容进行XSS检测
    let XssCheckField=[e_field.IMPEACH_COMMENT.CONTENT]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

*/
    // console.log(`========================>special check done<--------------------------`)

}

async function businessLogic_async({docValue,collName,userId,applyRange}){
    /*****************************************************/
    /****            添加internal field，然后检查      ***/
    /******************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]=e_documentStatus.NEW
    internalValue[e_field.IMPEACH_COMMENT.AUTHOR_ID]=userId

    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
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
// console.log(`========================>internal check  done<--------------------------`)
    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
    if(undefined!==docValue){
        let compoundFiledValueUniqueCheckAdditionalCheckCondition
        await controllerInputValueLogicCheck.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:compoundFiledValueUniqueCheckAdditionalCheckCondition,
        })
    }
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    //new impeach插入db
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})

    return Promise.resolve(createdRecord.toObject())
}
module.exports={
    createImpeachComment_async,
}