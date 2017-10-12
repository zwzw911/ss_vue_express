/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_field=require('../../server/constant/genEnum/DB_field').Field
// const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
// const e_penalizeType=require('../../server/constant/enum/mongo').PenalizeType.DB
// const e_penalizeSubType=require('../../server/constant/enum/mongo').PenalizeSubType.DB

const common_operation_model=server_common_file_require.common_operation_model//require('../../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../../server/constant/genEnum/dbModel')
const dbModelInArray=require('../../server/constant/genEnum/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

// const validateError=server_common_file_require.validateError
const helpError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/article/liekDislike_logic').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy//require('../../server/function/assist/misc').objectDeepCopy

//const test_helper=require("../API_helper/db_operation_helper")
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper

let baseUrl="/article/"
let userId  //create后存储对应的id，以便后续的update操作

let sess1,sess2,data={values:{}}


describe('create new likeDislike for article ', async function() {
    let url = 'likeDislike', finalUrl = baseUrl + url

    let articleId,userId
    before('user1 login correct', async function () {
        sess1=await API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
    })

    before('get user1 id', async function(){
        let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:{[e_field.USER.ACCOUNT]:testData.user.user1ForModel[e_field.USER.ACCOUNT]}})
        // console.log(`tmpResult=====> ${JSON.stringify(tmpResult)}`)
        userId=tmpResult[0]['_id']
    });

    //create new article
    before('create correct article', async function() {
        articleId=await API_helper.createNewArticle_returnArticleId_async({userSess:sess1,app:app})
    });

    it('articleId not exist', function(done) {
        data.values={}
        // console.log(`finalUrl ===>${JSON.stringify(finalUrl)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={
            [e_field.LIKE_DISLIKE.ARTICLE_ID]:'598ebecc1fb29c1ca49da342',
            [e_field.LIKE_DISLIKE.LIKE]:false,
        }
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,helpError.fkValueNotExist().rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

/*    it('userId not exist(modify in likeDislike_logic)', function(done) {
        data.values={}
        console.log(`finalUrl ===>${JSON.stringify(finalUrl)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={[e_field.LIKE_DISLIKE.ARTICLE_ID]:{value:articleId},[e_field.LIKE_DISLIKE.LIKE]:{value:false}}
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,helpError.fkValueNotExist().rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });*/

    it('field is not boolean', function(done) {
        data.values={}
        console.log(`finalUrl ===>${JSON.stringify(finalUrl)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={
            [e_field.LIKE_DISLIKE.ARTICLE_ID]:articleId,
            [e_field.LIKE_DISLIKE.LIKE]:'true',
        }
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,99999)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('correct like', function(done) {
        data.values={}
        console.log(`finalUrl ===>${JSON.stringify(finalUrl)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={
            [e_field.LIKE_DISLIKE.ARTICLE_ID]:articleId,
            [e_field.LIKE_DISLIKE.LIKE]:true,
        }
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('try like(dislike) again', function(done) {
        data.values={}
        console.log(`finalUrl ===>${JSON.stringify(finalUrl)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={
            [e_field.LIKE_DISLIKE.ARTICLE_ID]:articleId,
            [e_field.LIKE_DISLIKE.LIKE]:true,
        }
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,contollerError.alreadyLikeDislike.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
})