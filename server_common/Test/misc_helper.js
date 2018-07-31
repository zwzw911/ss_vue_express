/**
 * Created by Ada on 2017/10/31.
 */
'use strict'
const fs=require('fs')
const supertest=require('supertest')
const request=require('request')
const assert=require('assert')
const ap=require('awesomeprint')
/*  实际调用supertest，将数据发送到对应的API
*
* */
async function postDataToAPI_compareFieldRc_async({APIUrl,sess,data,expectedErrorRc,fieldName,app}){
    return new Promise(function(resolve,reject){

        supertest(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`data.values===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

async function postDataToAPI_compareCommonRc_async({APIUrl,sess,data,expectedErrorRc,app}){
    ap.inf('postDataToAPI_compareCommonRc_async data',data)
    return new Promise(function(resolve,reject){

        supertest(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // ap.inf('postDataToAPI_compareCommonRc_async result',res)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                // console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                // console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(parsedRes)
            });
    })
}

async function postDataWithFileToAPI_compareCommonRc_async({APIUrl,sess,data,filePath,expectedErrorRc,app}){
    supertest(app).post(finalUrl).field('name','file')
    // .attach('file','H:/ss_vue_express/培训结果1.png')
        .attach('file',filePath)
        // .attach('file','H:/ss_vue_express/gm_test.png')
        .set('Cookie',[sess])
        // .send(data)
        .set('Accept', 'application/json')
        .end(function(err, res) {
            // if (err) return done(err);
            // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
            // console.log(`parsedRes ${JSON.stringify(res)}`)
            let parsedRes=JSON.parse(res.text)
            console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
            assert.deepStrictEqual(parsedRes.rc,expectedErrorRc)
            // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
            return resolve()
        });
}

async function putDataToAPI_compareFieldRc_async({APIUrl,sess,data,expectedErrorRc,fieldName,app}){

    return new Promise(function(resolve,reject){

        supertest(app).put(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`data.values===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

async function putDataToAPI_compareCommonRc_async({APIUrl,sess,data,expectedErrorRc,app}){
    // ap.inf('putDataToAPI_compareCommonRc_async data',data)
    return new Promise(function(resolve,reject){

        supertest(app).put(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                // console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                // console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(parsedRes)
            });
    })
}

async function getDataFromAPI_async({APIUrl,sess,expectedErrorRc,app}){
    return new Promise(function(resolve,reject){

        supertest(app).get(APIUrl).set('Accept', 'application/json').set('Cookie', [sess])
            // .send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                // ap.inf('get result',res)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                // console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                // console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(parsedRes)
            });
    })
}

async function deleteAPI_compareCommonRc_async({APIUrl,sess,data,expectedErrorRc,app}){
    return new Promise(function(resolve,reject){

        supertest(app).delete(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                // console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                // console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(parsedRes)
            });
    })
}
async function deleteAPI_compareFieldRc_async({APIUrl,sess,data,expectedErrorRc,fieldName,app}){
    return new Promise(function(resolve,reject){

        supertest(app).delete(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                // console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                // console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.rc, 99999)
                // ap.wrn('parsedRes.msg[fieldName].rc',parsedRes.msg[fieldName].rc)
                // ap.wrn('expectedErrorRc',expectedErrorRc)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, expectedErrorRc)
                // assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(parsedRes)
            });
    })
}
/*async function postFile_async({APIUrl,sess,data,expectedErrorRc,app,fileAbsPath}) {
    return new Promise(function(resolve,reject){
        request({
                method: 'POST',
                // preambleCRLF: true,
                // postambleCRLF: true,
                uri: APIUrl,
                multipart: [
                    {
                        'content-type': 'application/json',
                        body: JSON.stringify({foo: 'bar', _attachments: {'message.txt': {follows: true, length: 18, 'content_type': 'text/plain' }}})
                    },
                    { body: 'I am an attachment' },
                    { body: fs.createReadStream('fileAbsPath') }
                ],
                // alternatively pass an object containing additional options
                /!*multipart: {
                    chunked: false,
                    data: [
                        {
                            'content-type': 'application/json',
                            body: JSON.stringify({foo: 'bar', _attachments: {'message.txt': {follows: true, length: 18, 'content_type': 'text/plain' }}})
                        },
                        { body: 'I am an attachment' }
                    ]
                }*!/
            },
            function (error, response, body) {
                if (error) {
                    return reject(error)
                }
                return resolve(body)
                // console.log('Upload successful!  Server responded with:', body);
            })
    })

}*/

async function postFile_async({APIUrl,sess,data,expectedErrorRc,app,fileAbsPath}) {
    return new Promise(function(resolve,reject){
        supertest(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess])//.send(data)
            .field('name','test')
            .attach('avatar', fileAbsPath)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                // let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                // console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                // console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                // assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                ap.inf('post file result',res)
                return resolve(res)
            });
    })

}
module.exports={
    postDataToAPI_compareFieldRc_async,
    postDataToAPI_compareCommonRc_async,
    putDataToAPI_compareFieldRc_async,
    putDataToAPI_compareCommonRc_async,
    deleteAPI_compareCommonRc_async,
    deleteAPI_compareFieldRc_async,
    getDataFromAPI_async,
    postFile_async,
}