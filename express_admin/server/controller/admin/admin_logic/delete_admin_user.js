/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../admin_setting/admin_setting').setting
const controllerError=require('../admin_setting/admin_user_controllerError').controllerError

const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject


const server_common_file_require=require('../../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const hash=server_common_file_require.crypt.hash

const e_docStatus=server_common_file_require.mongoEnum.DocStatus.DB
const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType
const e_part=server_common_file_require.nodeEnum.ValidatePart
const e_env=nodeEnum.Env

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
    /*                  要更改的记录的owner是否为发出req的用户本身                            */
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId
    let userPriority=userInfo.userPriority
    /*              client数据转换                  */
    let userToBeDeleteId=req.body.values[e_part.RECORD_ID]
    // console.log(`befreo dataConvert`)
/*    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // console.log(`fkConfig[e_coll.USER] ${JSON.stringify(fkConfig[e_coll.USER])}`)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])*/

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]
    /*              当前用户是否有删除用户的权限      */
    let hasDeletePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.DELETE_ADMIN_USER]})
    console.log(`hasDeletePriority===========>${JSON.stringify(hasDeletePriority)}`)
    if(false===hasDeletePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToDeleteUser)
    }

    /*              不能删除的root用户（specific）              */
    let userToBeDelete=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.admin_user,id:userToBeDeleteId})
    if(e_adminUserType.ROOT===userToBeDelete[e_field.ADMIN_USER.USER_TYPE]){
        return Promise.reject(controllerError.cantDeleteRootUserByAPI)
    }
    /*    /!*              如果有更改account，需要几率下来         *!/
     if(undefined!==docValue[e_field.USER.ACCOUNT]){

     }*/

    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel.admin_user,id:userToBeDeleteId,values:{'dDate':Date.now()}})
    return Promise.resolve({rc:0})

}

module.exports={
    deleteUser_async,
}