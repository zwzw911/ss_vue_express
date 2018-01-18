/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../penalize_setting/penalize_setting').setting
const controllerError=require('../penalize_setting/penalize_controllerError').controllerError

const ap=require('awesomeprint')

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env
const e_allUserType=mongoEnum.AllUserType.DB

/*                      server common：function                                       */
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const hash=server_common_file_require.crypt.hash

const currentEnv=server_common_file_require.appSetting.currentEnv
// const e_accountType=server_common_file_require.mongoEnum.AccountType.DB

//实际复用 update的dispatch，因为除了recordId还需要额外的recordInfo
async function deletePenalize_async(req){
    // console.log(`deleteUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    // console.log(`data.body==============>${JSON.stringify(req.body)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    /*              client数据转换                  */
    let recordToBeDeleted=req.body.values[e_part.RECORD_ID]
    let docValue=req.body.values[e_part.RECORD_INFO]
    // console.log(`docVlue0 =====>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //检测当前用户是否为adminUser
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.ADMIN_NORMAL,e_allUserType.ADMIN_ROOT]})
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.REVOKE_PENALIZE]})
    // console.log(`hasCreatePriority===>${JSON.stringify(hasCreatePriority)}`)
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToRevokePenalize)
    }
    /*******************************************************************************************/
    /*                                     specific field check                             */
    /*******************************************************************************************/
    //recordinfo中只能并且必须存在单个field:revokeReason
    if(Object.keys(docValue).length!==1){
        return Promise.reject(controllerError.deleteRecordInfoFieldNumIncorrect)
    }
    if(undefined===docValue[e_field.ADMIN_PENALIZE.REVOKE_REASON]){
        return Promise.reject(controllerError.missMandatoryFieldRevokeReason)
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