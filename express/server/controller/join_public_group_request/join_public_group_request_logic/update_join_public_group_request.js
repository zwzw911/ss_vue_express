/**
 * Created by ada on 2017/9/1.
 * update实际完成的新建的功能：comment创建后无法更新和删除，以便保留记录
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../join_public_group_request_setting/join_public_group_request_setting').setting
const controllerError=require('../join_public_group_request_setting/join_public_group_request_controllerError').controllerError

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

/****************  特有常量 ********************/
const e_joinPublicGroupHandleResult=mongoEnum.JoinPublicGroupHandleResult.DB

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

async function declineJoinPublicGroupRequest_async({req,applyRange}){
    return await updateJoinPublicGroupRequest_async({req:req,applyRange:applyRange,handleResult:e_joinPublicGroupHandleResult.DECLINE})
}

async function acceptJoinPublicGroupRequest_async({req,applyRange}){
    return await updateJoinPublicGroupRequest_async({req:req,applyRange:applyRange,handleResult:e_joinPublicGroupHandleResult.ACCEPT})
}
/**     update相当于用户提交评论，之后再无机会进行update  **/
async function updateJoinPublicGroupRequest_async({req,applyRange,handleResult}){
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

    /**     无需用户权限，因为创建者无法修改此请求，而是因该判断更改人是否为group的admin成员   **/



/*    /!**********************************************!/
    /!***********    用户权限检测    **************!/
    /!*********************************************!/
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
    }*/
/*    /!**********************************************!/
    /!*********    是否未做任何更改    ************!/
    /!*********************************************!/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }*/



    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('commonParam',commonParam)
    let stepParam={
        /********  ********/
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:false,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:false,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:false,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:false,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //[e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /*****  无需对资源进行检查，因为都是更新操作  ******/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined,resourceProfileRange:undefined,userId:undefined,containerId:undefined}}},
    }

    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    /**********************************************/
    /** 特定检查（当前用户必须是public_group的admin成员）**/
    /*********************************************/
    let publicGroupRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.join_public_group_request,id:recordId})
    let originalDoc=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.public_group,id:publicGroupRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]})
   // ap.wrn('originalDoc',originalDoc)
    if(-1===originalDoc[e_field.PUBLIC_GROUP.ADMINS_ID].indexOf(userId)){
        return Promise.reject(controllerError.update.notPublicGroupAdminMemberCantHandleJoinRequest)
    }



    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,applyRange:applyRange,handleResult:handleResult})

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
async function businessLogic_async({docValue,collName,recordId,applyRange,handleResult}){
    /******************************************/
    /**    添加internal field，然后检查     **/
    /******************************************/
    let internalValue={}
    internalValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]=handleResult
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
    /***        关联操作                ***/
    //如果handleResult是accept，在public_group的membersId中添加成员
    if(handleResult===e_joinPublicGroupHandleResult.ACCEPT){
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:docValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID],updateFieldsValue:{"$push":{[e_field.PUBLIC_GROUP.MEMBERS_ID]:docValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.CREATOR_ID]}}})
    }
    return Promise.resolve(updatedRecord.toObject())
}
module.exports={
    // updateJoinPublicGroupRequest_async,
    declineJoinPublicGroupRequest_async,
    acceptJoinPublicGroupRequest_async,
}