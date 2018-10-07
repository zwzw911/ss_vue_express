/**
 * Created by zhang wei on 2018/3/29.
 */
'use strict'
const ap=require('awesomeprint')

const server_common_file_require=require('../../../../server_common_file_require')
const controllerHelper=server_common_file_require.controllerHelper
const regex=server_common_file_require.regex.regex
const common_operation_model=server_common_file_require.common_operation_model
const e_field=require('../../../constant/genEnum/DB_field').Field

const getUserError=require('../user_setting/user_controllerError').controllerError.getUser

const e_dbModel=require('../../../constant/genEnum/dbModel')
/*  主函数
* */
async function getUser_async({req}){
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo

    /*********************************************/
    /**********        权限检查         *********/
    /*********************************************/
    //如果是获取他人数据
    if(undefined!==req.params.userId){
        userId=req.params.userId
        /****   需要进一步的权限检查，例如，如果是陌生人，只能看名称，如果是朋友，可以看名称账号和头像等**/
    }
// ap.inf('userId',userId)
    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({userId:userId})

    /*********************************************/
    /********        保留指定字段         *******/
    /*********************************************/
    //获取他人信息，保留的字段
    let allowFieldName
    if(undefined!==req.params.userId){
        allowFieldName=[e_field.USER.NAME,e_field.USER.LAST_SIGN_IN_DATE,e_field.USER.ACCOUNT,e_field.USER.PHOTO_DATA_URL]
    }else{
        allowFieldName=[e_field.USER.NAME,e_field.USER.LAST_SIGN_IN_DATE,e_field.USER.ACCOUNT,e_field.USER.PHOTO_DATA_URL]
    }
// ap.inf('before keepFieldInRecord',getRecord)
//     controllerHelper.keepFieldInRecord({record:getRecord,fieldsToBeKeep:allowFieldName})
//     ap.inf('after keepFieldInRecord',getRecord)
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.cryptRecordValue({record:getRecord,salt:tempSalt,collName:userCollName})
    // ap.inf('after cryptRecordValue',getRecord)
    return Promise.resolve({rc:0,msg:getRecord})
}

async function businessLogic_async({userId}){
    // ap.inf('userid',userId)
    let result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.user,id:userId})
    return Promise.resolve(result.toObject())
}




module.exports={
    getUser_async,
    // getOtherUser_async,
}
