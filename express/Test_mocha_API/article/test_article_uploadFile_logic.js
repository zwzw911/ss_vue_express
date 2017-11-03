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
const helpError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper

const controllerError=require('../../server/controller/article/article_upload_file_setting/article_upload_file_controllerError').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

// const test_helper=require("../API_helper/db_operation_helper")
const db_operation_helper=server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function

let baseUrl="/article/"
let userId  //create后存储对应的id，以便后续的update操作

let user1Sess,user2Sess,data={values:{}}







describe('logic check for upload:', async function() {
    let url=`articleImage`,finalUrl

    let articleId
    before('user1/user2 login correct',async function () {
        let user1Info=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=user1Info['sess']
        let user2Info=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Sess=user2Info['sess']

    })

    //create new article
    before('user1 correct article', async function() {
        articleId=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})

    });


    /***********************************************************************/
    /**********************   上传文档图片     *****************************/
    /***********************************************************************/
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/

    it('user2 upload image for article1', function(done) {
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_ID]=articleId
        finalUrl=baseUrl+url
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user2Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],controllerError.notArticleAuthorCantInsertFile.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    //无法测试上传文件（data和attach不能同时使用，但是update又需要上传record_info）
/*    it('user1 upload image for article1 successful', function(done) {
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_ID]=articleId
        finalUrl=baseUrl+url
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user2Sess]).field('name','file')//.send(data)
            .attach('file','H:/ss_vue_express/test_data/gm_test.png')
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });*/

    /*it('user1 upload image for newArticle correct(cant test since supertest not support data and file upload simulatus)', function(done) {
        url = 'articleImage'
        finalUrl=baseUrl+url
        // delete data.values
        data.values={}
        data.values[e_part.METHOD]=e_method.UPDATE
        data.values[e_part.RECORD_ID]='598c51be19f1b317c8ddd8f7'
        // send(data).
        /!*request(app).post(finalUrl).field('name','file')
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
            });*!/
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes['rc'],validateError.validateFormat.inputValuePartNotMatch.rc)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });*/
})


