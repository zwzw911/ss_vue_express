/**
 * Created by ada on 2017/10/12.
 * 若干函数组成一个完整功能(例如，将db的删除用户，和API中create/login组合，形成一个重建/登录/获得userId的函数)
 */
'use strict'

const API_helper=require('./API_helper')
const db_operation_helper=require('./db_operation_helper')
const e_field=require(`../constant/genEnum/DB_field`).Field
const e_articleStatus=require(`../constant/enum/mongoEnum`).ArticleStatus.DB
const e_docStatus=require(`../constant/enum/mongoEnum`).DocStatus.DB

const e_dbModel=require(`../constant/genEnum/dbModel`)

const generateSugarAndHashPassword=require(`../controller/controllerHelper`).generateSugarAndHashPassword
const common_operation_model=require(`../model/mongo/operation/common_operation_model`)

const objectDeepCopy=require(`../function/assist/misc`).objectDeepCopy


async function reCreateUser_returnSessUserId_async({userData,app}){
    //删除用户
    await db_operation_helper.deleteUserAndRelatedInfo_async({account:userData.account})
    //建立用户
    await API_helper.createUser_async({userData:userData,app:app})
    //获得userId
    let userId=await db_operation_helper.getUserId_async({userAccount:userData.account})
    //登录获得sess
    let sess=await API_helper.userLogin_returnSess_async({userData:userData,app:app})
    return Promise.resolve({userId:userId,sess:sess})
}

async function createArticle_setToFinish_returnArticleId_async({userSess,app}){
    //创建new article
    let recordId=await API_helper.createNewArticle_returnArticleId_async({userSess:userSess,app:app})
    //更新到完成状态
    await API_helper.updateArticle_returnArticleId_async({userSess:userSess,recordId:recordId,values:{[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED},app:app})

    return Promise.resolve(recordId)
}

async function reCreateAdminUser_returnSessUserId_async({userData,rootSess,adminApp}){
    //删除用户
    await db_operation_helper.deleteAdminUserAndRelatedInfo_async(userData.name)

    //建立用户
    await API_helper.createAdminUser_async({userData:userData,sess:rootSess,adminApp:adminApp})
    //获得userId
    let userId=await db_operation_helper.getAdminUserId_async({userName:userData.name})
    //登录获得sess
    let sess=await API_helper.adminUserLogin_returnSess_async({userData:userData,adminApp:adminApp})
    return Promise.resolve({userId:userId,sess:sess})
}


async function reCreateAdminRoot_async({adminRoorData}){
    let adminUser=objectDeepCopy(adminRoorData)

    //删除用户
    await db_operation_helper.deleteAdminUserAndRelatedInfo_async(adminUser.name)

    //创建数据
    let hashResult=generateSugarAndHashPassword({ifUser:false,ifAdminUser:true,password:adminUser[e_field.ADMIN_USER.PASSWORD]})
    let sugar=hashResult.msg['sugar']
    adminUser[e_field.ADMIN_USER.PASSWORD]=hashResult.msg['hashedPassword']
    adminUser[e_field.ADMIN_USER.DOC_STATUS]=e_docStatus.DONE
    adminUser[e_field.ADMIN_USER.LAST_SIGN_IN_DATE]=Date.now()
    adminUser[e_field.ADMIN_USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()

    let userResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_user,value:adminUser})
    let userId=userResult['_id']

    let sugarResult=await  common_operation_model.create_returnRecord_async(({dbModel:e_dbModel.admin_sugar,value:{sugar:sugar,[e_field.ADMIN_SUGAR.USER_ID]:userId}}))
/*    //获得userId
    let userId=await db_operation_helper.getAdminUserId_async({userName:userData.name})
    //登录获得sess
    let sess=await API_helper.adminUserLogin_returnSess_async({userData:userData,adminApp:adminApp})
    return Promise.resolve({userId:userId,sess:sess})*/
}

async function getAdminUserSessUserId({userData,adminApp}){
    let adminRootId,adminRootSess
    adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:userData,adminApp:adminApp})
    adminRootId=await db_operation_helper.getAdminUserId_async({userName:userData.name})
    return Promise.resolve({userId:adminRootId,sess:adminRootSess})
}

module.exports={
    reCreateUser_returnSessUserId_async,
    createArticle_setToFinish_returnArticleId_async,
    reCreateAdminUser_returnSessUserId_async,

    reCreateAdminRoot_async,
    getAdminUserSessUserId,
}