/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const adminApp=require(`../../../express_admin/app`)
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
// const dbModelInArray=require('../../server/model/mongo/dbModelInArray')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelpError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper



// const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function

const controllerError=require('../../server/controller/article/article_setting/article_controllerError').controllerError

let baseUrl="/article/"
let userId  //create后存储对应的id，以便后续的update操作

let sess1,sess2,adminRootSess,data={values:{}}

describe('logic check for article: ', async function() {
    let url = '', finalUrl = baseUrl + url
    let user1Sess,user2Sess,user1Id,user2Id,article1Id,article2Id,impeachId,data={values:{}}
    let  folder2
    before('remove exists record', async function(){
        await API_helper.removeExistsRecord_async()
    })

    before('user1/2 recreate and login; user1 create article1', async function () {
        let user1Info=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=user1Info['sess']
        let user2Info=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Sess=user2Info['sess']
        
        article1Id=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        // await API_helper.createUser_async({userData:,app:app})
        // user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
    })
    before('insert user2 penalize for both article and comment', async function () {
        let adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        // console.log(`userInfo==============>${JSON.stringify(userInfo)}`)
        // =userInfo[`sess`]

        let penalizeInfo={}
        //use2 penalize create article
        penalizeInfo[e_field.ADMIN_PENALIZE.REASON] = `test user2 penalize no create article`
        penalizeInfo[e_field.ADMIN_PENALIZE.DURATION] = 1
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_ARTICLE
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfo,penalizedUserData:testData.user.user2,adminApp:adminApp})

        //use2 penalize create comment
        penalizeInfo[e_field.ADMIN_PENALIZE.REASON] = `test user2 penalize no create comment`
        penalizeInfo[e_field.ADMIN_PENALIZE.DURATION] = 1
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_COMMENT
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfo,penalizedUserData:testData.user.user2,adminApp:adminApp})

    })
    before('get user2 folder', async function () {
        let tmpResult=await db_operation_helper.getUserFolderId_async(testData.user.user2)
        folder2 = tmpResult
        console.log(`folder2======>${JSON.stringify(folder2)}`)
        // done()
        // return Promise.resolve({rc:0})
    })

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    it('update article1 not user owner', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = article1Id
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = 'testtesttesttesttesttest'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] = 'test'
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], controllerError.notAuthorized.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update without field value changed', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = article1Id
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = 'testtesttesttesttesttest'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] =
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

    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/
    it('update article with non exist folder id', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = article1Id
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID] = article1Id
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]['value'] =
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
        data.values[e_part.RECORD_ID] = article1Id
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.CATEGORY_ID] = article1Id
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.CATEGORY_ID]['value'] =
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], controllerHelpError.fkValueNotExist().rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    it('update article with htmlContent sanity failed', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = article1Id
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] =`<script></script>asdf`
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] =
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], controllerHelpError.XSSCheckFailed(`htmlContent`).rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('update article with folder not owner', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = article1Id
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID] = folder2
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.FOLDER_ID]['value'] =
        console.log(`docvalues====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'], controllerError.notAuthorizedFolder.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    it('update article content normally', function (done) {
        data.values = {}
        data.values[e_part.RECORD_ID] = article1Id
        data.values[e_part.METHOD] = e_method.UPDATE
        data.values[e_part.RECORD_INFO] = {}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT] = 'update article with attachment exist'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE.HTML_CONTENT]['value'] =
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
