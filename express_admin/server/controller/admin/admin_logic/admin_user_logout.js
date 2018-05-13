/**
 * Created by wzhan039 on 2017/9/1.
 */
'use strict'


const controllerError=require('../admin_setting/admin_user_controllerError').controllerError



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