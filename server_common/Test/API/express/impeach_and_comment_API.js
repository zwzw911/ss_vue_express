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

/****************       IMPEACH            *****************/
/*
* @impeachType: article/comment
* */
async function createImpeachForArticle_returnImpeachId_async({articleId,userSess,app}) {
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]={
        // [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
        [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId,
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

async function delete_impeach_async({impeachId,userSess,app}){
    let data={}
    data.values={}
    data.values[e_part.RECORD_ID]=impeachId

    data.values[e_part.METHOD] = e_method.DELETE
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                console.log(`data.values of delete_impeach_async===========> ${JSON.stringify(data.values)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(true)
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

async function updateImpeach_async({data,userSess,app}) {
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`updateImpeach result=========> ${JSON.stringify(parsedRes)}`)
                // console.log(`expectRc result=========> ${JSON.stringify(expectRc)}`)
                // assert.deepStrictEqual(parsedRes.rc, 0)
                // return resolve(parsedRes['msg']['_id'])
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(0)
                // done();
            });
    })
}
//普通或者admin用户提交action
//impeachActionInfo:{}
async function createImpeachAction_async({sess,impeachActionInfo,app}){
    let data={values:{}}
    data.values[e_part.METHOD]=e_method.CREATE
    data.values[e_part.RECORD_INFO]=impeachActionInfo
    return new Promise(function(resolve,reject){
        request(app).post('/impeach_action/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })
}

/*              impeach_comment             */
async function createImpeachComment_returnId_async({sess,impeachId,app}){
    let data={values:{}}
    data.values[e_part.METHOD]=e_method.CREATE
    data.values[e_part.RECORD_INFO]={[e_field.IMPEACH_COMMENT.IMPEACH_ID]:impeachId}
    return new Promise(function(resolve,reject){
        request(app).post('/impeach_comment/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}

module.exports={
    createImpeachForArticle_returnImpeachId_async,
    delete_impeach_async,
    createImpeachForComment_returnImpeachId_async,
    updateImpeach_async,

    createImpeachAction_async,
    createImpeachComment_returnId_async,
}