/**
 * Created by Ada on 2017/7/10.
 */
'use strict'

const ioredisClient=require('../common/redis_connections').ioredisClient

const luaError=require('../../../constant/error/redisError').luaError

const regex=require('../../../constant/regex/regex').regex
//执行sha后的lua脚本（实际使用）
function execSHALua(sha,params){

        if(params){
            if('string'!==typeof params && 'object'!==typeof params){
                reject(luaError.luaParamNotObject(sha))
            }
            if('object'===typeof params){
                params=JSON.stringify(params)
            }
            //为了能使Lua将字符串（对象转换）转换成table，key不能由括号（无论单还是双）括起
            params=params.replace(regex.lua.paramsConvert,'$1$2')
        }
        /*        console.log(`sha is ${sha}`)
         console.log(`params is ${params}`)*/
        //统一格式，没有key（key num为0），参数是对象转换的字符串
    return new Promise(function(reslove,reject){
        ioredisClient.evalsha(sha,0,params,function(err,result){
            if(err){
                console.log(`sha err is ${err}`);
                // console.log(`parsed sha err is ${LuaError.LueExecFail(sha)}`);

                reject(luaError.luaExecFail(sha))
            }else{
                //console.log(`type of result ${typeof result}`);
                console.log(`sha result is ${result}`);
                if(result && result!==''){
                    //result=
                    reslove(JSON.parse(result))
                }
            }

        })
    })
    // return shaResult
}

module.exports={
    execSHALua,
}