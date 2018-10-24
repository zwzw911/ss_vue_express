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

const setting=require('../user_setting/user_setting').setting

const e_dbModel=require('../../../constant/genEnum/dbModel')

const dataConvert=server_common_file_require.dataConvert
/*  searchParam: 用来提取查询参数
* */
async function searchUser_async({req,searchParam}){
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    let collName=setting.MAIN_HANDLED_COLL_NAME

    // if(undefined!==req.params['name']){}
    /*********************************************/
    /**********        权限检查         *********/
    /*********************************************/
   /* //如果是获取他人数据
    if(undefined!==req.params.userId){
        userId=req.params.userId
        /!****   需要进一步的权限检查，例如，如果是陌生人，只能看名称，如果是朋友，可以看名称账号和头像等**!/
    }*/
// ap.inf('userId',userId)
    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({req:req,searchParam:searchParam})
// ap.inf('getRecord',getRecord)
    let fieldsToBeDelete=['_id']
    if(getRecord.length>0){
        for(let singleRecord of getRecord){
            /*********************************************/
            /**********      删除指定字段(_id自动出现，需要删除)       *********/
            /*********************************************/

            controllerHelper.deleteFieldInRecord({record:singleRecord,fieldsToBeDeleted:fieldsToBeDelete})
            // ap.inf('after keep', singleRecord)
            /*********************************************/
            /**********      加密 敏感数据       *********/
            /*********************************************/
            controllerHelper.cryptRecordValue({record:singleRecord,salt:tempSalt,collName:collName})
            // ap.inf('after crypt', singleRecord)
        }

    }

    // ap.inf('after cryptRecordValue',getRecord)
    return Promise.resolve({rc:0,msg:getRecord})
}

async function businessLogic_async({req,searchParam}){
    let condition={}
    let paramName
    for(let singleSearchParam of searchParam){
        paramName=singleSearchParam['paramName']
        // ap.wrn('paramName',paramName)
        // ap.wrn('req.query[paramName]',req.query[paramName])
        if(undefined!==req.query[paramName]){
            condition[paramName]=new RegExp(req.query[paramName],"i")
        }
    }
    let neededFieldName=`id ${e_field.USER.NAME} ${e_field.USER.PHOTO_DATA_URL}`//
// ap.inf('condition',condition)
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,selectedFields:neededFieldName,condition:condition})
    // ap.inf('result',result)
    dataConvert.convertDocumentToObject({src:result})
    // ap.inf('after convert result',result)
    return Promise.resolve(result)
}




module.exports={
    searchUser_async,
    // getOtherUser_async,
}
