/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controllerError=require('../impeach_setting/impeach_controllerError').controllerError
const controllerSetting=require('../impeach_setting/impeach_setting').setting

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




async function deleteImpeach_async({req:req}){
    // console.log(`deleteImpeach_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    // console.log(`data.body==============>${JSON.stringify(req.body)}`)
    /**********************************************/
    /***********    define variant      ***********/
    /**********************************************/
    let tmpResult,collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    /*              client数据转换                  */
    let recordId=req.body.values[e_part.RECORD_ID]

    /*********************************************/
    /*************    用户类型检测    ************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    /*    /!*********************************************!/
        /!************    解密recordId    ************!/
        /!*********************************************!/
        recordId=crypt.encryptSingleValue({fieldValue:recordId,salt:tempSalt})
        if(false===regex.objectId.test(recordId)){
            return Promise.reject(controllerError.delete.inValidFolderId)
        }*/
    // ap.wrn('0')
    /*******************************************************************************************/
    /****************  当前用户为普通用户，检测是否为recordId对应的创建者    *******************/
    /*******************************************************************************************/
    if(e_allUserType.USER_NORMAL===userType){
        tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel[collName],
            recordId:recordId,
            ownerFieldsName:[e_field.IMPEACH.CREATOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===tmpResult){
            return Promise.reject(controllerError.delete.notCreatorCantDeleteImpeach)
        }
    }
// ap.wrn('1')
    /*********************************************/
    /************    删除的前提条件    ***********/
    /*********************************************/
    //举报必须没有admin参与，否则无法删除
    let condition={}
    let enumValue=require('../../../constant/genEnum/enumValue')
    condition[e_field.IMPEACH_ACTION.IMPEACH_ID]=recordId
    condition[e_field.IMPEACH_ACTION.ACTION]={'$in':enumValue.ImpeachAdminAction}
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[e_coll.IMPEACH_ACTION],condition:condition})
    if(tmpResult.length>0){
        return Promise.reject(controllerError.delete.impeachAlreadyHandledByAdmin)
    }
    /*******************************************************************************************/
    /*                                       state         check                               */
    /*******************************************************************************************/
    //未进入处理流程的impeach才能被删除
    // ap.wrn('2')

    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    //未被提交过的impeach会被连同action一起删除（因为为提交的impeach无保存价值）
    //逻辑删除impeach（以便统计用户是否恶意创删impeach）
    await common_operation_model.findByIdAndDelete_async({dbModel:e_dbModel[collName],id:recordId})
    //物理删除impeach_action(action不用保存)
    await common_operation_model.deleteMany_async({dbModel:e_dbModel.impeach_action,condition:{[e_field.IMPEACH_ACTION.IMPEACH_ID]:recordId}})
    return Promise.resolve({rc:0})

}

module.exports={
    deleteImpeach_async,
}