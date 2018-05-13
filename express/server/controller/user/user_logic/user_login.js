/**
 * Created by wzhan039 on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controllerError=require('../user_setting/user_controllerError').controllerError
/***************  数据库相关常量   ****************/
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')

const server_common_file_include=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_include.nodeEnum
const e_part=nodeEnum.ValidatePart


const mongoEnum=server_common_file_include.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB

const nodeRuntimeEnum=server_common_file_include.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_userInfoField=nodeRuntimeEnum.UserInfoField
/**************  公共函数   ******************/
const controllerHelper=server_common_file_include.controllerHelper
const dataConvert=server_common_file_include.dataConvert
const common_operation_model=server_common_file_include.common_operation_model
const misc=server_common_file_include.misc
const hash=server_common_file_include.crypt.hash


const user_misc_func=require('./user_misc_func')


async function login_async({req}){
    // ap.inf('login in')
    /*************************************************/
    /************     首先检查captcha     ***********/
    /************************************************/
    await controllerHelper.getCaptchaAndCheck_async({req:req,db:2})
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let docValue = req.body.values[e_part.RECORD_INFO],tmpResult
    /*              参数转为server格式            */
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // dataConvert.constructCreateCriteria(docValue)
    /*              login对输入字段使用update的方式进行检查，但是必须确保只有name和password都被输入           */
    let expectedField = [e_field.USER.ACCOUNT, e_field.USER.PASSWORD]
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
    //首先根据账号（唯一）查找记录是否存在
    //然后，读取sugar，并和输入的password进行运算，得到的结果进行比较
    let condition={
        account:docValue[e_field.USER.ACCOUNT],
        [e_field.USER.DOC_STATUS]:e_docStatus.DONE,
        ['dDate']:{$exists:false},
    }
    let userTmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.user,condition:condition})
// ap.inf('find result',userTmpResult)
    if(0===userTmpResult.length){
        return Promise.reject(controllerError.login.accountNotExist)
    }
// console.log(`userTmpResult ${JSON.stringify(userTmpResult)}`)
    condition={userId:userTmpResult[0]['id']}
    let sugarTmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.sugar,condition:condition})
    /*    if(sugarTmpResult.rc>0){
     return Promise.reject(sugarTmpResult)
     }*/
// console.log(`password ====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
// console.log(`sugar====> ${JSON.stringify(sugarTmpResult[0][e_field.SUGAR.SUGAR])}`)

    let encryptPassword=hash(`${docValue[e_field.USER.PASSWORD]}${sugarTmpResult[0][e_field.SUGAR.SUGAR]}`,e_hashType.SHA256)
// console.log(`encryptPassword======> ${JSON.stringify(encryptPassword)}`)
    if(encryptPassword.rc>0){
        return Promise.reject(encryptPassword)
    }

    // console.log(`user/pwd  ${docValue[e_field.USER.ACCOUNT]}///${encryptPassword.msg}`)
    if(userTmpResult[0][e_field.USER.PASSWORD]!==encryptPassword['msg']){
        return Promise.reject(controllerError.login.accountPasswordNotMatch)
    }

    /*
     *  需要设置session，并设lastSignInDate为当前日期
     * */
    // console.log(`userTmpResult.msg[0]['id'] ${JSON.stringify(userTmpResult.msg[0]['id'])}`)
    let userInfo={}
    userInfo[e_userInfoField.USER_ID]=userTmpResult[0]['id']
    userInfo[e_userInfoField.USER_TYPE]=userTmpResult[0][e_field.USER.USER_TYPE]
    userInfo[e_userInfoField.USER_COLL_NAME]=e_coll.USER
    userInfo[e_userInfoField.TEMP_SALT]=misc.generateRandomString({})
    // ap.inf('data save into redis',userInfo)
    await controllerHelper.setLoginUserInfo_async({req:req,userInfo:userInfo})
    // console.log(`req.session after user login ==============>${JSON.stringify(req.session)}`)
    // if(tmpResult.rc>0){return Promise.reject(tmpResult)}

    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.user,id:userTmpResult[0]['id'],updateFieldsValue:{'lastSignInDate':Date.now()}})
    return Promise.resolve({rc:0})
}

module.exports={
    login_async,
}