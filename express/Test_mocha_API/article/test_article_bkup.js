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

/*describe('prepare:', function() {
    // let dbModleToBeDelete=[dbModel.user,dbModel.sugar,dbModel.]


    it('remove all record', async function(){
        await test_helper.deleteAllModelRecord_async({})
/!*        // let skipColl=[e_coll.STORE_PATH,e_coll.CATEGORY]
        for(let singleDbModel of dbModelInArray){
            // if(-1===skipColl.indexOf(singleDbModel.modelName)){
                console.log(`model name======>${singleDbModel.modelName}`)
                await common_operation_model.removeAll({dbModel:singleDbModel})
            // }

        }*!/
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
    it('user2 register', function(done) {
        data.values[e_part.RECORD_INFO]=testData.user.user2//
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

})*/





describe('create new article and update, then create new comment: ', async function() {
    let url = '', finalUrl = baseUrl + url

    let newArticleId,folder2
    before('user1 login correct', function(done) {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp={}
        user1Tmp[e_field.USER.ACCOUNT]=testData.user.user1[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD]=testData.user.user1[e_field.USER.PASSWORD]
        // console.log(`user1Tmp ===>${JSON.stringify(user1Tmp)}`)
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        data.values[e_part.METHOD]=e_method.MATCH
        // console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`user1 login sess ======> ${JSON.stringify(res['header']['set-cookie'][0].split(';')[0])}`)
                sess1=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
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
    before('get user2 folder',async  function() {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp={}
        user1Tmp[e_field.USER.ACCOUNT]=testData.user.user2[e_field.USER.ACCOUNT]
        user1Tmp[e_field.USER.PASSWORD]=testData.user.user2[e_field.USER.PASSWORD]

        let condition={}
        condition[e_field.USER.ACCOUNT]=testData.user.user2[e_field.USER.ACCOUNT]['value']
        let tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:condition})

        condition={}
        condition[e_field.FOLDER.AUTHOR_ID]=tmpResult.msg[0]['_id']
        let options={$sort:{cDate:1}}
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.folder,condition:condition,options:options})
        folder2=tmpResult.msg[0]['_id']

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

    it('new article without sess1', function(done) {
        // data.values[e_part.RECORD_INFO]={name:{value:'my article'}}
        data.values[e_part.METHOD]=e_method.CREATE
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.userNotLoginCantCreate.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('new article with additional part', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'my article'}}
        data.values[e_part.METHOD]=e_method.CREATE
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.inputValuePartNumNotExpected.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('correct article', function(done) {
        delete data.values[e_part.RECORD_INFO]
        console.log(`sess1 ===>${JSON.stringify(sess1)}`)
        console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.CREATE
        console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                newArticleId=parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('update article without sess1', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]=''
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.userNotLoginCantUpdate.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('update article with wrong field value', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value']=''
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.msg[e_field.ARTICLE.HTML_CONTENT]['rc'],browserInputRule.article.htmlContent.require.error.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with not exist field', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO]['notExist']={}
        data.values[e_part.RECORD_INFO]['notExist']['value']=''
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.recordInfoFiledRuleNotDefine.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });


    it('update article not user owner', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value']='test'
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess2]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],contollerError.notAuthorized.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with htmlContent sanity failed', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value']=`<script></script>`
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],contollerError.htmlContentSanityFailed.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with tag not exist', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.TAGS_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.TAGS_ID]['value']=[testData.tag.tag1.name.value]
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
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
    it('update article with non exist folder id', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]['value']=newArticleId
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with non exist category id', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.CATEGORY_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.CATEGORY_ID]['value']=newArticleId
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
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
    it('update article with folder not owner', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]['value']=folder2
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess1]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],contollerError.notAuthorizedFolder.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('update article with attachment exist while server delete attachment due to it is internal field', function(done) {
        data.values={}
        data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value']='update article with attachment exist'
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID]['value']=['59817e549a1a3a4bac3a55f7']
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_IMAGES_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_IMAGES_ID]['value']=['59817e549a1a3a4bac3a55f7']
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_COMMENTS_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.ARTICLE_COMMENTS_ID]['value']=['59817e549a1a3a4bac3a55f7']
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
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


    /***********************************************************************/
    /***********************************************************************/
    /***********************************************************************/
    /*                              comment                                 */
    it('create comment without login', function(done) {
        url = 'comment'
        finalUrl=baseUrl+url
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // data.values[e_part.RECORD_ID]=newArticleId

        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
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
        // data.values[e_part.RECORD_ID]=newArticleId
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
        // data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']='correct comment for newArticle'
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']=newArticleId

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
        // data.values[e_part.RECORD_ID]=newArticleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']='correct comment for newArticle'
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']=newArticleId


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
                // console.log(`res ios ${JSON.stringify(res)}`)
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
