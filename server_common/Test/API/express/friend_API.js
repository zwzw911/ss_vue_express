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

/****************       CREATE ADD_FRIEND            *****************/
async function createAddFriend_returnRecord_async({userData,sess,app}){
    let data={values:{}}
    let url='/add_friend/'
//     data.values[e_part.RECORD_INFO]=userData
// // console.log(`userDate==============>${JSON.stringify(userData)}`)
//     data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(userData)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}

//userData只能有一个字段status
async function updateAddFriend_returnRecord_async({userData,sess,app}){
    // let data={values:{}}
    let url='/add_friend/'
    // data.values[e_part.RECORD_INFO]=userData
    // data.values[e_part.RECORD_ID]=recordId
    // ap.print('data.values[e_part.RECORD_INFO]',data.values[e_part.RECORD_INFO])
    // data.values[e_part.METHOD]=e_method.UPDATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(userData)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}



module.exports={
    createAddFriend_returnRecord_async,
    updateAddFriend_returnRecord_async,
}