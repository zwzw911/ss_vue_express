/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controllerSetting=require('../penalize_setting/penalize_setting').setting
const controllerError=require('../penalize_setting/penalize_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
/********************  rule   ********************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt
const inputValueLogicValidCheck_async=server_common_file_require.controllerInputValueLogicCheck.inputValueLogicValidCheck_async
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

//实际复用 update的dispatch，因为除了recordId还需要额外的recordInfo
async function deletePenalize_async({req}){
    // console.log(`deleteUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    // console.log(`data.body==============>${JSON.stringify(req.body)}`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    let recordToBeDeleted=req.body.values[e_part.RECORD_ID]
    let docValue=req.body.values[e_part.RECORD_INFO]
    // console.log(`docVlue0 =====>${JSON.stringify(docValue)}`)
/*    /!************************************************!/
    /!******   传入的敏感数据（recordId）解密，recordInfo中的objectId在dispatch中解密   ******!/
    /!************************************************!/
    // controllerHelper.decryptRecordValue({record:docValue,collName:collName})
    recordToBeDeleted=crypt.decryptSingleFieldValue({fieldValue:recordToBeDeleted,salt:tempSalt})*/
    /*********************************************/
    /*************    用户类型检测    ************/
    /*********************************************/
    //检测当前用户是否为adminUser
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.ADMIN_NORMAL,e_allUserType.ADMIN_ROOT]})
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.REVOKE_PENALIZE]})
    // console.log(`hasCreatePriority===>${JSON.stringify(hasCreatePriority)}`)
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.delete.currentUserHasNotPriorityToRevokePenalize)
    }
    /*******************************************************************************************/
    /*                                     specific field check                             */
    /*******************************************************************************************/
    //recordinfo中只能并且必须存在单个field:revokeReason
    if(Object.keys(docValue).length!==1){
        return Promise.reject(controllerError.delete.deleteRecordInfoFieldNumIncorrect)
    }
    if(undefined===docValue[e_field.ADMIN_PENALIZE.REVOKE_REASON]){
        return Promise.reject(controllerError.delete.missMandatoryFieldRevokeReason)
    }
    // console.log(`docVlue======>${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/
    //用户是否为admin
/*    if(userCollName!==e_coll.ADMIN_USER){
        return Promise.reject(controllerError.onlyAdminUserCanRevokePenalize)
    }*/
/*    console.log(`done======>`)
    //用户是否有权撤销处罚
    let hasDeletePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.REVOKE_PENALIZE]})
    // console.log(`hasDeletePriority===========>${JSON.stringify(hasDeletePriority)}`)
    if(false===hasDeletePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToRevokePenalize)
    }*/

    /*******************************************************************************************/
    /*                                       logic: delete                                     */
    /*******************************************************************************************/
    let updateValue={
        'dDate':Date.now(),
        [e_field.ADMIN_PENALIZE.REVOKER_ID]:userId,
    }
    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel.admin_penalize,id:recordToBeDeleted,values:updateValue})
    return Promise.resolve({rc:0})

}

module.exports={
    deletePenalize_async,
}