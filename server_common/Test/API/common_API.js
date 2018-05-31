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

const redisOperation=require('../../model/redis/operation/redis_common_operation')

const crypt=require('../../function/assist/crypt')
/****************       GENERAL CREATE            *****************/
async function generalCreate_returnRecord_async({userData,sess,app,url}){
    // let data={values:{}}
    // // let url='/public_group/'
    // data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate==============>${JSON.stringify(userData)}`)
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

/****************       GENERAL UPDATE             *****************/
async function generalUpdate_returnRecord_async({userData,sess,app,url}){
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
/****************       从session中获得sessionId，然后在db中直接查找tempSalt             *****************/
async function getTempSalt_async({sess}){
    let sessContent=sess.split('=')[1]
    let sessId=sessContent.split('.')[0].replace('s%3A','')
    // ap.inf('key',`sess:${sessId}`)
    let sessValue= await redisOperation.get_async({db:0,key:`sess:${sessId}`})
    sessValue=JSON.parse(sessValue)
    // ap.inf('sessValue',sessValue)
    // ap.inf('typeof sessValue',typeof sessValue)
    // ap.inf('sessValue.userInfo',sessValue.userInfo)
    return Promise.resolve(sessValue.userInfo.tempSalt)
}


/***  根据sess获得salt，对objectId加密 ***/
async function cryptObjectId_async({objectId,sess}){
    // ap.inf('sess',sess)
    let tempSalt=await getTempSalt_async({sess:sess})
    // ap.inf('tempSalt',tempSalt)
    // ap.inf('objectId',objectId)
    let cryptedValue=crypt.cryptSingleFieldValue({fieldValue:objectId,salt:tempSalt}).msg
    return Promise.resolve(cryptedValue)
}


module.exports={
    generalCreate_returnRecord_async,
    generalUpdate_returnRecord_async,
    getTempSalt_async,

    cryptObjectId_async,


}