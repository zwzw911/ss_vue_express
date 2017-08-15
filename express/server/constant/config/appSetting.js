/**
 * Created by ada on 2016-09-30.
 */

const e_env=require('../enum/node').Env

    //true：req.ip是最近的一个IP（最近的代理服务器IP）；req.ips是数组，从源头开始，到最近代理的IP；
    //fasle：req.ip(s)返回undefined和[]。此时需要req.connection.remoteAddress
const appSetting={
    [e_env.DEV]:{
        'trust_proxy':false,
        hostDomain:'127.0.0.1',
        mongo_switch:'127.0.0.1:27017',//mongo switch的ip

        redisIP:'127.0.0.1',
        redisPort:'6379',

    },
    [e_env.PROD]:{
        'trust_proxy':true,
        hostDomain:'172.24.251.56',
        mongo_switch:'127.0.0.1:27017',//mongo switch的ip

        redisIP:'127.0.0.1',
        redisPort:'6379',
    }
}

const currentEnv=e_env.DEV
const currentAppSetting=appSetting[currentEnv]

module.exports={
    currentEnv,
    currentAppSetting,


}