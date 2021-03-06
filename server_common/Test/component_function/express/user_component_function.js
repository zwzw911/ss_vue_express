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
const userAPI=require('../../API/express/user_API')
const commonAPI=require('../../API/common_API')
const db_operation_helper=require('../../db_operation_helper')

/*************************************************************/
/**************        direct function         **************/
/*************************************************************/
const encryptSingleValue=require(`../../../function/assist/crypt`).encryptSingleValue


async function reCreateUser_returnSessUserId_async({userData,app}){
    //删除用户
    // ap.inf('start to del account',userData.account)
    await db_operation_helper.deleteUserAndRelatedInfo_async({account:userData.account,name:userData.name})
    //获得sessionId
    let sess=await userAPI.getFirstSession({app})
    //生成并获得captcha(for create user)
    await userAPI.genCaptcha({sess:sess,app:app})
    let captcha=await userAPI.getCaptcha({sess:sess})
    //建立用户
    await userAPI.createUser_async({userData:userData,captcha:captcha,app:app,sess:sess})

    //生成并获得captcha(for login)
    await userAPI.genCaptcha({sess:sess,app:app})
    captcha=await userAPI.getCaptcha({sess:sess})
    // ap.inf('userDate',userData)
    //登录获得sess
    sess=await userAPI.userLogin_returnSess_async({userData:userData,app:app,captcha:captcha,sess:sess})
    // ap.wrn('userDate',userData)
    //获得userId
    let userId=await db_operation_helper.getUserId_async({userAccount:userData.account})
/*    //获得tempSalt
    let tempSalt=await commonAPI.getTempSalt_async({sess:sess})
    ap.inf('userId',userId)
    ap.inf('tempSalt',tempSalt)
    //模拟加密objectId
    userId=encryptSingleValue({fieldValue:userId,salt:tempSalt}).msg

    ap.inf('crypted userId',userId)*/
    return Promise.resolve({userId:userId,sess:sess})
}

// async function getCaptcha_async({app:app}){
//     let sess=await userAPI.getFirstSession({app})
//     //生成并获得captcha(for create user)
//     await userAPI.genCaptcha({sess:sess,app:app})
//     let captcha=await userAPI.getCaptcha({sess:sess})
//     return Promise.resolve(captcha)
// }
module.exports={
    reCreateUser_returnSessUserId_async,
    // getCaptcha_async,
}