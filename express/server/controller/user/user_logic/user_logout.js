/**
 * Created by 张伟 on 2018/4/23.
 * 用户退出后，需要重新设置ressionId，已经其中的tempSalt
 */
'use strict'
const ap=require('awesomeprint')
const controllerError=require('../user_setting/user_controllerError').controllerError
const server_common_file_include=require('../../../../server_common_file_require')
const misc=server_common_file_include.misc

const nodeRuntimeEnum=server_common_file_include.nodeRuntimeEnum
// const e_hashType=nodeRuntimeEnum.HashType
const e_userInfoField=nodeRuntimeEnum.UserInfoField

async function logout_async({req}){
    return new Promise(function(resolve, reject){
        if(req.session.userInfo){
            let newUserInfo={}
            newUserInfo[e_userInfoField.TEMP_SALT]=misc.generateRandomString({})
            req.session.regenerate(function(err){
                if(err){
                    reject(controllerError.logout.destroySessionFailed)
                }
                req.session.userInfo=newUserInfo
                // resolve()
                resolve({rc:0})
            })

        }
    })
}

module.exports={
    logout_async,
}