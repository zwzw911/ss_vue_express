/**
 * Created by Ada on 2017/8/24.
 *
 * 模拟常用的REST_API
 *
 */
'use strict'
//const express=require('express')


const request=require('supertest')
// const adminApp=require('../../express_admin/app')
// const app=require('../../express/app')
const assert=require('assert')

// const server_common_file_require=require('../../express_admin/server_common_file_require')
const nodeEnum=require(`../constant/enum/nodeEnum`)

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_field=require('../constant/genEnum/DB_field').Field
// const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll

const objectDeepCopy=require(`../function/assist/misc`).objectDeepCopy
const test_helper_db_operate=require('./db_operation_helper')

async function removeExistsRecord_async(){
    await test_helper_db_operate.deleteAllModelRecord_async({})
}

async function createUser_async({userData,app}){
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate for create user==============>${JSON.stringify(userData)}`)
    data.values.method=e_method.CREATE
    return new Promise(function(resolve,reject){
        request(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`created user =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })
}

//返回一个promise，那么无需done
async function userLogin_returnSess_async({userData,app}){
    let data={}
    data.values={}
    data.values.method=e_method.MATCH
    let userTmp=objectDeepCopy(userData)
    delete userTmp['name']
    delete userTmp['userType']
    // console.log(`userTmp====>${JSON.stringify(userTmp)}`)
    data.values[e_part.RECORD_INFO]=userTmp//,notExist:{value:123}
    return new Promise(function(resolve,reject){
        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
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

async function createAdminUser_async({userData,sess,adminApp}){
    let data={values:{}}
    let url='/admin_user/'

    data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate==============>${JSON.stringify(userData)}`)
    data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(adminApp).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`created user =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })

}

//返回一个promise，那么无需done
//userData:{name:{value:xxx},password:{value:yyyyy}}
async function adminUserLogin_returnSess_async({userData,adminApp}){
    let data={}
    data.values={}
    data.values.method=e_method.MATCH
    delete userData['userType']
    // console.log(`userData =============>${JSON.stringify(userData)}`)
    data.values[e_part.RECORD_INFO]=userData//,notExist:{value:123}
    // console.log(`data ===>${JSON.stringify(data)}`)
    return new Promise(function(resolve,reject){
        request.agent(adminApp).post('/admin_user/').set('Accept', 'application/json').send(data)
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

/*/!*          登录用户创建一个新文档
*   return: articleId
* *!/
async function userCreateArticle_returnArticleId_async({userSess,app}){
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
                // console.log(`create article result ==========> ${JSON.stringify(parsedRes)}`)
                // articleId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })

}*/

/*
* @impeachType: article/comment
* */
async function createImpeachForArticle_returnImpeachId_async({articleId,userSess,app}) {
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]={
        // [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
        [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:articleId},
    }
    data.values[e_part.METHOD] = e_method.CREATE
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}
async function createImpeachForComment_returnImpeachId_async({commentId,userSess}) {
    let data={}
    data.values={}


    data.values[e_part.RECORD_INFO]={
        // [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
        [e_field.IMPEACH.IMPEACHED_COMMENT_ID]:{value:commentId},
    }


    data.values[e_part.METHOD] = e_method.CREATE
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/comment').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })

}

function updateImpeach({data,userSess,expectRc,done,app}) {
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    // return new Promise(function(resolve,reject){
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`updateImpeach result=========> ${JSON.stringify(parsedRes)}`)
                // console.log(`expectRc result=========> ${JSON.stringify(expectRc)}`)
                // assert.deepStrictEqual(parsedRes.rc, 0)
                // return resolve(parsedRes['msg']['_id'])
                assert.deepStrictEqual(parsedRes.rc,expectRc)
                // resolve(0)
                done();
            });
    // })
}

async function createNewArticle_returnArticleId_async({userSess,app}){
    let data={values:{}}
    // data.values={}
    // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie',[userSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })

}
module.exports={
    removeExistsRecord_async,

    createUser_async,
    userLogin_returnSess_async,
    createAdminUser_async,
    adminUserLogin_returnSess_async,

    // userCreateArticle_returnArticleId_async,
    createImpeachForArticle_returnImpeachId_async,
    // createImpeachForComment_returnImpeachId_async,
    updateImpeach,

    createNewArticle_returnArticleId_async,
}
