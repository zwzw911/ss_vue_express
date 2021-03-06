/**
 * Created by wzhan039 on 2017/9/1.
 */
'use strict'
const ap=require(`awesomeprint`)

/*                      controller setting                */
const controller_setting=require('../admin_setting/admin_setting').setting

const server_common_file_include=require('../../../../server_common_file_require')
const controllerHelper=server_common_file_include.controllerHelper
const dataConvert=server_common_file_include.dataConvert

const nodeEnum=server_common_file_include.nodeEnum
const mongoEnum=server_common_file_include.mongoEnum
// const nodeRuntimeEnum=server_common_file_include.nodeRuntimeEnum

const common_operation_model=server_common_file_include.common_operation_model
// const misc=server_common_file_include.misc
// const gmImage=server_common_file_include.gmImage
// const validateFormat=server_common_file_include.validateFormat

const e_part=nodeEnum.ValidatePart
const e_hashType=server_common_file_include.nodeRuntimeEnum.HashType
const hash=server_common_file_include.crypt.hash
// const e_randomStringType=nodeEnum.RandomStringType
// const e_userState=nodeEnum.UserState
// const e_fileSizeUnit=nodeEnum.fileSizeUnit
// const e_storePathUsage=nodeEnum.StorePathUsage
// const e_gmCommand=nodeRuntimeEnum.GmCommand
// const e_gmGetter=nodeRuntimeEnum.GmGetter

const e_docStatus=mongoEnum.DocStatus.DB
//
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field

// const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
//
//
// const userPhotoConfiguration=server_common_file_include.globalConfiguration.uploadFileDefine.user_thumb
// const captchaIntervalConfiguration=server_common_file_include.globalConfiguration.intervalCheckConfiguration.captcha
// const mailOption=server_common_file_include.globalConfiguration.mailOption

const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

const controllerError=require('../admin_setting/admin_user_controllerError').controllerError


async function login_async({req}){
    /*                              logic                                   */
    /*              略有不同，需要确定字段有且只有账号和密码                */
    // let usedColl=e_coll.USER
    let docValue = req.body.values[e_part.RECORD_INFO]
    /*              参数转为server格式            */
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // dataConvert.constructCreateCriteria(docValue)

    /*              login对输入字段使用update的方式进行检查，但是必须确保只有name和password都被输入           */
    let expectedField = [e_field.ADMIN_USER.NAME, e_field.ADMIN_USER.PASSWORD]
    if(Object.keys(docValue).length!==expectedField.length){
        return Promise.reject(controllerError.loginFieldNumNotExpected)
    }
    for (let singleInputFieldName of expectedField) {
        if (false === singleInputFieldName in docValue) {
            return Promise.reject(controllerError.loginMandatoryFieldNotExist(singleInputFieldName))
        }
    }
// console.log(`converted doc value ${JSON.stringify(docValue)}`)
    /*              判断user是否存在且password正确                      */
//    读取sugar，并和输入的password进行运算，得到的结果进行比较
    //根据姓名查找用户，用户状态为DONE，且没有dDate
    let condition={
        [e_field.ADMIN_USER.NAME]:docValue[e_field.ADMIN_USER.NAME],
        [e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE,
        ['dDate']:{$exists:false},
    }
    let userTmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.admin_user,condition:condition})
    // if(userTmpResult.rc>0){
    //     return Promise.reject(userTmpResult)
    // }
    if(0===userTmpResult.length){
        return Promise.reject(controllerError.accountNotExist)
    }
// console.log(`userTmpResult ${JSON.stringify(userTmpResult)}`)
    condition={userId:userTmpResult[0]['id']}
    let sugarTmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.admin_sugar,condition:condition})
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
        return Promise.reject(controllerError.accountPasswordNotMatch)
    }

    /*
     *  需要设置session，并设lastSignInDate为当前日期
     * */
    // console.log(`userTmpResult.msg[0]['id'] ${JSON.stringify(userTmpResult.msg[0]['id'])}`)
    req.session.userId=userTmpResult[0]['id']
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.admin_user,id:userTmpResult[0]['id'],updateFieldsValue:{'lastSignInDate':Date.now()}})
    return Promise.resolve({rc:0})
}

module.exports={
    login_async,
}