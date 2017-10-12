/**
 * Created by ada on 2017/10/12.
 * 若干函数组成一个完整功能(例如，将db的删除用户，和API中create/login组合，形成一个重建/登录/获得userId的函数)
 */
'use strict'

const API_helper=require('./API_helper')
const db_operation_helper=require('./db_operation_helper')

async function reCreateUser_returnSessUserId_async(userData,app){
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

module.exports={
    reCreateUser_returnSessUserId_async
}