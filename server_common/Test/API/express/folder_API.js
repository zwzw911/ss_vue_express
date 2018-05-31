/**
 * Created by zhang wei on 2018/5/17.
 */
'use strict'
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

/********  获取用户的顶级目录    ******/
async function getAllTopLevelFolder_async({sess,app}){
    // ap.inf('userSess',sess)
    let data={values:{}}
    // data.values={}
    // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    // data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).get('/folder/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes['msg'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}
/***    创建目录    ***/
async function createFolder_async({sess,data,app}){
    // ap.inf('userSess',sess)
    // let data={values:{}}
    // data.values={}
    // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    // data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/folder/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes['msg'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}
module.exports={
    getAllTopLevelFolder_async,
    createFolder_async,
}