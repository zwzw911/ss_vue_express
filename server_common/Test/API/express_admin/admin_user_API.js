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
const e_field=require('../../../constant/genEnum/DB_field').Field

/****************    Get admin tmp session     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getFirstAdminSession({adminApp}){
    return new Promise(function(resolve,reject){
        request(adminApp).post('/admin_user/').set('Accept', 'application/json').send({})
            .end(function(err, res) {
                ap.inf('returnSess', res)
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                ap.inf('returnSess', parsedRes)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(returnSess)
            });
    })
}

/****************    gen admin captcha     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function genAdminCaptcha({sess,adminApp}){
    // ap.inf('genAdminCaptcha in')
    return new Promise(function(resolve,reject){
        request(adminApp).get('/admin_user/captcha/').set('Accept', 'application/json').set('Cookie', [sess]).send({})
            .end(function(err, res) {
                // let returnSess=res['header']['set-cookie'][0].split(';')[0]
                // let parsedRes=JSON.parse(res.text)
                // ap.inf('captcha resul', returnSess)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve()
            });
    })
}
/****************    directly get admin captcha from db to pass captcha check     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getAdminCaptcha({sess}){
    // ap.wrn('getAdminCaptcha:sess',sess)
    let sessContent=sess.split('=')[1]
    let sessId=sessContent.split('.')[0].replace('s%3A','')
    // ap.inf('key',`${sessId}:captcha`)
    let serverCaptcha= await redisOperation.get_async({db:8,key:`${sessId}:captcha`})
    return Promise.resolve(serverCaptcha)
}



/****************       ADMIN_USER            *****************/
async function createAdminUser_async({userData,sess,captcha,adminApp}){
    let data={values:{}}
    let url='/admin_user/'

    data.values[e_part.RECORD_INFO]=userData
    data.values[e_part.CAPTCHA]=captcha
// console.log(`userDate==============>${JSON.stringify(userData)}`)
//     data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(adminApp).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`createAdminUser_async result =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })

}

/****************       ADMIN_USER 登录并返回session          *****************/
//返回一个promise，那么无需done
//userData:{name:{value:xxx},password:{value:yyyyy}}
async function adminUserLogin_returnSess_async({userData,captcha,sess,adminApp}){
    // ap.wrn('adminUserLogin_returnSess_async in')
    // console.log(`adminUserLogin_returnSess_async userData =============>${JSON.stringify(userData)}`)
    let data={}
    data.values={}
    // data.values.method=e_method.MATCH
    let userDataCopy=objectDeepCopy(userData)
    delete userDataCopy['userType']
    delete userDataCopy[e_field.ADMIN_USER.USER_PRIORITY]
    data.values[e_part.RECORD_INFO]=userDataCopy//,notExist:{value:123}
    data.values[e_part.CAPTCHA]=captcha
    // ap.wrn('data for login',data)
    // console.log(`adminUser login data ===>${JSON.stringify(data)}`)
    return new Promise(function(resolve,reject){
        request.agent(adminApp).post('/admin_user/login/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // console.log(`err ==================> ${JSON.stringify(err)}`)
                // console.log(`adminUserLogin_returnSess_async res ==================> ${JSON.stringify(res)}`)
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                // console.log(`admin userlogin returnSess ################### ${JSON.stringify(returnSess)}`)
                let parsedRes=JSON.parse(res.text)
                // console.log(`returnSess ################### ${JSON.stringify(returnSess)}`)
                assert.deepStrictEqual(parsedRes.rc,0)

                // done();
                return resolve(returnSess)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
            });
    })
}

module.exports={
    getFirstAdminSession,
    genAdminCaptcha,
    getAdminCaptcha,

    createAdminUser_async,
    adminUserLogin_returnSess_async,
}