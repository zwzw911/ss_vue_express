/**
 * Created by wzhan039 on 2015-12-16.
 */
    'use strict'
// var redis=require('redis');
let ioredis=require('ioredis')

const currentAppSetting=require('../../../constant/config/appSetting').currentAppSetting
/*let redisOptions={
 host:'127.0.0.1',
 port:6379,
 enable_offline_queue:true,//当redis offline，不要缓存redis client的请求，防止占用内存，并可以显示错误给浏览器客户端
 //设为true，以便建立完cilent就可以把药执行的命令缓存起来，等待连接建立后开始执行；否则需要多次监听ready时间
 retry_max_delay:1000,//client连接失败，再次重试，延迟加倍；默认没有最大延迟限制；现在设成1000ms
 max_attempts:10,//最大重试连接次数
 //db:1,
 }*/

let redisOption={
    host:currentAppSetting['redisIPForNormal'],
    port:currentAppSetting['redisPortForNormal'],
    family:'4',//IPv4
    db:0,
    //password:'',
}
/*let redisOption_captcha={
    host:currentAppSetting['redisIPForNormal'],
    port:currentAppSetting['redisPortForNormal'],
    family:'4',//IPv4
    db:1,
    //password:'',
}*/
// console.log(`ioredisOption===========>${JSON.stringify(ioredisOption)}`)
module.exports={
    /*redisClient:function(){
        redisOptions['db']=1
        let redisClient=redis.createClient(redisOptions)
        redisClient.on('ready',function(){
            console.log('redis connect ready')
        })
        redisClient.on('error',function(err){
            console.log(err)
        })
        return redisClient

    },
    redisClient1:function(){
        redisOptions['db']=1
//console.log(redisOptions)
        let redisClient=redis.createClient(redisOptions)
        redisClient.on('ready',function(){
            redisClient.select(1,function(err){
                return cb(err, redisClient)
            })
            console.log('ready')
        })
        redisClient.on('error',function(err){
            console.log(err)
        })


    },*/
    redisClient:new ioredis(redisOption),
    // redisClientForCaptcha:new ioredis(redisOption_captcha),
/*	redisClient: function(){return new ioredis(ioredisOption)},
	redisClient1:new ioredis(ioredisOption),*/
    //redisClient:redis.createClient(redisOptions)

    //redisClient:redis.createClient()
}
