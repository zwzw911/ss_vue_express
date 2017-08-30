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
const e_impeachType=require('../../server/constant/enum/mongo').ImpeachType.DB

const common_operation_model=require('../../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../../server/model/mongo/dbModel')
const dbModelInArray=require('../../server/model/mongo/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helperError=require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/impeach/impeach_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper=require("../API_helper/db_operation_helper")
const testData=require('../testData')

const API_helper=require('../API_helper/API_helper')

const calcResourceConfig=require('../../server/constant/config/calcResourceConfig')

describe('impeach: ', async function() {
    let user1Sess,user2Sess,user1Id,user2Id,articleId,impeachId,data={values:{}}

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

    before('user1 create new article1', async function () {
        articleId=await API_helper.userCreateArticle_returnArticleId_async({userSess:user1Sess})
    });


    /*********************************************************************/
    /*********************    format      *******************************/
    /*********************************************************************/
    it('user2; no record_info and method', function (done) {
        data.values={}
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
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

        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
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
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
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
    it('user2 create impeach', async function () {
        impeachId=await API_helper.createImpeach_returnImpeachId_async({impeachType:e_impeachType.ARTICLE,articleId:articleId,userSess:user2Sess})
        // console.log(`impeach id is ========================>${impeachId}`)
    });

    /*********************************************************************/
    /********************************   update    ***********************/
    /*********************************************************************/
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
        })
    });

    it('user2 update impeach with fkField value not exist', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:'59a4f9fc429a1005747c9695'}
        }
        data.values[e_part.RECORD_ID]=impeachId
        data.values[e_part.METHOD]=e_method.UPDATE
        API_helper.updateImpeach({
            data:data,
            userSess:user2Sess,
            expectRc:helperError.fkValueNotExist().rc,
            done:done,
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
            expectRc:contollerError.inputSanityFailed.rc,
            done:done,
        })
    });
})
