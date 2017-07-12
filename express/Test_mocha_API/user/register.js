/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const e_part=require('../../server/constant/enum/node').ValidatePart

const common_operation=require('../../server/model/mongo/operation/common_operation')
const dbModel=require('../../server/model/mongo/dbModel').DbModel

describe('POST /register', function() {
    let data={values:{recordInfo:{}}},url='/register'

/*    it('miss require field name', function(done) {
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,10700)
                done();
            });
    });
    it('require field name too short', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'1'}}
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,10706)
                done();
            });
    });
    it('require field name too long', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789012345678901234567890'}}
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,10706)
                done();
            });
    });

    it('miss require field account', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'}}
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.account.rc,10708)
                done();
            });
    });
    it('require field account not phone or email', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'1'}}
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.account.rc,10714)
                done();
            });
    });


    it('miss require field password', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'}}
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.password.rc,10716)
                done();
            });
    });
    it('require field password not match', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'1'}}
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });*/



    it('correct value', function(done) {


        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'123456'},notExist:{value:123}}
        request(app).post(url).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    before('remove exist test user', async function(){
        /*              清理已有数据              */
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
    })
})