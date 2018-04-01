/**
 * Created by Ada on 2017/7/10.
 *
 *
 *
 */
'use strict'

//所有函数无需输入redisClient，而是直接使用。简化使用（减少require redisClient已经对应的参数）
const redisClient=require('../common/redis_connections').redisClient
const luaScriptSHA=require('../../../constant/genEnum/LuaSHA').luaScriptSHA
const runtimeRedisError=require('../../../constant/error/redis/redisError')
const luaError=runtimeRedisError.luaError
const generalError=runtimeRedisError.generalError
// const captchaError=runtimeRedisError.captchaError

const convertARGV=require('../helper').convertARGV

const ap=require('awesomeprint')
// let defaultSetting=require('../../constant/config/globalConfiguration').defaultSetting
let rightResult={rc:0}

/*      如果参数是以对象的方式传入，需要转换成lua的table格式          */


/* 简单interval check，只对2次请求间隔，以及duration是否超出进行检查
* @keyNameToStoreReqList：存储最近几次req时间的数据 的 名字
* @intervalCheckConfiguration: check interval的一些配置参数
     -- duration: 检查周期，周期内请求次数必须小于阀值。单位秒
     -- numberInDuration:在duratin中，最大request次数
     -- expireTimeBetween2Req:2次请求最小间隔
* */
async function simpleCheckInterval_async({keyNameToStoreReqList,intervalCheckConfiguration}){
    return new Promise(function(resolve,reject){
        intervalCheckConfiguration=convertARGV(intervalCheckConfiguration)
        let scriptName='script_checkInterval_simpleCheckInterval'

        redisClient.evalsha(luaScriptSHA[scriptName],1,keyNameToStoreReqList,intervalCheckConfiguration,Date.now(),function(err,result){
            if(err){
                // ap.inf('simpleCheckInterval_async failed',err)
                reject(luaError.luaExecFail(scriptName))
            }else{
                // ap.inf('simpleCheckInterval_async done',result)
                resolve(result)
            }

        })
    })

}

/*  通过检查sessionId.captcha:rejectFlag，判断用户是否处于 处罚状态（禁止请求的时间随着被拒次数增加而增加）
*
* */
async function checkIfInPunishReject_async({rejectFlagName,argv_configuration}){
    return new Promise(function(resolve,reject){
        let scriptName='script_checkInterval_checkIfInPunishReject'
        argv_configuration=convertARGV(argv_configuration)
// ap.wrn('argv_configuration',argv_configuration)
        redisClient.evalsha(luaScriptSHA[scriptName],1,rejectFlagName,argv_configuration,function(err,result){
            if(err){
                // ap.inf('checkIfInPunishReject_async failed',err)
                reject(luaError.luaExecFail(scriptName))
            }else{
                // ap.inf('checkIfInPunishReject_async done',result)
                // ap.inf('checkIfInPunishReject_async type',typeof result)
                resolve(result)
            }
        })
    })

}

/*  complicatedCheckInterval_async中，如果被reject（无论是simple还是complecated的reject），设置相应的key
*
* */
async function set_rejectFlagTimesWhenReceiveReject_async({keyName_rejectFlagName,keyName_rejectTimesName,argv_configuration}){

    return new Promise(function(resolve,reject){
        argv_configuration=convertARGV(argv_configuration)
        // ap.inf('argv_configuration',argv_configuration)
        let scriptName=`script_checkInterval_setRejectFlagTimesWhenReceiveReject`

        redisClient.evalsha(luaScriptSHA[scriptName],2,keyName_rejectFlagName,keyName_rejectTimesName,argv_configuration,function(err,result){
            if(err){
                // ap.inf('set_rejectFlagTimesWhenReceiveReject_async failed',err)
                reject(luaError.luaExecFail(scriptName))
            }else{
                // ap.inf('set_rejectFlagTimesWhenReceiveReject_async done',result)
                resolve(result)
            }
        })
    })

}


/*  复杂interval检查，如果被拒次数达到门限，设置一个flag，直接拒绝后续的请求
*   @rejectFlagName,rejectTimesName: 是否超出threshold，进入了惩罚性 检测
*
*   返回：0=检测通过；其他>0的数字，剩余TTL
* */
async function complicatedCheckInterval_async({rejectFlagName,rejectTimesName,keyNameToStoreReqList,intervalCheckConfiguration,argv_configuration}){
// ap.inf('complicatedCheckInterval_async in')
    let checkIfPunishReject=await checkIfInPunishReject_async({rejectFlagName:rejectFlagName,argv_configuration:argv_configuration})
    // ap.inf('checkIfPunishReject result is ',checkIfPunishReject)
    // flag不存在，进行simple check
    if(checkIfPunishReject===0){
        //没有设置rejectFlag，则根据simpleCheckInterval_async是否为reject，没有reject，返回0
        let simpleCheckIntervalResult=await simpleCheckInterval_async({keyNameToStoreReqList:keyNameToStoreReqList,intervalCheckConfiguration:intervalCheckConfiguration})
        // ap.inf('simpleCheckIntervalResult result is ',simpleCheckIntervalResult)
        if(0===simpleCheckIntervalResult) {
            return Promise.resolve(0)
        }
    }

    //flag存在，且返回>1数字（restTTL），则直接返回TTL
    if(checkIfPunishReject>1){
        return Promise.resolve(checkIfPunishReject)
    }
    //此处：有flag或者simple check reject，则需要重新设置rejectFlag/Times
    //返回值为0（通过），或者ttl（被禁止多久不得请求）
    let result=await set_rejectFlagTimesWhenReceiveReject_async({keyName_rejectFlagName:rejectFlagName,keyName_rejectTimesName:rejectTimesName,argv_configuration:argv_configuration})
    // ap.inf('set_rejectFlagTimesWhenReceiveReject_async result is ',result)
    return Promise.resolve(result)

}
module.exports={
    set_rejectFlagTimesWhenReceiveReject_async,
    simpleCheckInterval_async,
    complicatedCheckInterval_async,
}