/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const e_part=require('../../server/constant/enum/node').ValidatePart
const e_method=require('../../server/constant/enum/node').Method
const e_field=require('../../server/constant/enum/DB_field').Field
const e_coll=require('../../server/constant/enum/DB_Coll').Coll
const e_penalizeType=require('../../server/constant/enum/mongo').PenalizeType.DB
const e_penalizeSubType=require('../../server/constant/enum/mongo').PenalizeSubType.DB
const e_impeachType=require('../../server/constant/enum/mongo').ImpeachType.DB

const common_operation_model=require('../../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../../server/model/mongo/dbModel')
const dbModelInArray=require('../../server/model/mongo/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helpError=require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/article/article_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper=require("../test_helper_db_operate")
const testData=require('../testData')

let baseUrl
let userId  //create后存储对应的id，以便后续的update操作

let sess1,sess2,data={values:{}},user1Id,user2Id,articleId1,articleId2

describe('create new article and update, then create new comment: ', async function() {
    let url , finalUrl

    let newArticleId, folder2
    before('user1 login correct', function (done) {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp = {}
        user1Tmp[e_field.USER.ACCOUNT] = testData.user.user1[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD] = testData.user.user1[e_field.USER.PASSWORD]
        // console.log(`user1Tmp ===>${JSON.stringify(user1Tmp)}`)
        data.values[e_part.RECORD_INFO] = user1Tmp//,notExist:{value:123}
        data.values[e_part.METHOD] = e_method.MATCH
        // console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`user1 login result====>${JSON.stringify(res)}`)
                sess1 = res['header']['set-cookie'][0].split(';')[0]
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    before('user2 login correct', function (done) {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp = {}
        user1Tmp[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD] = testData.user.user2[e_field.USER.PASSWORD]
        // console.log(`user1Tmp ===>${JSON.stringify(user1Tmp)}`)
        data.values[e_part.RECORD_INFO] = user1Tmp//,notExist:{value:123}
        data.values[e_part.METHOD] = e_method.MATCH
        // console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie'][0])}`)
                sess2 = res['header']['set-cookie'][0].split(';')[0]
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    before('insert user2 penalize for impeach', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp = {}
        user1Tmp[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD] = testData.user.user2[e_field.USER.PASSWORD]

        let condition = {}
        condition[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]['value']
        let tmpResult = await common_operation_model.find({dbModel: e_dbModel.user, condition: condition})

        let value = {}
        value[e_field.ADMIN_PENALIZE.PUNISHED_ID] = tmpResult.msg[0]['_id']
        value[e_field.ADMIN_PENALIZE.CREATOR_ID] = tmpResult.msg[0]['_id']
        value[e_field.ADMIN_PENALIZE.REASON] = `test user2 penalize`
        value[e_field.ADMIN_PENALIZE.DURATION] = 1

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_IMPEACH
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await common_operation_model.create({dbModel: e_dbModel.admin_penalize, value: value})

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_COMMENT
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await common_operation_model.create({dbModel: e_dbModel.admin_penalize, value: value})

        // done()
        // return Promise.resolve({rc:0})
    })
    before('get user1 and user2 id', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)


        let conditionOfUser1 = {}
        conditionOfUser1[e_field.USER.ACCOUNT] = testData.user.user1.account.value
        let tmpResult = await common_operation_model.find({dbModel: e_dbModel.user, condition: conditionOfUser1})
        user1Id=tmpResult.msg[0]['_id']

        let conditionOfUser2 = {}
        conditionOfUser2[e_field.USER.ACCOUNT] = testData.user.user1.account.value
        tmpResult = await common_operation_model.find({dbModel: e_dbModel.user, condition: conditionOfUser2})
        user2Id=tmpResult.msg[0]['_id']

            // done()
        // return Promise.resolve({rc:0})
    })
    before('user1 create new article1', function (done) {
        delete data.values[e_part.RECORD_INFO]
        // data.values[e_part.RECORD_INFO] = {}
        // data.values[e_part.RECORD_INFO][e_field.IMPEACH.IMPEACH_TYPE]=e_impeachType.ARTICLE
        // data.values[e_part.RECORD_INFO][e_field.IMPEACH.CREATOR_ID]=e_impeachType.ARTICLE
        data.values[e_part.METHOD] = e_method.CREATE
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie', [sess1]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                articleId1=parsedRes.msg['id']
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    before('user2 create new article2', function (done) {
        delete data.values[e_part.RECORD_INFO]
        // data.values[e_part.RECORD_INFO] = {}
        // data.values[e_part.RECORD_INFO][e_field.IMPEACH.IMPEACH_TYPE]=e_impeachType.ARTICLE
        // data.values[e_part.RECORD_INFO][e_field.IMPEACH.CREATOR_ID]=e_impeachType.ARTICLE
        data.values[e_part.METHOD] = e_method.CREATE
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie', [sess1]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                articleId1=parsedRes.msg['id']
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    /*********************************************************************/
    /*********************    format      *******************************/
    /*********************************************************************/
    it('no record_info and method', function (done) {
        delete data.values[e_part.RECORD_INFO]
        delete data.values[e_part.METHOD]
        // data.values[e_part.METHOD] = e_method.CREATE
        // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)

        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [sess1]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                newArticleId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, helpError.methodPartMustExistInDispatcher.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('no record_info ', function (done) {
        delete data.values[e_part.RECORD_INFO]
        // delete data.values[e_part.METHOD]
        data.values[e_part.METHOD] = e_method.CREATE
        // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)

        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [sess1]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                newArticleId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, helpError.inputValuePartNumNotExpected.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('no method ', function (done) {
        // delete data.values[e_part.RECORD_INFO]
        delete data.values[e_part.METHOD]
        data.values[e_part.RECORD_INFO]={}
        // data.values[e_part.METHOD] = e_method.CREATE
        // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)

        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [sess1]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                newArticleId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, helpError.methodPartMustExistInDispatcher.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
})
