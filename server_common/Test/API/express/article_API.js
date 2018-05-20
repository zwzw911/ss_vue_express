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



/****************       ARTICLE            *****************/
async function createNewArticle_returnArticleId_async({userSess,app}){
    let data={values:{}}
    // data.values={}
    // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    // data.values[e_part.METHOD]=e_method.CREATE
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

async function updateArticle_returnArticleId_async({userSess,recordId,values,app}){
    let data={values:{}}
    // data.values={}
    // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    data.values[e_part.RECORD_INFO]=values
    data.values[e_part.RECORD_ID]=recordId
    // data.values[e_part.METHOD]=e_method.UPDATE
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
                return resolve(parsedRes)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}

module.exports={
    createNewArticle_returnArticleId_async,
    updateArticle_returnArticleId_async,
}