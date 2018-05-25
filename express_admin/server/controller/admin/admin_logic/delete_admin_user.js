/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controller_setting=require('../admin_setting/admin_setting').setting
const controllerError=require('../admin_setting/admin_user_controllerError').controllerError
/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject


const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const crypt=server_common_file_require.crypt
const inputValueLogicValidCheck_async=server_common_file_require.controllerInputValueLogicCheck.inputValueLogicValidCheck_async
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const hash=server_common_file_require.crypt.hash






// const e_accountType=server_common_file_require.mongoEnum.AccountType.DB

/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function deleteUser_async(req){
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    /*              client数据转换                  */
    let recordId=req.body.values[e_part.RECORD_ID]
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.ADMIN_NORMAL,e_allUserType.ADMIN_ROOT]})
 /*   /!************************************************!/
    /!******   传入的敏感数据（recordId）解密，recordInfo中的objectId在dispatch中解密   ******!/
    /!************************************************!/
    // controllerHelper.decryptRecordValue({record:docValue,collName:collName})
    recordId=crypt.decryptSingleFieldValue({fieldValue:recordId,salt:tempSalt})*/
    /**********************************************/
    /******    当前用户是否有创建用户的权限   ****/
    /*********************************************/
    let hasDeletePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.DELETE_ADMIN_USER]})
    // console.log(`hasDeletePriority===========>${JSON.stringify(hasDeletePriority)}`)
    if(false===hasDeletePriority){
        return Promise.reject(controllerError.delete.currentUserHasNotPriorityToDeleteUser)
    }

    /*              不能删除的root用户（specific）              */
    let userToBeDelete=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.admin_user,id:recordId})
    if(e_adminUserType.ADMIN_ROOT===userToBeDelete[e_field.ADMIN_USER.USER_TYPE]){
        return Promise.reject(controllerError.delete.cantDeleteRootUserByAPI)
    }
    /*    /!*              如果有更改account，需要几率下来         *!/
     if(undefined!==docValue[e_field.USER.ACCOUNT]){

     }*/

    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel.admin_user,id:recordId,values:{'dDate':Date.now()}})
    return Promise.resolve({rc:0})

}

module.exports={
    deleteUser_async,
}