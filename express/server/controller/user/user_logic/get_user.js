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
    let userId=await operationSpecificCheck({req:req})
    // ap.inf('userid',userId)
    let result=await businessOperation({userId:userId})

    await handleResult({result:result})
    return Promise.resolve({rc:0,msg:result})
}

/* 操作特定的检查
* */
async function operationSpecificCheck({req}){
        let origUrl=req.originalUrl
        //1. 如果没有带id，说明是获取自己的信息

            //1.1 获得登录信息（从session中）
        let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
        let {userId,userCollName,userType,userPriority}=userInfo
    // ap.inf('userid',userId)
        if(undefined===userId){
            return Promise.reject(getUser_async.userIdUndefined)
        }
    // ap.inf('regex.objectId.test(userId)',regex.objectId.test(userId))
        if(false===regex.objectId.test(userId)){
            return Promise.reject(getUser_async.userIdFormatIncorrect)
        }


        //2. 如果带id，说明是获取他人的信息
        //2.1 检测是否有权限获得他人信息

        return Promise.resolve(userId)



}

/*  具体的业务操作
* */
async function businessOperation({userId}){
    // ap.inf('userid',userId)
    let result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.user,id:userId})
    return Promise.resolve(result.toObject())
}

/*  对最终的结果进行处理(可能需要删除某些字段，或者加密某些字段。。。)
* */
async function handleResult({result}){
    ap.inf('before result',result)
    //看自己的信息
    let allowFieldName=[e_field.USER.NAME,e_field.USER.LAST_SIGN_IN_DATE,e_field.USER.ACCOUNT,e_field.USER.PHOTO_DATA_URL]
    for(let singleField in result){
        if(-1===allowFieldName.indexOf(singleField)){
            delete result[singleField]
        }
    }
    ap.inf('after result',result)
}


module.exports={
    getUser_async
}
