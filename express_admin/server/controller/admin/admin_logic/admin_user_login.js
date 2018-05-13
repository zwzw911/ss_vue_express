/**
 * Created by wzhan039 on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controller_setting=require('../admin_setting/admin_setting').setting
const controllerError=require('../admin_setting/admin_user_controllerError').controllerError
/***************  数据库相关常量   ****************/
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')


const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_userInfoField=nodeRuntimeEnum.UserInfoField

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/**************  公共函数   ******************/
const controllerHelper=server_common_file_require.controllerHelper
const dataConvert=server_common_file_require.dataConvert
const hash=server_common_file_require.crypt.hash
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc


async function login_async({req}){
    /*************************************************/
    /************     首先检查captcha     ***********/
    /************************************************/
    await controllerHelper.getCaptchaAndCheck_async({req:req,db:8})
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let docValue = req.body.values[e_part.RECORD_INFO]


    /*              login对输入字段使用update的方式进行检查，但是必须确保只有name和password都被输入           */
    let expectedField = [e_field.ADMIN_USER.NAME, e_field.ADMIN_USER.PASSWORD]
    if(Object.keys(docValue).length!==expectedField.length){
        return Promise.reject(controllerError.login.loginFieldNumNotExpected)
    }
    for (let singleInputFieldName of expectedField) {
        if (false === singleInputFieldName in docValue) {
            return Promise.reject(controllerError.login.loginMandatoryFieldNotExist(singleInputFieldName))
        }
    }
    /********************************************************/
    /*************          login 过程           ************/
    /********************************************************/
    //首先根据用户名（唯一，admin无需账号）查找记录是否存在，用户状态为DONE，且没有dDate
    //读取sugar，并和输入的password进行运算，得到的结果进行比较
    let condition={
        [e_field.ADMIN_USER.NAME]:docValue[e_field.ADMIN_USER.NAME],
        [e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE,
        ['dDate']:{$exists:false},
    }
    let userTmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.admin_user,condition:condition})
    // console.log(`userTmpResult========>${JSON.stringify(userTmpResult)}`)
    // if(userTmpResult.rc>0){
    //     return Promise.reject(userTmpResult)
    // }
    if(0===userTmpResult.length){
        return Promise.reject(controllerError.login.userNameNotExist)
    }
// console.log(`userTmpResult ${JSON.stringify(userTmpResult)}`)
    condition={userId:userTmpResult[0]['id']}
    let sugarTmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.admin_sugar,condition:condition})
    // console.log(`sugarTmpResult ${JSON.stringify(sugarTmpResult)}`)
    /*    if(sugarTmpResult.rc>0){
     return Promise.reject(sugarTmpResult)
     }*/
// console.log(`password ====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
// console.log(`sugar====> ${JSON.stringify(sugarTmpResult[0][e_field.SUGAR.SUGAR])}`)

    let encryptPassword=hash(`${docValue[e_field.ADMIN_USER.PASSWORD]}${sugarTmpResult[0][e_field.ADMIN_SUGAR.SUGAR]}`,e_hashType.SHA512)
// console.log(`encryptPassword======> ${JSON.stringify(encryptPassword)}`)
    if(encryptPassword.rc>0){
        return Promise.reject(encryptPassword)
    }

    // console.log(`user/pwd  ${docValue[e_field.USER.ACCOUNT]}///${encryptPassword.msg}`)
    if(userTmpResult[0][e_field.ADMIN_USER.PASSWORD]!==encryptPassword['msg']){
        return Promise.reject(controllerError.login.passwordNotMatch)
    }

    /*
     *  需要设置session，并设lastSignInDate为当前日期
     * */
    // console.log(`userTmpResult.msg[0]['id'] ${JSON.stringify(userTmpResult.msg[0]['id'])}`)
    let userInfo={}
    userInfo[e_userInfoField.USER_ID]=userTmpResult[0]['id']
    userInfo[e_userInfoField.USER_TYPE]=userTmpResult[0][e_field.ADMIN_USER.USER_TYPE]
    userInfo[e_userInfoField.USER_COLL_NAME]=e_coll.ADMIN_USER
    userInfo[e_userInfoField.USER_PRIORITY]=userTmpResult[0][e_field.ADMIN_USER.USER_PRIORITY]
    userInfo[e_userInfoField.TEMP_SALT]=misc.generateRandomString({})
    await controllerHelper.setLoginUserInfo_async({req:req,userInfo:userInfo})


    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.admin_user,id:userTmpResult[0]['id'],updateFieldsValue:{'lastSignInDate':Date.now()}})
    return Promise.resolve({rc:0})
}

module.exports={
    login_async,
}