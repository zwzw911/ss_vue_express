/**
 * Created by 张伟 on 2018/12/26.
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


/*
* @impeachType: article/comment
* */
async function createCollection_returnEncryptedId_async({data,userSess,app}) {
    // ap.wrn('createCollection_returnEncryptedId_async data',data)
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/collection').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}
async function deleteCollection_async({data,userSess,app}) {
    return new Promise(function(resolve,reject){
        request(app).delete('/collection').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                // return resolve(parsedRes['msg']['id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}

async function getAllCollection_async({data,userSess,app}) {
    return new Promise(function(resolve,reject){
        request(app).get('/collection').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                // return resolve(parsedRes['msg']['id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}

async function updateCollectionArticleTopic_async({data,userSess,app}) {
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).put('/collection/content').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve()
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}


module.exports={
    createCollection_returnEncryptedId_async,
    deleteCollection_async,
    getAllCollection_async,

    updateCollectionArticleTopic_async,
    // createImpeachForArticle_returnImpeachId_async,
    // delete_impeach_async,
    // createImpeachForComment_returnImpeachId_async,
    // updateImpeach_async,

    // createImpeachAction_async,
    // createImpeachComment_returnId_async,
}