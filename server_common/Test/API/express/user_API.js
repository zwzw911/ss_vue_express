/**
 * Created by zhang wei on 2018/5/17.
 */
'use strict'
/*************************************************************/
/******************        3rd or lib      ******************/
/*************************************************************/
const request=require('supertest')
const assert=require('assert')
const ap=require(`awesomeprint`)

/*************************************************************/
/******************        公共函数      ******************/
/*************************************************************/
const redisOperation=require('../../../model/redis/operation/redis_common_operation')
const objectDeepCopy=require(`../../../function/assist/misc`).objectDeepCopy
/*************************************************************/
/******************        公共常量      ******************/
/*************************************************************/
const e_part=require('../../../constant/enum/nodeEnum').ValidatePart

/****************    Get tmp session     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getFirstSession({app}){
    return new Promise(function(resolve,reject){
        request(app).post('/user/').set('Accept', 'application/json').send({})
            .end(function(err, res) {
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                // ap.inf('returnSess', returnSess)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(returnSess)
            });
    })
}

/****************    gen captcha     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function genCaptcha({sess,app}){
    return new Promise(function(resolve,reject){
        request(app).get('/user/captcha').set('Accept', 'application/json').set('Cookie', [sess]).send({})
            .end(function(err, res) {
                // let returnSess=res['header']['set-cookie'][0].split(';')[0]
                // let parsedRes=JSON.parse(res.text)
                // ap.inf('captcha resul', returnSess)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve()
            });
    })
}
/****************    directly get captcha from db to pass captcha check     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getCaptcha({sess}){
    let sessContent=sess.split('=')[1]
    let sessId=sessContent.split('.')[0].replace('s%3A','')
    // ap.inf('key',`${sessId}:captcha`)
    let serverCaptcha= await redisOperation.get_async({db:2,key:`${sessId}:captcha`})
    return Promise.resolve(serverCaptcha)
}

/****************       USER            *****************/
async function createUser_async({userData,captcha,sess,app}){
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]=userData
    data.values[e_part.CAPTCHA]=captcha
    ap.inf('createUser_async data',data)
// console.log(`userDate for create user==============>${JSON.stringify(userData)}`)
//     data.values.method=e_method.CREATE
    return new Promise(function(resolve,reject){
        request(app).post('/user/').set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function(err, res) {
                // ap.inf('res result',res)
                let parsedRes=JSON.parse(res.text)
                // console.log(`created user =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })
}

//返回一个promise，那么无需done
async function userLogin_returnSess_async({userData,captcha,sess,app}){
    let data={}
    data.values={}
    // data.values.method=e_method.MATCH
    let userTmp=objectDeepCopy(userData)
    delete userTmp['name']
    delete userTmp['userType']
    // ap.inf('userLogin_returnSess_async data',userTmp)
    // console.log(`userTmp====>${JSON.stringify(userTmp)}`)
    data.values[e_part.RECORD_INFO]=userTmp//,notExist:{value:123}
    data.values[e_part.CAPTCHA]=captcha
    // ap.inf('userLogin_returnSess_async data',data.values)
    return new Promise(function(resolve,reject){
        request.agent(app).post('/user/login').set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function(err, res) {
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                // console.log(`userlogin returnSess ################### ${JSON.stringify(returnSess)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // console.log(`user login result ==================> ${JSON.stringify(parsedRes)}`)
                // done();
                return resolve(returnSess)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
            });
    })
}

module.exports={
    getFirstSession,
    genCaptcha,
    getCaptcha,

    createUser_async,
    userLogin_returnSess_async,
}