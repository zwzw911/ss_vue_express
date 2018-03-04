/**
 * Created by wzhan039 on 2016-03-02.
 */

const luaScriptSHA=require('../../constant/genEnum/LuaSHA').luaScriptSHA

const shaFunc=require('../redis/operation/redis_common_script')
const redisClient=require('../redis/common/redis_connections').redisClientForCaptcha

let argv={
    duration:60,  //second
    numberInDuration:10, //duration时间段中，最大请求次数
    expireTimeBetween2Req:0, //ms  2次间隔最小时间
}
let rejectArgv={
    rejectTimesToTime:[0,30,60,120,300,600], //第一个元素和argv中的expireTimeBetween2Req一致
    rejectTimesThreshold:5,//5次被拒后，之后的每次被拒，都要加上惩罚时间
}
let allPromise=[]
for(i=0;i<10;i++){
    allPromise.push(shaFunc.simpleCheckInterval_async({keyNameToStoreReqList:'sessionId.captcha:reqList',intervalCheckConfiguration:argv,redisClient:redisClient}))
}
// Promise.all(allPromise)
let func=shaFunc.complicatedCheckInterval_async({
    rejectFlagName:"sessionId.captcha:rejectFlagName",
    rejectTimesName:"sessionId.captcha:rejectTimesName",
    keyNameToStoreReqList:'sessionId.captcha:reqList',
    intervalCheckConfiguration:argv,
    argv_configuration:rejectArgv,
    redisClient:redisClient})

allPromise.push(func)


Promise.all(allPromise)
// shaFunc({sha:luaScriptSHA['Lua_check_interval.lua'],keyNameToStoreReqList:'sessionId.captcha:reqList',intervalCheckConfiguration:argv,redisClient:redisClient})
