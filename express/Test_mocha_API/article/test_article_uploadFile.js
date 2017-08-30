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

const common_operation_model=require('../../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../../server/model/mongo/dbModel')
const dbModelInArray=require('../../server/model/mongo/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helpError=require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/article/article_upload_file_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper=require("../API_helper/db_operation_helper")
const testData=require('../testData')

let baseUrl="/article/"
let userId  //create后存储对应的id，以便后续的update操作

let sess1,sess2,data={values:{}}







describe('create new comment: ', async function() {
    let url,finalUrl


    let articleId,userId
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
                console.log(`user1 login sess ======> ${JSON.stringify(res['header']['set-cookie'][0].split(';')[0])}`)
                sess1 = res['header']['set-cookie'][0].split(';')[0]
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    before('user2 login correct', function(done) {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp={}
        user1Tmp[e_field.USER.ACCOUNT]=testData.user.user2[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD]=testData.user.user2[e_field.USER.PASSWORD]
        // console.log(`user1Tmp ===>${JSON.stringify(user1Tmp)}`)
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        data.values[e_part.METHOD]=e_method.MATCH
        // console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie'][0])}`)
                sess2=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    before('insert user2 penalize for both article and comment',async  function() {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp={}
        user1Tmp[e_field.USER.ACCOUNT]=testData.user.user2[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD]=testData.user.user2[e_field.USER.PASSWORD]

        let condition={}
        condition[e_field.USER.ACCOUNT]=testData.user.user2[e_field.USER.ACCOUNT]['value']
        let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:condition})

        let value={}
        value[e_field.ADMIN_PENALIZE.PUNISHED_ID]=tmpResult[0]['_id']
        value[e_field.ADMIN_PENALIZE.CREATOR_ID]=tmpResult[0]['_id']
        value[e_field.ADMIN_PENALIZE.REASON]=`test user2 penalize`
        value[e_field.ADMIN_PENALIZE.DURATION]=1

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE]=e_penalizeType.NO_ARTICLE
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=e_penalizeSubType.CREATE
        await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_penalize,value:value})

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE]=e_penalizeType.NO_COMMENT
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=e_penalizeSubType.CREATE
        await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_penalize,value:value})

        // done()
        // return Promise.resolve({rc:0})
    })
/*    before('get user1 id', async function(){
        let tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{[e_field.USER.ACCOUNT]:testData.user.user1ForModel[e_field.USER.ACCOUNT]}})
        // console.log(`tmpResult=====> ${JSON.stringify(tmpResult)}`)
        userId=tmpResult.msg[0]['_id']
        /!*        tmpResult=await common_operation_model.find({dbModel:e_dbModel.article,condition:{[e_field.ARTICLE.AUTHOR_ID]:userId}})
        // console.log(`tmpResult=====> ${JSON.stringify(tmpResult)}`)
        articleId=tmpResult.msg[0]['_id']

        console.log(`userid=====> ${JSON.stringify(userId)}`)
        console.log(`articleId=====> ${JSON.stringify(articleId)}`)*!/
    });*/


    //create new article
    before('correct article', function(done) {
        data.values={}
        // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });






    /***********************************************************************/
    /**********************   上传文档图片     *****************************/
    /***********************************************************************/
    it('user1 upload image for newArticle without sess', function(done) {
        url = 'articleImage'
        finalUrl=baseUrl+url
        delete data.values
        delete data.params
        data.params={}
        data.params[e_part.METHOD]='0'
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],contollerError.userNotLoginCantCreateArticleImage.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('user1 upload image for newArticle without params(simdotor)', function(done) {
        url = 'articleImage'
        finalUrl=baseUrl+url
        delete data.values
        delete data.params
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],validateError.validateFormat.valuesUndefined.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('user1 upload image for newArticle without method', function(done) {
        url = 'articleImage'
        finalUrl=baseUrl+url
        delete data.values
        delete data.params
        data.params={}
        data.params[e_part.RECORD_ID]={value:'5987d1e637e889071c527add'}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],helpError.methodPartMustExistInDispatcher.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('user1 upload image for newArticle without recordid', function(done) {
        url = 'articleImage'
        finalUrl=baseUrl+url
        delete data.values
        delete data.params
        data.params={}
        data.params[e_part.METHOD]='0'
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],validateError.validateFormat.inputValuePartNumNotExpected.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('user1 upload image for newArticle with unexpected part', function(done) {
        url = 'articleImage'
        finalUrl=baseUrl+url
        delete data.values
        data.params={}
        data.params[e_part.METHOD]='0'
        data.params['unknown Part']='0'
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],validateError.validateFormat.inputValuePartNotMatch.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });


    it('user1 upload image for newArticle correct', function(done) {
        url = 'articleImage'
        finalUrl=baseUrl+url
        delete data.values
        data.params={}
        data.params[e_part.METHOD]=e_method.CREATE
        data.params[e_part.RECORD_ID]='598c51be19f1b317c8ddd8f7'
        // send(data).
        /*request(app).post(finalUrl).field('name','file')
        // .attach('file','H:/ss_vue_express/培训结果1.png')
            .attach('file','H:/ss_vue_express/test_data/gm_test.png')
            // .attach('file','H:/ss_vue_express/gm_test.png')
            .set('Cookie',[sess1])//.send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                console.log(`parsedRes ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });*/
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],validateError.validateFormat.inputValuePartNotMatch.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
})


/*
describe('create new likeDislike for article ', async function() {
    let url = '', finalUrl = baseUrl + url

    let articleId,userId
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
                console.log(`user1 login sess ======> ${JSON.stringify(res['header']['set-cookie'][0].split(';')[0])}`)
                sess1 = res['header']['set-cookie'][0].split(';')[0]
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    before('get user1 id', async function(){
        let tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{[e_field.USER.ACCOUNT]:testData.user.user1ForModel[e_field.USER.ACCOUNT]}})
        // console.log(`tmpResult=====> ${JSON.stringify(tmpResult)}`)
        userId=tmpResult.msg[0]['_id']
        /!*        tmpResult=await common_operation_model.find({dbModel:e_dbModel.article,condition:{[e_field.ARTICLE.AUTHOR_ID]:userId}})
         // console.log(`tmpResult=====> ${JSON.stringify(tmpResult)}`)
         articleId=tmpResult.msg[0]['_id']

         console.log(`userid=====> ${JSON.stringify(userId)}`)
         console.log(`articleId=====> ${JSON.stringify(articleId)}`)*!/
    });

    before('create new article for user1', async function(){
        let tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{[e_field.USER.ACCOUNT]:testData.user.user1ForModel[e_field.USER.ACCOUNT]}})
        // console.log(`tmpResult=====> ${JSON.stringify(tmpResult)}`)
        userId=tmpResult.msg[0]['_id']
        /!*        tmpResult=await common_operation_model.find({dbModel:e_dbModel.article,condition:{[e_field.ARTICLE.AUTHOR_ID]:userId}})
         // console.log(`tmpResult=====> ${JSON.stringify(tmpResult)}`)
         articleId=tmpResult.msg[0]['_id']

         console.log(`userid=====> ${JSON.stringify(userId)}`)
         console.log(`articleId=====> ${JSON.stringify(articleId)}`)*!/
    });

    //create new article
    before('correct article', function(done) {
        data.values={}
        // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('correct article', function(done) {
        data.values={}
        // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
})*/
