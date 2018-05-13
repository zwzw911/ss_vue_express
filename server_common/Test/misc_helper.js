/**
 * Created by Ada on 2017/10/31.
 */
'use strict'
const request=require('supertest')
const assert=require('assert')

/*  实际调用supertest，将数据发送到对应的API
*
* */
async function postDataToAPI_compareFieldRc_async({APIUrl,sess,data,expectedErrorRc,fieldName,app}){
    return new Promise(function(resolve,reject){

        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`data.values===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

async function postDataToAPI_compareCommonRc_async({APIUrl,sess,data,expectedErrorRc,app}){
    return new Promise(function(resolve,reject){

        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(parsedRes)
            });
    })
}


async function putDataToAPI_compareFieldRc_async({APIUrl,sess,data,expectedErrorRc,fieldName,app}){
    return new Promise(function(resolve,reject){

        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`data.values===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

async function putDataToAPI_compareCommonRc_async({APIUrl,sess,data,expectedErrorRc,app}){
    return new Promise(function(resolve,reject){

        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(parsedRes)
            });
    })
}
module.exports={
    postDataToAPI_compareFieldRc_async,
    postDataToAPI_compareCommonRc_async,
    putDataToAPI_compareFieldRc_async,
    putDataToAPI_compareCommonRc_async,
}