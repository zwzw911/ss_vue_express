/**
 * Created by zhang wei on 2018/3/29.
 */
'use strict'
const ap=require('awesomeprint')
const globalConfiguration=require('../../constant/config/globalConfiguration')
const intervalCheckConfiguration=globalConfiguration.intervalCheckConfiguration
const redisCommonScript=require('../../model/redis/operation/redis_common_script')

const misc=require('../assist/misc')

const intervalError=require('../../constant/error/securityError').intervalError

const e_intervalCheckPrefix=require('../../constant/enum/nodeEnum').IntervalCheckPrefix

/*  当请求出现错误，在redis中设置对应的reject（在checkInterval，如果间隔不符合要求，也会同样设置reject）
* @reqTypePrefix:用于生成key的前缀，格式为sessionId.reqTypePrefix;keyname。为constant/config/globalConfiguration下intervalCheckConfiguration的一个键值
* */
async function setReject_async({req,reqTypePrefix}){
    // ap.inf('setReject_async in')
    let configuration=intervalCheckConfiguration[reqTypePrefix]
    let userIdentity=await misc.getIdentify_async({req})
    // ap.inf('userIdentity',userIdentity)
    let arr_rejectKeyNames=misc.genRejectKeyName({arr_userIdentify:userIdentity,prefix:reqTypePrefix})
    // ap.inf('arr_rejectKeyNames',arr_rejectKeyNames)
    let newTTL=[]
    for (let singleRejectKeyName of arr_rejectKeyNames){
        // let prefix=`${singlePrefix}.${reqTypePrefix}`
        //redisClient无所谓使用哪个，lua脚本中会自动选择db1
        // ap.inf('checkInterval_async start')
        // ap.inf('prefix',prefix)
        let tmpNewTTL=await redisCommonScript.set_rejectFlagTimesWhenReceiveReject_async({keyName_rejectFlagName:singleRejectKeyName['rejectFlagName'],keyName_rejectTimesName:singleRejectKeyName['rejectTimes'],argv_configuration:configuration['rejectCheckParams']})
        // ap.inf('tmpNewTTL',tmpNewTTL)
        newTTL.push(tmpNewTTL)
        // let result=await complicatedCheckInterval_async({rejectFlagName:`${prefix}:rejectFlag`,rejectTimesName:`${prefix}:rejectTimes`,keyNameToStoreReqList:`${prefix}:reqList`,intervalCheckConfiguration:configuration['simpleCheckParams'],argv_configuration:configuration['rejectCheckParams'],redisClient:redisClient})
        // ap.inf('checkInterval_async done')
        // if(0!==result){

        // }
    }
    //返回session或者ip中，reject时间长的那个
    return Promise.reject(intervalError.rejectReq(Math.max(...newTTL)))
    // return Promise.resolve({rc:0})
}

/*  检查用户req是否合格（防止DoS）。默认使用复杂方式检测
* @reqTypePrefix:用于生成key的前缀，格式为sessionId.reqTypePrefix;keyname。为constant/config/globalConfiguration下intervalCheckConfiguration的一个键值
*
* return：0，通过；reject，带有ttl的错误
* */
async function checkInterval_async({req,reqTypePrefix}){
    let configuration=intervalCheckConfiguration[reqTypePrefix]
    let userIdentity=await misc.getIdentify_async({req})
    for (let singlePrefix of userIdentity){
        let prefix=`${singlePrefix}.${reqTypePrefix}`
        //redisClient无所谓使用哪个，lua脚本中会自动选择db1
        // ap.inf('checkInterval_async start')
        // ap.inf('prefix',prefix)
        let result=await redisCommonScript.complicatedCheckInterval_async({rejectFlagName:`${prefix}:rejectFlag`,rejectTimesName:`${prefix}:rejectTimes`,keyNameToStoreReqList:`${prefix}:reqList`,intervalCheckConfiguration:configuration['simpleCheckParams'],argv_configuration:configuration['rejectCheckParams']})
        // ap.inf('complicatedCheckInterval_async result',result)
        if(0!==result){
            return Promise.reject(intervalError.rejectReq(result))
        }
    }

    return Promise.resolve({rc:0})
}

function getIntervalPrefix({req}){
    // ap.inf('req.route',req.route)
    // return  new Promise(function(resolve, reject){
        let originalUrl=req.originalUrl
    // ap.inf('original,',originalUrl)
        switch (originalUrl){
            case '/user/captcha':
                return e_intervalCheckPrefix.CPATCHA
            case '/user/uploadUserPhoto':
                return e_intervalCheckPrefix.UPLOAD_USER_PHOTO
            default:
                return e_intervalCheckPrefix.NORMAL_REQ
        }

    // })
}
module.exports={
    getIntervalPrefix,
    setReject_async,
    checkInterval_async,
}