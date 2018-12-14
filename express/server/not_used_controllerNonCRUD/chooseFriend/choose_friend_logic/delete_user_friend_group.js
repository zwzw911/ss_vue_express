/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../user_friend_group_setting/user_friend_group_setting').setting
const controllerError=require('../user_friend_group_setting/user_friend_group_controllerError').controllerError

/**************      rule             *************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')


const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const crypt=server_common_file_require.crypt
/****************  公共常量 ********************/
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_allUserType=mongoEnum.AllUserType.DB

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType
const e_part=server_common_file_require.nodeEnum.ValidatePart

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env

/*************** app配置 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const globalConfiguration=server_common_file_require.globalConfiguration
/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function deleteUserFriendGroup_async({req}){
    // console.log(`deleteUserFriendGroup_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    // console.log(`data.body==============>${JSON.stringify(req.body)}`)
    /**********************************************/
    /***********    define variant      ***********/
    /**********************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    /*              client数据转换                  */
    let recordId=req.body.values[e_part.RECORD_ID]
    /*********************************************/
    /*************    用户类型检测    ************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.print('ifExpectedUserType_async done')
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //作者本身才能删除举报
    let originalDoc
    //1. 创建者本身  2. 无其他用户  才能删除举报
    if(e_allUserType.USER_NORMAL===userType){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel[collName],
            recordId:recordId,
            ownerFieldsName:[e_field.USER_FRIEND_GROUP.OWNER_USER_ID],
            userId:userId,
            additionalCondition:undefined
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.delete.notUserGroupOwnerCantDelete)
        }
    }


    //不能删除默认分组
    let defaultGroupNames=Object.values(globalConfiguration.userGroupFriend.defaultGroupName.enumFormat)
    if(-1!==defaultGroupNames.indexOf(originalDoc[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME])){
        return Promise.reject(controllerError.delete.cantDeleteDefaultGroup)
    }
    //分组中的好友数必须为0
    ap.wrn('originalDoc[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]',originalDoc[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP])
    if(originalDoc[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP].length>0){
        return Promise.reject(controllerError.delete.cantDeleteGroupContainFriend)
    }
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    await common_operation_model.findByIdAndDelete_async({dbModel:e_dbModel.user_friend_group,id:recordId})
    return Promise.resolve({rc:0})

}

module.exports={
    deleteUserFriendGroup_async,
}