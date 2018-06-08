/**
 * Created by 张伟 on 2018/5/30.
 */
'use strict'
const ap=require('awesomeprint')
/***                    函数              ***/
const commonAPI=require('./API/common_API')
const userComponentFunction=require('./component_function/express/user_component_function')
const adminUserComponentFunction=require('./component_function/express_admin/admin_user_component_function')
const db_operation_helper=require('./db_operation_helper')
/***                    常量              ***/
const testData=require('./testData')

/** 对3个userId进行加密   ***/
async function getUserCryptedUserId_async({app,adminApp}){
    let user1Info,user2Info,user3Info
    let user1Id,user2Id,user3Id,adminRootId
    let user1Sess,user2Sess,user3Sess,adminRootSess
    user1Info = await userComponentFunction.reCreateUser_returnSessUserId_async({
        userData: testData.user.user1,
        app: app
    })
    user1Id = user1Info[`userId`]
    user1Sess = user1Info[`sess`]
    // ap.inf('user1Info',user1Info)
    user2Info = await userComponentFunction.reCreateUser_returnSessUserId_async({
        userData: testData.user.user2,
        app: app
    })
    user2Id = user2Info[`userId`]
    user2Sess = user2Info[`sess`]

    user3Info = await userComponentFunction.reCreateUser_returnSessUserId_async({
        userData: testData.user.user3,
        app: app
    })
    // ap.inf('user3Info',user3Info)
    user3Id = user3Info[`userId`]
    user3Sess = user3Info[`sess`]

    adminRootSess = await adminUserComponentFunction.adminUserLogin_returnSess_async({
        userData: testData.admin_user.adminRoot,
        adminApp: adminApp
    })
    // ap.inf('adminRootSess',adminRootSess)
    adminRootId = await db_operation_helper.getAdminUserId_async({userName: testData.admin_user.adminRoot.name})


    return Promise.resolve({
        user1IdCryptedByUser1:await commonAPI.cryptObjectId_async({objectId:user1Id,sess:user1Sess}),
        user1IdCryptedByUser2:await commonAPI.cryptObjectId_async({objectId:user1Id,sess:user2Sess}),
        user1IdCryptedByUser3:await commonAPI.cryptObjectId_async({objectId:user1Id,sess:user3Sess}),
        user2IdCryptedByUser1:await commonAPI.cryptObjectId_async({objectId:user2Id,sess:user1Sess}),
        user2IdCryptedByUser2:await commonAPI.cryptObjectId_async({objectId:user2Id,sess:user2Sess}),
        user2IdCryptedByUser3:await commonAPI.cryptObjectId_async({objectId:user2Id,sess:user3Sess}),
        user3IdCryptedByUser1:await commonAPI.cryptObjectId_async({objectId:user3Id,sess:user1Sess}),
        user3IdCryptedByUser2:await commonAPI.cryptObjectId_async({objectId:user3Id,sess:user2Sess}),
        user3IdCryptedByUser3:await commonAPI.cryptObjectId_async({objectId:user3Id,sess:user3Sess}),
        user3IdCryptedByAdminRoot:await commonAPI.cryptObjectId_async({objectId:user3Id,sess:adminRootSess}),
        adminRootIdCryptedByUser1:await commonAPI.cryptObjectId_async({objectId:adminRootId,sess:user1Sess}),
        user1Id:user1Id,
        user2Id:user2Id,
        user3Id:user3Id,
        user1Sess:user1Sess,
        user2Sess:user2Sess,
        user3Sess:user3Sess,
        adminRootSess:adminRootSess,
        adminRootId:adminRootId,
    })
}

module.exports={
    getUserCryptedUserId_async,
}