/**
 * Created by 张伟 on 2018/4/23.
 */
'use strict'
const controllerError=require('../user_setting/user_controllerError').controllerError

const ap=require('awesomeprint')
async function logout_async({req}){
    return new Promise(function(resolve, reject){
        if(req.session.userInfo){
            // ap.inf('logout in')
            req.session.destroy(function(err){
                if(err){
                    reject(controllerError.logout.destroySessionFailed)
                }
                resolve({rc:0})
            })

        }
    })

}

module.exports={
    logout_async,
}