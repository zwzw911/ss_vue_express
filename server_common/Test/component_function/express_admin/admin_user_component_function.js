/**
 * Created by zhang wei on 2018/5/17.
 */
'use strict'
/*************************************************************/
/******************        3rd or lib      ******************/
/*************************************************************/
const request=require('supertest')
const assert=require('assert')
const ap=require(`awesomeprint`)

/*************************************************************/
/******************        API            ******************/
/*************************************************************/
const adminUserAPI=require('../../API/express_admin/admin_user_API')
const commonAPI=require('../../API/common_API')
const db_operation_helper=require('../../db_operation_helper')

/*************************************************************/
/**************        direct function         **************/
/*************************************************************/
const encryptSingleValue=require(`../../../function/assist/crypt`).encryptSingleValue
const generateSugarAndHashPassword=require(`../../../controller/controllerHelper`).generateSugarAndHashPassword
const common_operation_model=require(`../../../model/mongo/operation/common_operation_model`)
const redisOperation=require('../../../model/redis/operation/redis_common_operation')

const e_dbModel=require(`../../../constant/genEnum/dbModel`)

//因为登录需要captcha，所以做成一个函数（包含获得cpatcha，发送captcha）
async function adminUserLogin_returnSess_async({userData,adminApp}){
    // ap.inf('adminUserLogin_returnSess_async in')
    //获得sessionId
    let sess=await adminUserAPI.getFirstAdminSession({adminApp:adminApp})
    ap.inf('sess',sess)
    //生成并获得captcha
    // ap.inf('gen admin cpatcha in')
    await adminUserAPI.genAdminCaptcha({sess:sess,adminApp:adminApp})
    let captcha=await adminUserAPI.getAdminCaptcha({sess:sess})
    ap.inf('captcha',captcha)

    sess=await adminUserAPI.adminUserLogin_returnSess_async({userData:userData,captcha:captcha,sess:sess,adminApp:adminApp})
    return Promise.resolve(sess)
}

/***************    直接获取而无需登录    ***************/
async function getAdminUserSessUserId({userData,adminApp}){
    let adminRootId,adminRootSess
    adminRootSess=await adminUserAPI.adminUserLogin_returnSess_async({userData:userData,adminApp:adminApp})
    adminRootId=await db_operation_helper.getAdminUserId_async({userName:userData.name})
    return Promise.resolve({userId:adminRootId,sess:adminRootSess})
}

//创建admin用户只能通过有权限的admin用户，此处使用adminRootSess
async function reCreateAdminUser_returnSessUserId_async({userData,adminRootSess,adminApp}){
    //删除用户
    await db_operation_helper.deleteAdminUserAndRelatedInfo_async(userData.name)


    //生成并获得captcha(for create user)
    // ap.wrn('adminRootSess',adminRootSess)
    await adminUserAPI.genAdminCaptcha({sess:adminRootSess,adminApp:adminApp})
    // ap.wrn('generate captcha done')
    let captcha=await adminUserAPI.getAdminCaptcha({sess:adminRootSess})
    // ap.wrn('get root captcha done')
    //只能由已经登录的有权限的admin，才能建立用户（而不是可以任意注册）
    await adminUserAPI.createAdminUser_async({userData:userData,sess:adminRootSess,captcha:captcha,adminApp:adminApp})


    let rootSess=await adminUserAPI.getFirstAdminSession({adminApp:adminApp})
    //生成并获得captcha(for user login)
    await adminUserAPI.genAdminCaptcha({sess:rootSess,adminApp:adminApp})
    captcha=await adminUserAPI.getAdminCaptcha({sess:rootSess})
    //登录获得sess
    rootSess=await adminUserAPI.adminUserLogin_returnSess_async({userData:userData,captcha:captcha,adminApp:adminApp,sess:rootSess})
// ap.wrn('userData',userData)
    //获得userId
    let userId=await db_operation_helper.getAdminUserId_async({userName:userData.name})
    // ap.wrn('userId',userId)
    //获得tempSalt
/*    let tempSalt=await commonAPI.getTempSalt_async({sess:rootSess})
    //模拟加密objectId
    userId=encryptSingleValue({fieldValue:userId,salt:tempSalt}).msg*/

    return Promise.resolve({userId:userId,sess:rootSess})
}

/******     重通过操作db，新创建admin root **************/
async function reCreateAdminRoot_async({adminRootData}){
    let adminUser=objectDeepCopy(adminRootData)

    //删除用户
    await db_operation_helper.deleteAdminUserAndRelatedInfo_async(adminRootData.name)

    //创建数据
    let hashResult=generateSugarAndHashPassword({ifUser:false,ifAdminUser:true,password:adminRootData[e_field.ADMIN_USER.PASSWORD]})
    let sugar=hashResult.msg['sugar']
    adminRootData[e_field.ADMIN_USER.PASSWORD]=hashResult.msg['hashedPassword']
    adminRootData[e_field.ADMIN_USER.DOC_STATUS]=e_docStatus.DONE
    adminRootData[e_field.ADMIN_USER.LAST_SIGN_IN_DATE]=Date.now()
    adminRootData[e_field.ADMIN_USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()

    let userResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_user,value:adminRootData})
    let userId=userResult['_id']

    let sugarResult=await  common_operation_model.create_returnRecord_async(({dbModel:e_dbModel.admin_sugar,value:{sugar:sugar,[e_field.ADMIN_SUGAR.USER_ID]:userId}}))
    /*    //获得userId
        let userId=await db_operation_helper.getAdminUserId_async({userName:userData.name})
        //登录获得sess
        let sess=await API_helper.adminUserLogin_returnSess_async({userData:userData,adminApp:adminApp})
        return Promise.resolve({userId:userId,sess:sess})*/
}


module.exports={
    adminUserLogin_returnSess_async,
    getAdminUserSessUserId,
    reCreateAdminUser_returnSessUserId_async,
    reCreateAdminRoot_async,
}