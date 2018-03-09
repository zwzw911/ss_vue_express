/**
 * Created by Ada on 2017/7/10.
 * 为了能够自定义db，使用lua脚本完成基本操作
 */
'use strict'

const runtimeRedisError=require('../../../constant/error/redis/redisError')
const luaError=runtimeRedisError.luaError
const generalError=runtimeRedisError.generalError
// const captchaError=runtimeRedisError.captchaError

const regex=require('../../../constant/regex/regex').regex
const luaScriptSHA=require('../../../constant/genEnum/LuaSHA').luaScriptSHA
const ap=require('awesomeprint')

// const convertARGV=require('../helper').convertARGV

const redisClient=require('../common/redis_connections').redisClient
// let defaultSetting=require('../../constant/config/globalConfiguration').defaultSetting
let rightResult={rc:0}

async function set_async({db=0,key,value,expireTime,expireUnit}){
    return new Promise(function (resolve, reject) {
        let t=redisClient.multi().select(db).set(key,value)
        if(undefined!==expireTime){
            if('s'===expireUnit){
                t.expire(key,expireTime)
            }
            else if('ms'===expireUnit){
                t.pexpire(key,expireTime)
            }else {
                reject(generalError.expireUnitInCorrect)
            }
        }
        t.exec(function (err,result) {
            if(err){
                // ap.inf('err',err)
                reject(err)
            }
            // ap.inf('result',result)
            resolve(result)
        })
    })
}

/*
* 返回值：如果key不存在，返回null
* */
async function get_async({db=0,key}){
    return new Promise(function(resolve,reject){
        redisClient.multi().select(db).get(key).exec(function(err,result){
            if(err){
                // ap.wrn('get err', err)
                reject(generalError.getError)
            }
            // ap.inf('get result ',result)
            //get位于multi的第二个命令
            resolve(result[1][1])
        })
    })
}

/*
* 返回值：删除成功：1，删除失败(例如键不存在)：0
* */
async function del_async({db=0,key}){
    return new Promise(function (resolve, reject) {
        redisClient.multi().select(db).del(key).exec(function(err,result){
            if(err){
                ap.wrn('delete err', err)
                reject(generalError.getError)
            }
            ap.inf('get delete ',result)
            //get位于multi的第二个命令
            resolve(result[1][1])
        })
    })
}



module.exports={
    set_async,
    get_async,
    del_async,
}

// set_async({key:'a',value:1,expireTime:20000,expireUnit:'ms'})
// del_async({key:'a'})
// ap.inf('get_async',)