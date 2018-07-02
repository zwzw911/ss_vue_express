/**
 * Created by ada on 2017/9/1.
 * 管理员对群成员操作（移除成员）
 * 将preCheck和logic结合在一起（简单操作）
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../public_group_setting/public_group_setting').setting
const controllerError=require('../public_group_setting/public_group_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/***************  rule   ****************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule



const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_manipulateOperator=nodeEnum.ManipulateOperator

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_documentStatus=mongoEnum.DocumentStatus.DB


/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt
const array=server_common_file_require.array

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig





async function removeMember_async({req}){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange=false,editSubFieldValueNotChange=false //检测是否需要做update
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let {docValue,recordId,subFieldValue,manipulateArrayValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    let manipulateArrayValue=req.body.values[e_part.MANIPULATE_ARRAY]
    let recordId=req.body.values[e_part.RECORD_ID]

    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /*********************************************/
    /**********          特定检查        *********/
    /*********************************************/
    //需要进行成员删除的publicGroup必须存在
    let groupRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[collName],id:recordId})
    if(null===groupRecord){
        return Promise.reject(controllerError.adminRemoveMember.notFindGroup)
    }
    //当前用户为管理员
    if(-1===groupRecord[e_field.PUBLIC_GROUP.ADMINS_ID].indexOf(userId)){
        return Promise.reject(controllerError.adminRemoveMember.notAdminCantRemoveMember)
    }
    /**     MANIPULATE_ARRAY的输入值检查   **/
    let updateFieldsValue={}
    //需要操作的字段
    if(Object.keys(manipulateArrayValue).length!==1){
        return Promise.reject(controllerError.adminRemoveMember.canOnlyContain1Field)
    }
    if(undefined===manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID]){
        return Promise.reject(controllerError.adminRemoveMember.missField)
    }
    //只有ke=>remove才能存在
    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.ADD]){
        return Promise.reject(controllerError.adminRemoveMember.wrongKeyExist)
    }
    if(undefined===manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.REMOVE]){
        return Promise.reject(controllerError.adminRemoveMember.missMandatoryKey)
    }
    //只能删除普通用户，admin用户需要creator才能进行
    // ap.wrn('manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.REMOVE]',manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.REMOVE])
    // ap.wrn('mgroupRecord[e_field.PUBLIC_GROUP.ADMINS_ID]',groupRecord[e_field.PUBLIC_GROUP.ADMINS_ID])
    for(let singleMember of manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.REMOVE]){
        if(-1!==groupRecord[e_field.PUBLIC_GROUP.ADMINS_ID].indexOf(singleMember)){
            return Promise.reject(controllerError.adminRemoveMember.cantRemoveAdmin)
        }
    }
    //REMOVE中不能有重复值
    if(true===array.ifArrayHasDuplicate(manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.REMOVE])){
        return Promise.reject(controllerError.adminRemoveMember.removeMemberDuplicate)
    }
    //转换成NoSql
    updateFieldsValue['$pullAll']={}
    updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.MEMBERS_ID]=[]

    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.REMOVE]){
        updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.MEMBERS_ID]=updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.MEMBERS_ID].concat(manipulateArrayValue[e_field.PUBLIC_GROUP.MEMBERS_ID][e_manipulateOperator.REMOVE])
        // updateFieldsValue['$addToSet'][e_field.PUBLIC_GROUP.MEMBERS_ID]={'$each':manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD]}
    }




    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    // await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,values:docValue})
    let promiseTobeExec=[]

    //普通update操作
    promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({
        dbModel: e_dbModel[collName],
        id: recordId,
        updateFieldsValue: updateFieldsValue
    }))
    
    //同步执行
    await Promise.all(promiseTobeExec)
    return Promise.resolve({rc:0})


}

module.exports={
    removeMember_async,
}