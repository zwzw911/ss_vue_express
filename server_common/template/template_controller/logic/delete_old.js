/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../admin_setting/admin_setting').setting
const controllerError=require('../admin_setting/admin_user_controllerError').controllerError


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

/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function deleteUser_async(req){
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

    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/
    let hasDeletePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userId:userPriority,arr_expectedPriority:[e_adminPriorityType.DELETE_ADMIN_USER]})
    console.log(`hasDeletePriority===========>${JSON.stringify(hasDeletePriority)}`)
    if(false===hasDeletePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToDeleteUser)
    }

    /*              不能删除的root用户（specific）              */
    let userToBeDelete=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.admin_user,id:recordToBeDeleted})
    if(e_adminUserType.ADMIN_ROOT===userToBeDelete[e_field.ADMIN_USER.USER_TYPE]){
        return Promise.reject(controllerError.cantDeleteRootUserByAPI)
    }


    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel.admin_user,id:recordToBeDeleted,values:{'dDate':Date.now()}})
    return Promise.resolve({rc:0})

}

module.exports={
    deleteUser_async,
}