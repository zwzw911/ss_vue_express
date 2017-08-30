/**
 * Created by Ada on 2017/8/24.
 *
 * 模拟常用的REST_API
 *
 */
'use strict'

const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const e_part=require('../../server/constant/enum/node').ValidatePart
const e_method=require('../../server/constant/enum/node').Method
const e_field=require('../../server/constant/enum/DB_field').Field
const e_coll=require('../../server/constant/enum/DB_Coll').Coll

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper_db_operate=require('./db_operation_helper')

// const common_operation_model=require('../../server/model/mongo/operation/common_operation_model')
// const e_dbModel=require('../../server/model/mongo/dbModel')
// const initSettingObject=require('../../server/constant/enum/initSettingObject').iniSettingObject
// const testData=require('../testData')

// let tmpResult


async function removeExistsRecord_async(){
    await test_helper_db_operate.deleteAllModelRecord_async({})
}


async function createUser_async({userData}){
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]=userData
console.log(`userDate==============>${JSON.stringify(userData)}`)
    data.values.method=e_method.CREATE
    return new Promise(function(resolve,reject){
        request(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`created user =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })

}

//返回一个promise，那么无需done
async function userLogin_returnSess_async({userData}){
    let data={}
    data.values={}
    data.values.method=e_method.MATCH
    let userTmp=objectDeepCopy(userData)
    delete userTmp['name']
    delete userTmp['userType']
    data.values[e_part.RECORD_INFO]=userTmp//,notExist:{value:123}
    return new Promise(function(resolve,reject){
        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                // console.log(`returnSess ################### ${JSON.stringify(returnSess)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                console.log(`user login result ==================> ${JSON.stringify(parsedRes)}`)
                // done();
                return resolve(returnSess)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
            });
    })
}

/*          登录用户创建一个新文档
*   return: articleId
* */
async function userCreateArticle_returnArticleId_async({userSess}){
    let data={}
    data.values={}
    data.values[e_part.METHOD] = e_method.CREATE
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`create article result ==========> ${JSON.stringify(parsedRes)}`)
                // articleId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })

}

/*
* @impeachType: article/comment
* */
async function createImpeach_returnImpeachId_async({impeachType,articleId,commentId,userSess}) {
    let data={}
    data.values={}


    data.values[e_part.RECORD_INFO]={
        [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
        // [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:articleId},
    }

    if(undefined!==articleId){
        data.values[e_part.RECORD_INFO][e_field.IMPEACH.IMPEACHED_ARTICLE_ID]={value:articleId}
    }else if(undefined!==commentId){
        data.values[e_part.RECORD_INFO][e_field.IMPEACH.IMPEACHED_COMMENT_ID]={value:commentId}
    }

    data.values[e_part.METHOD] = e_method.CREATE
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })

}


function updateImpeach({data,userSess,expectRc,done}) {

    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    // return new Promise(function(resolve,reject){
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`updateImpeach result=========> ${JSON.stringify(parsedRes)}`)
                // console.log(`expectRc result=========> ${JSON.stringify(expectRc)}`)
                // assert.deepStrictEqual(parsedRes.rc, 0)
                // return resolve(parsedRes['msg']['_id'])
                assert.deepStrictEqual(parsedRes.rc,expectRc)
                // resolve(0)
                done();
            });
    // })

}
module.exports={
    removeExistsRecord_async,
    createUser_async,
    userLogin_returnSess_async,
    userCreateArticle_returnArticleId_async,
    createImpeach_returnImpeachId_async,
    updateImpeach,
}
