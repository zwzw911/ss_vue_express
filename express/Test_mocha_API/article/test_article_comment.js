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

const contollerError=require('../../server/controller/article/article_comment_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper=require("../test_helper")
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
        let tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:condition})

        let value={}
        value[e_field.ADMIN_PENALIZE.PUNISHED_ID]=tmpResult.msg[0]['_id']
        value[e_field.ADMIN_PENALIZE.CREATOR_ID]=tmpResult.msg[0]['_id']
        value[e_field.ADMIN_PENALIZE.REASON]=`test user2 penalize`
        value[e_field.ADMIN_PENALIZE.DURATION]=1

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE]=e_penalizeType.NO_ARTICLE
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=e_penalizeSubType.CREATE
        await common_operation_model.create({dbModel:e_dbModel.admin_penalize,value:value})

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE]=e_penalizeType.NO_COMMENT
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=e_penalizeSubType.CREATE
        await common_operation_model.create({dbModel:e_dbModel.admin_penalize,value:value})

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



    /*                              comment                                 */
    it('create comment without login', function(done) {
        url = 'comment'
        finalUrl=baseUrl+url
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // data.values[e_part.RECORD_ID]=articleId

        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],contollerError.userNotLoginCantCreateComment.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('create comment with articleId not exist', function(done) {
        url = 'comment'
        finalUrl=baseUrl+url
        data.values={}
        // data.values[e_part.RECORD_ID]=articleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']='correct comment for newArticle'
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']='59817e549a1a3a4bac3a55f7'

        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        console.log(`finalUrl====>${JSON.stringify(finalUrl)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],helpError.fkValueNotExist().rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('user1 correct comment for newArticle', function(done) {
        url = 'comment'
        finalUrl=baseUrl+url
        data.values={}
        // data.values[e_part.RECORD_ID]=articleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']='correct comment for newArticle'
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']=articleId

        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        console.log(`finalUrl====>${JSON.stringify(finalUrl)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('user2 correct comment with penalize', function(done) {
        url = 'comment'
        finalUrl=baseUrl+url
        data.values={}
        // data.values[e_part.RECORD_ID]=articleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']='correct comment for newArticle'
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']=articleId


        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess2]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],contollerError.userInPenalizeNoCommentCreate.rc)
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
