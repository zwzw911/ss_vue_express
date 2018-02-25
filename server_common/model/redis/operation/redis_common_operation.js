/**
 * Created by Ada on 2017/7/10.
 */
'use strict'

// const redisClient=require('../common/redis_connections').redisClient

const runtimeRedisError=require('../../../constant/error/redis/redisError')
const luaError=runtimeRedisError.luaError
const generalError=runtimeRedisError.generalError
// const captchaError=runtimeRedisError.captchaError

const regex=require('../../../constant/regex/regex').regex

// let defaultSetting=require('../../constant/config/globalConfiguration').defaultSetting
let rightResult={rc:0}

function save({key,value,expireInSecond,redisClient}){
    /*    redisClient.set(`${req.session.id}:captcha`,captcha,function(){

        })*/
    // let captchaKey=`${key}:captcha`
    if(undefined===expireInSecond){
        redisClient.multi().set(key,value).exec()
    }else{
        redisClient.multi().set(key,value).expire(key,expireInSecond).exec()
    }
}

function get_async({key,redisClient}){
    // let captchaKey=`${reqSessionId}:captcha`;
    redisClient.exists(key,function(err,exist){
        if(err){
            return Promise.reject(generalError.existsFail)
        }
        if(1===exist){
            redisClient.get(key,function(err,result){
                if(err){
                    return Promise.reject(generalError.getError)
                    // return cb(null,runtimeRedisError.captcha.getError)
                }
                return Promise.resolve({rc:0,msg:result})
                // return cb(null,{rc:0,msg:result})
            })
        }else{
            //getCaptcha只在对比时才调用，那么说明之前已经产生过captcha了，所以notExist，返回说明文字“超时”
            return Promise.reject(generalError.expire)
            // return cb(null,runtimeRedisError.captcha.expire)
        }

    })
}

function del_async({key,redisClient}){
    // let captchaKey=`${reqSessionId}:captcha`;
    redisClient.del(key,function(err,result){
        if(err){
            // ap.err(err)
            return Promise.reject(generalError.delError)
            // return cb(null,)
        }
        // ap.inf(result)
        return Promise.resolve({rc:0,msg:result})
        // return cb(null,)
    })
    /*    redisClient.exists(captchaKey,function(err,exist){
            if(err){
                return cb(null,runtimeRedisError.general.existsFail)
            }
            if(1===exist){
                redisClient.del(captchaKey,function(err,result){
                    if(err){
                        return cb(null,runtimeRedisError.captcha.delError)
                    }
                    return cb(null,{rc:0,msg:result})
                })
            }
        })*/
}

//执行sha后的lua脚本（实际使用）
function execSHALua_async(sha,params,redisClient){

        if(params){
            if('string'!==typeof params && 'object'!==typeof params){
                return Promise.reject(luaError.luaParamNotObject(sha))
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
    // return new Promise(function(reslove,reject){
        redisClient.evalsha(sha,0,params,function(err,result){
            if(err){
                // console.log(`sha err is ${err}`);
                // console.log(`parsed sha err is ${LuaError.LueExecFail(sha)}`);

                return Promise.reject(luaError.luaExecFail(sha))
            }else{
                //console.log(`type of result ${typeof result}`);
                // console.log(`sha result is ${result}`);
                if(result && result!==''){
                    //result=
                    return Promise.resolve(JSON.parse(result))
                }
            }

        })
    // })
    // return shaResult
}

module.exports={
    save,
    get_async,
    del_async,
    execSHALua_async,
}