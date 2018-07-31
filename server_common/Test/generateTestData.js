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

async function getAdminUserCryptedUserId_async({app,adminRootSess,adminApp}){
    let adminUser1Info,adminUser2Info,adminUser3Info
    let adminUser1Id,adminUser2Id,adminUser3Id
    let adminUser1Sess,adminUser2Sess,adminUser3Sess
    adminUser1Info = await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({
        userData: testData.admin_user.adminUser1,
        adminRootSess:adminRootSess,
        adminApp: adminApp
    })
// ap.wrn('adminUser1Info',adminUser1Info)
    adminUser1Id = adminUser1Info[`userId`]
    adminUser1Sess = adminUser1Info[`sess`]
    // ap.inf('user1Info',user1Info)
    adminUser2Info = await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({
        userData: testData.admin_user.adminUser2,
        adminRootSess:adminRootSess,
        adminApp: adminApp
    })
    // ap.wrn('adminUser2Info',adminUser2Info)
    adminUser2Id = adminUser2Info[`userId`]
    adminUser2Sess = adminUser2Info[`sess`]

    /*adminUser3Info = await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({
        userData: testData.admin_user.adminUser3,
        adminRootSess:adminRootSess,
        adminApp: adminApp
    })
    // ap.wrn('adminUser3Info',adminUser3Info)
    adminUser3Id = adminUser3Info[`userId`]
    adminUser3Sess = adminUser3Info[`sess`]*/

   /* adminRootSess = await adminUserComponentFunction.adminUserLogin_returnSess_async({
        userData: testData.admin_user.adminRoot,
        adminApp: adminApp
    })
    // ap.inf('adminRootSess',adminRootSess)
    adminRootId = await db_operation_helper.getAdminUserId_async({userName: testData.admin_user.adminRoot.name})*/


    return Promise.resolve({
        adminUser1IdCryptedByAdminUser1:await commonAPI.cryptObjectId_async({objectId:adminUser1Id,sess:adminUser1Sess}),
        adminUser1IdCryptedByAdminUser2:await commonAPI.cryptObjectId_async({objectId:adminUser1Id,sess:adminUser2Sess}),
        // adminUser1IdCryptedByUser3:await commonAPI.cryptObjectId_async({objectId:adminUser1Id,sess:adminUser3Sess}),
        adminUser2IdCryptedByAdminUser1:await commonAPI.cryptObjectId_async({objectId:adminUser2Id,sess:adminUser1Sess}),
        adminUser2IdCryptedByAdminUser2:await commonAPI.cryptObjectId_async({objectId:adminUser2Id,sess:adminUser2Sess}),
        // adminUser2IdCryptedByUser3:await commonAPI.cryptObjectId_async({objectId:adminUser2Id,sess:adminUser3Sess}),
       /* adminUser3IdCryptedByUser1:await commonAPI.cryptObjectId_async({objectId:adminUser3Id,sess:adminUser1Sess}),
        adminUser3IdCryptedByUser2:await commonAPI.cryptObjectId_async({objectId:adminUser3Id,sess:adminUser2Sess}),
        adminUser3IdCryptedByUser3:await commonAPI.cryptObjectId_async({objectId:adminUser3Id,sess:adminUser3Sess}),*//*
        adminUser3IdCryptedByAdminRoot:await commonAPI.cryptObjectId_async({objectId:user3Id,sess:adminRootSess}),
        adminRootIdCryptedByUser1:await commonAPI.cryptObjectId_async({objectId:adminRootId,sess:user1Sess}),*/
        adminUser1Id:adminUser1Id,
        adminUser2Id:adminUser2Id,
        // adminUser3Id:adminUser3Id,
        adminUser1Sess:adminUser1Sess,
        adminUser2Sess:adminUser2Sess,
        // adminUser3Sess:adminUser3Sess,
/*        adminRootSess:adminRootSess,
        adminRootId:adminRootId,*/
    })
}

module.exports={
    getUserCryptedUserId_async,
    getAdminUserCryptedUserId_async,
}