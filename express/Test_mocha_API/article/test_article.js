/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const e_part=require('../../server/constant/enum/node').ValidatePart
const e_method=require('../../server/constant/enum/node').Method

const common_operation_model=require('../../server/model/mongo/operation/common_operation_model')
const dbModel=require('../../server/model/mongo/dbModel')
const dbModelInArray=require('../../server/model/mongo/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helpError=require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/article/article_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const testData=require('../testData')

let baseUrl="/article/"
let userId  //create后存储对应的id，以便后续的update操作

let sess,data={values:{}}

describe('prepare:', function() {
    // let dbModleToBeDelete=[dbModel.user,dbModel.sugar,dbModel.]


    it('remove all record', async function(){
        for(let singleDbModel of dbModelInArray){
            await common_operation_model.removeAll({dbModel:singleDbModel})
        }
    });

    it('user1 register', function(done) {
        data.values[e_part.RECORD_INFO]=testData.user.user1//
        data.values[e_part.METHOD]=e_method.CREATE
        request(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });


})





describe('create new article : ', function() {
    let url = '', finalUrl = baseUrl + url

    before('user login correct', function(done) {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp=objectDeepCopy(testData.user.user1)
        delete user1Tmp['name']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        data.values[e_part.METHOD]=e_method.MATCH
        // console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie'][0])}`)
                sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('with additional part', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'my article'}}
        data.values[e_part.METHOD]=e_method.CREATE
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.inputValuePartNumExceed.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('correct article', function(done) {
        delete data.values[e_part.RECORD_INFO]
        console.log(`sess ===>${JSON.stringify(sess)}`)
        console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.inputValuePartNumExceed.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
})
