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
const dbModelInArray=require('../../server/constant/genEnum/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/va').validateError
const helpError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper

const controllerError=require('../../server/controller/article/article_comment_setting/article_comment_controllerError').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

// const test_helper=require("../API_helper/db_operation_helper")
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function

let baseUrl="/article/"
let userId,user1Sess,user2Sess,adminRootSess  //create后存储对应的id，以便后续的update操作

let data={values:{}}

describe('create new comment: ', async function() {
    let url,finalUrl
    url='comment'
    finalUrl=baseUrl+url

    let articleId,userId
    before('user1 login correct', async function () {
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=userInfo['sess']
        userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Sess=userInfo['sess']
    })

    /*before('insert user2 penalize for both article and comment',async  function() {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        // console.log(`userInfo==============>${JSON.stringify(userInfo)}`)
        // =userInfo[`sess`]

        let penalizeInfo={}
        //use2 penalize create article
        penalizeInfo[e_field.ADMIN_PENALIZE.REASON] = `test user2 penalize no create article`
        penalizeInfo[e_field.ADMIN_PENALIZE.DURATION] = 1
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_ARTICLE
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await API_helper.deletePenalize_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfo,pernalizedUserData:testData.user.user2,adminApp:adminApp})
        await API_helper.createPenalize_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfo,pernalizedUserData:testData.user.user2,adminApp:adminApp})

        //use2 penalize create comment
        penalizeInfo[e_field.ADMIN_PENALIZE.REASON] = `test user2 penalize no create comment`
        penalizeInfo[e_field.ADMIN_PENALIZE.DURATION] = 1
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_TYPE] = e_penalizeType.NO_COMMENT
        penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE] = e_penalizeSubType.CREATE
        await API_helper.deletePenalize_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfo,pernalizedUserData:testData.user.user2,adminApp:adminApp})
        await API_helper.createPenalize_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfo,pernalizedUserData:testData.user.user2,adminApp:adminApp})

    })*/

    //user1 create new article
    before('user1 correct article', async function() {
        articleId=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
    });


    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    it('user1 create comment with articleId not exist', function(done) {
        // url = 'comment'
        // finalUrl=baseUrl+url
        data.values={}
        // data.values[e_part.RECORD_ID]=articleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]='correct comment for newArticle'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']=
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]='59817e549a1a3a4bac3a55f7'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']=

        // console.log(`docvalues====>${JSON.stringify(data.values)}`)
        // console.log(`finalUrl====>${JSON.stringify(finalUrl)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
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
        // url = 'comment'
        // finalUrl=baseUrl+url
        data.values={}
        // data.values[e_part.RECORD_ID]=articleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]='correct comment for newArticle'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']=
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]=articleId
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']=

        // console.log(`docvalues====>${JSON.stringify(data.values)}`)
        // console.log(`finalUrl====>${JSON.stringify(finalUrl)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
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

    /*it('user2 correct comment with penalize', function(done) {
        // url = 'comment'
        // finalUrl=baseUrl+url
        data.values={}
        // data.values[e_part.RECORD_ID]=articleId
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]='correct comment for newArticle'
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.CONTENT]['value']=
        data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]=articleId
        // data.values[e_part.RECORD_INFO][e_field.ARTICLE_COMMENT.ARTICLE_ID]['value']=


        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user2Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],controllerError.userInPenalizeNoCommentCreate.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });*/



})



