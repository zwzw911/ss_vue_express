/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




const fs=require('fs')

const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart//require('../../constant/enum/node').ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method


const e_env=nodeEnum.Env//require('../../constant/enum/node').Env
// const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB


const currentEnv=server_common_file_require.appSetting.currentEnv
// const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine

const e_dbModel=require('../../constant/genEnum/dbModel')
const fkConfig=server_common_file_require.fkConfig.fkConfig//require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
// const e_internal_field=require('../../constant/genEnum/DB_internal_field').Field
// const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model




const controllerError=require('./likeDislike_setting/likeDislike_controllerError').controllerError
const create_async=require('./likeDisLike_logic/create_likeDisLike').createLikeDisLike_async
// const update_async=require('./impeach_logic/update_impeach').updateImpeach_async
// const delete_async=require('./impeach_logic/delete_impeach').deleteImpeach_async
const controllerSetting=require('./likeDislike_setting/likeDislike_setting').setting





//对CRUD（输入参数带有method）操作调用对应的函数
async function article_likeDislike_dispatcher_async({req}){
    //检查格式
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME,tmpResult

    //checkMethod只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantCreate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_LIKE_DISLIKE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoLikeDisLikeCreate
            }
            expectedPart=[e_part.RECORD_INFO]
            tmpResult=await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //tmpResult=await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})

            tmpResult=await create_async({req:req})



            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)

    }
    
    return Promise.resolve({rc:0})
}




/*              记录likeDislike                */
/*async  function createLikeDislike_async(req) {
    let tmpResult, docValue,collName,collNameStatic

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    collName=e_coll.LIKE_DISLIKE
    collNameStatic=e_coll.LIKE_DISLIKE_STATIC
    // userId='598dae560706320f40c0cab1'
// console.log(`userId ====>${userId}`)
    /!*              client数据转换                  *!/
    docValue=req.body.values[e_part.RECORD_INFO]
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

// console.log(`after data convert docvalue==========>${JSON.stringify(docValue)}`)

    /!*                  添加内部产生的client值                  *!/
    let internalValue = {}
    internalValue[e_field.LIKE_DISLIKE.AUTHOR_ID] = userId
    /!*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           *!/
    if (e_env.DEV === currentEnv && Object.keys(internalValue).length > 0) {
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult = controllerHelper.checkInternalValue({
            internalValue: internalValue,
            collInputRule: inputRule[collName],
            collInternalRule: internalInputRule[collName]
        })
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if (tmpResult.rc > 0) {
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue, internalValue)
// console.log(`docValue after internal=========>${JSON.stringify(docValue)}`)
    /!*              外键（article/authorId）是否存在                 *!/
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})

    /!*                  复合unique index检查(用户是否对此文档进行过踩赞)                    *!/
    let condition={}
    condition[e_field.LIKE_DISLIKE.AUTHOR_ID]=docValue[e_field.LIKE_DISLIKE.AUTHOR_ID]
    condition[e_field.LIKE_DISLIKE.ARTICLE_ID]=docValue[e_field.LIKE_DISLIKE.ARTICLE_ID]
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.length>0){
        return Promise.reject(controllerError.alreadyLikeDislike)
    }

    /!*              插入db          *!/
    await common_operation_model.create_returnRecord_async({dbModel: e_dbModel[collName], value: docValue})
    // console.log(`create result is ====>${JSON.stringify(tmpResult)}`)
    /!*          对关联db进行操作               *!/
    let fieldToBePlus1
    if(docValue[e_field.LIKE_DISLIKE.LIKE]){
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.LIKE_TOTAL_NUM
    }else{
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.DISLIKE_TOTAL_NUM
    }
    let articleId=docValue[e_field.LIKE_DISLIKE.ARTICLE_ID]
    tmpResult= await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collNameStatic],id:articleId,updateFieldsValue:{$inc:{[fieldToBePlus1]:1}}})

    return Promise.resolve({rc: 0, msg: tmpResult})
}*/

module.exports={
    article_likeDislike_dispatcher_async,
    // controllerError
}