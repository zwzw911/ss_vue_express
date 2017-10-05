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
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')
const dbModelInArray=require('../../server/constant/genEnum/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/va').validateError
const helperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper

const controllerError=require('../../server/controller/impeach/impeach_logic').controllerError

const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')

const calcResourceConfig=require('../../server/constant/config/calcResourceConfig')

describe('impeach: ', async function() {
    let user1Sess,user2Sess,user1Id,user2Id,articleId,articleId2,impeachId,data={values:{}}

    before('remove exists record', async function(){
        await API_helper.removeExistsRecord_async()
    })

    before('user1 create and login', async function () {
        await API_helper.createUser_async({userData:testData.user.user1,app:app})
        user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
    })
    before('user2 create and login', async function () {
        await API_helper.createUser_async({userData:testData.user.user2,app:app})
        user2Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user2,app:app})
    })

    before('user1 create new article1', async function () {
        articleId=await API_helper.userCreateArticle_returnArticleId_async({userSess:user1Sess,app:app})
    });

    before('user1 create new article2', async function () {
        articleId2=await API_helper.userCreateArticle_returnArticleId_async({userSess:user1Sess,app:app})
    });
    /*********************************************************************/
    /*********************    format      *******************************/
    /*********************************************************************/
    it('user2; no record_info and method', function (done) {
        data.values={}
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, helperError.methodPartMustExistInDispatcher.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('user2; no record_info ', function (done) {
        data.values={}
        data.values[e_part.METHOD] = e_method.CREATE

        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)

                assert.deepStrictEqual(parsedRes.rc, validateError.validateFormat.inputValuePartNumNotExpected.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('user2; no method ', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={}
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, helperError.methodPartMustExistInDispatcher.rc)
                done();
            });
    });

    /*********************************************************************/
    /*****   create(因为都是internal field，所以没什么好检查的)      *****/
    /*********************************************************************/
    it('user2 create impeach for article, but use comment URL', function (done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:articleId},
        }
        request(app).post('/impeach/comment').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, controllerError.impeachObjectNotExist.rc)
                done();
            });
    });
    it('user2 create impeach for article, but use wrong URL', function (done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:articleId},
        }
        request(app).post('/impeach').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, controllerError.notDefineImpeachType.rc)
                done();
            });
    });
    it('user2 create impeach for article normally', async function () {
        impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articleId,userSess:user2Sess,app:app})
    });
    /*********************************************************************/
    /********************************   update    ***********************/
    /*********************************************************************/
    it('user2 update impeach, but wrong URL', function (done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_ID]=articleId
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:articleId},
        }
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, controllerError.impeachTypeNotAllow.rc)
                done();
            });
    });
    it('user2 update impeach with internal field', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACH_IMAGES_ID]:{value:[impeachId]}
        }
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.METHOD]=e_method.UPDATE
         API_helper.updateImpeach({
             data:data,
             userSess:user2Sess,
             expectRc:validateError.validateFormat.recordInfoFiledRuleNotDefine.rc,
             done:done,
             app:app,
         })
    });
    it('user2 update impeach with internal field impeachedArticleId', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:articleId2}
        }
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.METHOD]=e_method.UPDATE
        API_helper.updateImpeach({
            data:data,
            userSess:user2Sess,
            expectRc:0,
            done:done,
            app:app,
        })
    });
    it('user2 update impeach with field value not match rule', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.TITLE]:{value:''}
        }
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.METHOD]=e_method.UPDATE
        API_helper.updateImpeach({
            data:data,
            userSess:user2Sess,
            expectRc:99999,
            done:done,
            app:app,
        })
    });

    it('user2 update impeach with field value contain xss', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.TITLE]:{value:'<alert>'}
        }
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.METHOD]=e_method.UPDATE
        API_helper.updateImpeach({
            data:data,
            userSess:user2Sess,
            expectRc:controllerError.inputSanityFailed.rc,
            done:done,
            app:app,
        })
    });
})
