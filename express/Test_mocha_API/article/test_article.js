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

const contollerError=require('../../server/controller/article/article_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper=require("../API_helper/db_operation_helper")
const testData=require('../testData')

let baseUrl="/article/"
let userId  //create后存储对应的id，以便后续的update操作

let sess1,sess2,data={values:{}}

const API_helper=require('../API_helper/API_helper')

describe('create new article and update, then create new comment: ', async function() {
    let url = '', finalUrl = baseUrl + url
    let user1Sess,user2Sess,user1Id,user2Id,articleId,impeachId,data={values:{}}
    let newArticleId, folder2
    before('remove exists record', async function(){
        await API_helper.removeExistsRecord_async()
    })

    before('user1 create and login', async function () {
        await API_helper.createUser_async({userData:testData.user.user1})
        user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1})
    })
    before('user2 create and login', async function () {
        await API_helper.createUser_async({userData:testData.user.user2})
        user2Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user2})
    })
    before('insert user2 penalize for both article and comment', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp = {}
        user1Tmp[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD] = testData.user.user2[e_field.USER.PASSWORD]

        let condition = {}
        condition[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]['value']
        let tmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.user, condition: condition})

        let value = {}
        value[e_field.ADMIN_PENALIZE.PUNISHED_ID] = tmpResult[0]['_id']
        value[e_field.ADMIN_PENALIZE.CREATOR_ID] = tmpResult[0]['_id']
        value[e_field.ADMIN_PENALIZE.REASON] = `test user2 penalize`
        value[e_field.ADMIN_PENALIZE.DURATION] = 1

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_ARTICLE
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await common_operation_model.create_returnRecord_async({dbModel: e_dbModel.admin_penalize, value: value})

        //use2 penalize create article
        value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_COMMENT
        value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await common_operation_model.create_returnRecord_async({dbModel: e_dbModel.admin_penalize, value: value})

        // done()
        // return Promise.resolve({rc:0})
    })
    before('get user2 folder', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp = {}
        user1Tmp[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD] = testData.user.user2[e_field.USER.PASSWORD]

        let condition = {}
        condition[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]['value']
        let tmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.user, condition: condition})

        condition = {}
        condition[e_field.FOLDER.AUTHOR_ID] = tmpResult[0]['_id']
        let options = {$sort: {cDate: 1}}
        tmpResult = await common_operation_model.find_returnRecords_async({
            dbModel: e_dbModel.folder,
            condition: condition,
            options: options
        })
        folder2 = tmpResult[0]['_id']

        console.log(`folder2======>${JSON.stringify(folder2)}`)
        // done()
        // return Promise.resolve({rc:0})
    })
    /*    before('remove all tagsId and article',async  function() {

            let tmpResult=await common_operation_model.removeAll({dbModel:e_dbModel.tag})
            tmpResult=await common_operation_model.removeAll({dbModel:e_dbModel.article})
            // done()
            // return Promise.resolve({rc:0})
        })*/

    it('new article without sess1', function (done) {
        // data.values[e_part.RECORD_INFO]={name:{value:'my article'}}
        data.values[e_part.METHOD] = e_method.CREATE
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, contollerError.userNotLoginCantCreate.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('new article with additional part', function (done) {
        data.values[e_part.RECORD_INFO] = {name: {value: 'my article'}}
        data.values[e_part.METHOD] = e_method.CREATE
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
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

    it('correct article', function (done) {
        delete data.values[e_part.RECORD_INFO]
        console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD] = e_method.CREATE
        console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                newArticleId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('update article without sess1', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = ''
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, contollerError.userNotLoginCantUpdate.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('update article with wrong field value', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] = ''
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.msg[e_field.ARTICLE.HTML_CONTENT]['rc'], browserInputRule.article.htmlContent.require.error.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with not exist field', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO]['notExist'] = {}
        data.values[e_part.RECORD_INFO]['notExist']['value'] = ''
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, validateError.validateFormat.recordInfoFiledRuleNotDefine.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });


    it('update article not user owner', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] = 'test'
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], contollerError.notAuthorized.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with htmlContent sanity failed', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] = `<script></script>`
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], contollerError.htmlContentSanityFailed.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with tag not exist', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.TAGS] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.TAGS]['value'] = [testData.tag.tag1.name.value]
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], 0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with non exist folder id', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]['value'] = newArticleId
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with non exist category id', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.CATEGORY_ID] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.CATEGORY_ID]['value'] = newArticleId
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], helpError.fkValueNotExist().rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with folder not owner', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]['value'] = folder2
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], contollerError.notAuthorizedFolder.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('update article content normally', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = newArticleId
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] = 'update article with attachment exist'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID] = {}
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID]['value'] = ['59817e549a1a3a4bac3a55f7']
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_IMAGES_ID] = {}
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_IMAGES_ID]['value'] = ['59817e549a1a3a4bac3a55f7']
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_COMMENTS_ID] = {}
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_COMMENTS_ID]['value'] = ['59817e549a1a3a4bac3a55f7']
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], 0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });


})
