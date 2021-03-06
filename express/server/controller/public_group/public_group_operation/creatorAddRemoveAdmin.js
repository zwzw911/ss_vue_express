/**
 * Created by ada on 2017/9/1.
 * 管理员对群成员操作（同意/拒绝 申请；移除成员）
 * 将preCheck和logic结合在一起（简单操作）
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
const lodash=require('lodash')
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





async function creatorAddRemoveAdmin_async({req}){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    // ap.wrn('creatorAddRemoveAdmin_async in')
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange=false,editSubFieldValueNotChange=false //检测是否需要做update
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let {docValue,recordId,subFieldValue,manipulateArrayValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    let manipulateArrayValue=req.body.values[e_part.MANIPULATE_ARRAY]
    let recordId=req.body.values[e_part.RECORD_ID]


    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    //必须是creator
    // ap.inf('')

    /*********************************************/
    /**********          特定检查        *********/
    /*********************************************/
    let groupRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[collName],id:recordId})
    if(null===groupRecord){
        return Promise.reject(controllerError.creatorAddRemoveAdmin.notFindGroup)
    }
    //删创管理员的操作必须由群创建人处理
    if(groupRecord[e_field.PUBLIC_GROUP.CREATOR_ID].toString()!==userId){
        return Promise.reject(controllerError.creatorAddRemoveAdmin.notCreatorCantAddRemoveAdmin)
    }
    /**     MANIPULATE_ARRAY的输入值检查   **/
    let updateFieldsValue={}
    //需要操作的字段
    if(Object.keys(manipulateArrayValue).length!==1){
        return Promise.reject(controllerError.creatorAddRemoveAdmin.canOnlyContain1Field)
    }
    if(undefined===manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID]){
        return Promise.reject(controllerError.creatorAddRemoveAdmin.missField)
    }
    //ADD/REMOVE字段的值是否有重复
    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD] && undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE]){
        let intersectionArray=lodash.intersection(manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD],manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE])
        if(intersectionArray.length>0){
            return Promise.reject(controllerError.creatorAddRemoveAdmin.cantAddRemoveSameUser)
        }
    }

    //添加的用户必须是群成员，且不为管理员
    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD]){
        for (let singleEle of manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD]){
            if(-1===groupRecord[e_field.PUBLIC_GROUP.MEMBERS_ID].indexOf(singleEle)){
                return Promise.reject(controllerError.creatorAddRemoveAdmin.notPublicGroupMemberCantBeAdmin)

            }
            if(-1!==groupRecord[e_field.PUBLIC_GROUP.ADMINS_ID].indexOf(singleEle)){
                return Promise.reject(controllerError.creatorAddRemoveAdmin.alreadyAdmin)
            }
        }
    }
    //不能删除创建者
    // ap.wrn('groupRecord[e_field.PUBLIC_GROUP.CREATOR_ID]',groupRecord[e_field.PUBLIC_GROUP.CREATOR_ID])
    // ap.wrn('typeof groupRecord[e_field.PUBLIC_GROUP.CREATOR_ID]',typeof groupRecord[e_field.PUBLIC_GROUP.CREATOR_ID])
    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE]){
        // ap.wrn('manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE]',manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE])
        for (let singleEle of manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE]){
            // ap.wrn('singleEle',singleEle)
            // ap.wrn('typeof singleEle',typeof singleEle)
            if(singleEle===groupRecord[e_field.PUBLIC_GROUP.CREATOR_ID].toString()){
                return Promise.reject(controllerError.creatorAddRemoveAdmin.cantDeletePublicGroupCreator)
            }
        }

    }


    //转换成Nosql
    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD]){
        updateFieldsValue['$addToSet']={}
        updateFieldsValue['$addToSet'][e_field.PUBLIC_GROUP.ADMINS_ID]=[]

        //admin_id是否达到上限（无需检测，最多把所有成员都变成管理员）
/*        let defineMaxNumber=globalConfiguration.PublicGroup.max.maxUserPerGroup
        if(groupRecord[e_field.PUBLIC_GROUP.ADMINS_ID].length+manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD].length>=defineMaxNumber){
            return Promise.reject(controllerError.creatorAddRemoveAdmin.groupMemberReachMax)
        }*/
        // updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.ADMINS_ID].concat(manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD])
        updateFieldsValue['$addToSet'][e_field.PUBLIC_GROUP.ADMINS_ID]={'$each':manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD]}
    }
    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE]){
        updateFieldsValue['$pullAll']={}
        updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.ADMINS_ID]=[]
        updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.ADMINS_ID]=updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.ADMINS_ID].concat(manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.REMOVE])
        // updateFieldsValue['$addToSet'][e_field.PUBLIC_GROUP.MEMBERS_ID]={'$each':manipulateArrayValue[e_field.PUBLIC_GROUP.ADMINS_ID][e_manipulateOperator.ADD]}
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
    creatorAddRemoveAdmin_async,
}