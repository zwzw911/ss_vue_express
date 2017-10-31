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

const controllerError=require('../../server/controller/impeach/impeach_setting/impeach_controllerError').controllerError

const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function

const calcResourceConfig=require('../../server/constant/config/calcResourceConfig')

describe('impeach: ', async function() {
    let user1Sess,user2Sess,user1Id,user2Id,articleId,articleId2,impeachId,data={values:{}}

    before('remove exists record', async function(){
        await API_helper.removeExistsRecord_async()
    })

    before('user1/2 recreate and login, then create article', async function () {
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=userInfo['sess']
        userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Sess=userInfo['sess']

        // console.log(`==============>createArticle_setToFinish_async tarts`)
        articleId=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        // console.log(`==============>createArticle_setToFinish_async end`)
        articleId2=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        console.log(`articleId2===========>${JSON.stringify(articleId2)}`)
        // await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
    })




    /*********************************************************************/
    /*****   create(因为都是internal field，所以没什么好检查的)      *****/
    /*********************************************************************/
    it('user2 create impeach for article, but use comment URL', function (done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId2,
        }
        request(app).post('/impeach/comment').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, helperError.fkValueNotExist('文档',articleId2).rc)
                done();
            });
    });

    it('user2 create impeach for article invalid(not in finished status)', function (done) {
        let data={}
        data.values={}
        data.values[e_part.RECORD_INFO]={
            // [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId2,
        }
        data.values[e_part.METHOD] = e_method.CREATE
        console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
        // return new Promise(function(resolve,reject){
            request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
                .end(function (err, res) {
                    // if (err) return done(err);
                    // console.log(`res ios ${JSON.stringify(res)}`)
                    let parsedRes = JSON.parse(res.text)
                    // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                    assert.deepStrictEqual(parsedRes.rc, helperError.fkValueNotExist('文档',articleId2).rc)
                    // return resolve(true)
                    // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                    done();
                });
        // })
    });

    it('user1 create impeach for article normally', async function () {
        impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articleId,userSess:user1Sess,app:app})
    });
    it('user1 create impeach for article again', function (done) {
        let data={}
        data.values={}
        data.values[e_part.RECORD_INFO]={
            // [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId,
        }
        data.values[e_part.METHOD] = e_method.CREATE
        // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
        // return new Promise(function(resolve,reject){
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, controllerError.articleAlreadyImpeached.rc)
                // return resolve(true)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
        // })
    });
    /*********************************************************************/
    /********************************   update    ***********************/
    /*********************************************************************/
    it('user2 try to update user1 impeach', function (done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId,
        }
        console.log(`data.values============>${JSON.stringify(data.values)}`)
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, controllerError.notAuthorized.rc)
                done();
            });
    });

    it('user1 update impeach with internal field impeachedArticleId', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId2,
        }
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.METHOD]=e_method.UPDATE
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                done();
            });
    });


    it('user1 update impeach with field value contain xss', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.TITLE]:'<alert>',
        }
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.METHOD]=e_method.UPDATE
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, helperError.XSSCheckFailed('title').rc)
                done();
            });
    });
})
