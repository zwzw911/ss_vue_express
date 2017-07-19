/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const e_part=require('../../server/constant/enum/node').ValidatePart
const e_method=require('../../server/constant/enum/node').Method

const common_operation=require('../../server/model/mongo/operation/common_operation')
const dbModel=require('../../server/model/mongo/dbModel')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helpError=require('../../server/constant/error/controller/helperError').helper

let baseUrl="/user/"
describe('register format check', function() {
    let data = {values: {recordInfo: {}}}, url = ``, finalUrl = baseUrl + url

    it('miss part method', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,helpError.methodPartMustExistInDispatcher.rc)
                done();
            });
    });

    it('method is unknown value', function(done) {
        data.values[e_part.METHOD]=10
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.inputValuePartMethodValueFormatWrong.rc)
                done();
            });
    });
})



describe('register /user rule check', function() {
    let data={values:{recordInfo:{},method:e_method.CREATE}},url=``,finalUrl=baseUrl+url

    it('miss require field name', function(done) {
        data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('require field name too short', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.format.error.rc)
                done();
            });
    });
    it('require field name too long', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789012345678901234567890'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.format.error.rc)
                done();
            });
    });

    it('miss require field account', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.account.rc,browserInputRule.user.account.require.error.rc)
                done();
            });
    });
    it('require field account not phone or email', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.account.rc,browserInputRule.user.account.format.error.rc)
                done();
            });
    });


    it('miss require field password', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.password.rc,browserInputRule.user.password.require.error.rc)
                done();
            });
    });
    it('require field password not match', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.password.rc,browserInputRule.user.password.format.error.rc)
                done();
            });
    });

    it('not exist field check', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'1'},notExist:{value:123}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.recordInfoFiledRuleNotDefine.rc)
                done();
            });
    });


})


describe('register /user correct value', function() {
    let data={values:{recordInfo:{},method:e_method.CREATE}},url=``,finalUrl=baseUrl+url
    it('correct value', function(done) {


        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'123456'}}//
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    before('remove exist test user', async function(){
        /*              清理已有数据              */
        // console.log(`###############`)
        let result=await common_operation.find({dbModel:dbModel.user,condition:{name:'123456789',account:'15921776543'}})
        // console.log(`find result ${JSON.stringify(result)}`)
        if(0===result.rc && result.msg[0]){
            let userId=result.msg[0]['id']
            // console.log(`find id ${JSON.stringify(userId)}`)
            result=await common_operation.deleteOne({dbModel:dbModel.user,condition:{name:'123456789',account:'15921776543'}})
            result=await common_operation.deleteOne({dbModel:dbModel.sugar,condition:{userId:userId}})
            result=await common_operation.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:userId}})
            // console.log(`delete result is ${JSON.stringify(result)}`)
        }
    });
})


describe('POST /user/uniqueCheck ', function() {
    let data={values:{}},url='uniqueCheck',finalUrl=baseUrl+url


    it('unique name check', function(done) {
        data.values[e_part.SINGLE_FIELD]={name:{value:'123456789'}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,50100)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique account check', function(done) {
        data.values[e_part.SINGLE_FIELD]={account:{value:'15921776543'}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,50102)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique: not support field check', function(done) {
        data.values[e_part.SINGLE_FIELD]={password:{value:'123456'}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,50104)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique name check ok', function(done) {
        data.values[e_part.SINGLE_FIELD]={name:{value:'zw'}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
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



describe('POST login /user ', function() {
    let data={values:{method:e_method.MATCH}},url='',finalUrl=baseUrl+url


    it('user login correct', function(done) {
        data.values[e_part.RECORD_INFO]={account:{value:'15921776543'},password:{value:'123456'}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
})