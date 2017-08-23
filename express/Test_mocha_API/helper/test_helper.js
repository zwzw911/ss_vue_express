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
const e_articleStatus=require('../../server/constant/enum/mongo').ArticleStatus.DB

const e_resourceProfileType=require('../../server/constant/enum/mongo').ResourceProfileType.DB
const e_resourceProfileRange=require('../../server/constant/enum/mongo').ResourceProfileRange.DB
const e_resourceType=require('../../server/constant/enum/node').ResourceType

const e_impeachType=require('../../server/constant/enum/mongo').ImpeachType.DB

const common_operation_model=require('../../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../../server/model/mongo/dbModel')
const dbModelInArray=require('../../server/model/mongo/dbModelInArray')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helpError=require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/article/article_logic').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

const test_helper=require("../test_helper_db_operate")
const testData=require('../testData')
const helper=require('../../server/controller/helper')

const test_helper_db_operate=require('../test_helper_db_operate')

const initSettingObject=require('../../server/constant/enum/initSettingObject').iniSettingObject
let tmpResult



describe('helpe=>XSS ', async function() {

    it('test XSS', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let content='<script>'
        let error={rc:1}
        helper.contentXSSCheck_async({content:content,error:error}).then(
            (res)=>{},
            (err)=>{
                // console.log(`xss====>${JSON.stringify(err)}`)
                assert.deepStrictEqual(err.rc, error.rc)
            }
        )

    })
})

describe('help=>calcExistResource_async ', async function() {
    let user1Sess,user2Sess,user1Id,user2Id,articleId,impeachId,data={values:{}}

    before('remove exists record', async function(){
        await test_helper_db_operate.deleteAllModelRecord_async({})
    })

    before('user1 && user2 register', function(done) {
        data.values[e_part.RECORD_INFO]=testData.user.user1//
        data.values.method=e_method.CREATE
        request(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)

            });
        data.values[e_part.RECORD_INFO]=testData.user.user2//
        request(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                done();
            });
    });

    before('user1 && user2 login correct', function(done) {
        data.values.method=e_method.MATCH
        let userTmp=objectDeepCopy(testData.user.user1)
        delete userTmp['name']
        delete userTmp['userType']
        data.values[e_part.RECORD_INFO]=userTmp//,notExist:{value:123}
        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                user1Sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                // done();
            });

        userTmp=objectDeepCopy(testData.user.user2)
        delete userTmp['name']
        delete userTmp['userType']
        data.values[e_part.RECORD_INFO]=userTmp//,notExist:{value:123}
        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                user2Sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    before('user1 create article', function (done) {
        data.values={}
        data.values[e_part.METHOD] = e_method.CREATE
        console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie', [user1Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                articleId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });

    before('get user1 && user2 id', async function(){
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{account:testData.user.user1ForModel.account}})
        // console.log(`user1Id result===================================>${JSON.stringify(tmpResult)}`)
        user1Id=tmpResult.msg[0]['_id']
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.user,condition:{account:testData.user.user2ForModel.account}})
        user2Id=tmpResult.msg[0]['_id']
    })


    before('user2 create impeach', function (done) {
        data.values={}
        data.values[e_part.RECORD_INFO]={
            // [e_field.IMPEACH.IMPEACHED_USER_ID]:{value:user1Id},
            [e_field.IMPEACH.IMPEACH_TYPE]:{value:e_impeachType.ARTICLE},
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:{value:articleId},
        }
        data.values[e_part.METHOD] = e_method.CREATE
        console.log(`data.values ===>${JSON.stringify(data.values)}`)
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [user2Sess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`parsedRes of impeach: ${JSON.stringify(parsedRes)}`)
                impeachId = parsedRes['msg']['_id']
                assert.deepStrictEqual(parsedRes.rc, 0)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    before(`get user2's impeach id`, async function(){
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.impeach,condition:{
            [e_field.IMPEACH.CREATOR_ID]:user2Id}})
        // console.log(`user1Id result===================================>${JSON.stringify(tmpResult)}`)
        impeachId=tmpResult.msg[0]['_id']
    })

    before(`user2 insert image for impeach`, async function(){
        let commonPart= {
            [e_field.IMPEACH_IMAGE.AUTHOR_ID]: user2Id,
            [e_field.IMPEACH_IMAGE.REFERENCE_ID]: impeachId,
            [e_field.IMPEACH_IMAGE.REFERENCE_COLL]: e_coll.IMPEACH,
            [e_field.IMPEACH_IMAGE.PATH_ID]: initSettingObject.store_path.IMPEACH_IMAGE.impeachImage1.id,
        }
        let images=[
            {sizeInMb:1.5,name:'test1.png',hashName:'9ea7925c965967e978aecbb5fcb0ec3d.png'},
            {sizeInMb:1.7,name:'test2.png',hashName:'9ea7925c965967e978aecbb5fcb0ec3e.png'},
            {sizeInMb:1.9,name:'test3.png',hashName:'9ea7925c965967e978aecbb5fcb0ec3f.png'},
        ]
        for(let singleImage of images){
            Object.assign(singleImage,commonPart)
        }
        console.log(`images===================================>${JSON.stringify(images)}`)
        tmpResult=await test_helper_db_operate.create_image_for_impeach_async({imagesInfo:images})
        // console.log(`user1Id result===================================>${JSON.stringify(tmpResult)}`)
        impeachId=tmpResult.msg[0]['_id']
    })
    it('test a XSS', async function () {
        // console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let content='<script>'
        let error={rc:1}
        helper.contentXSSCheck_async({content:content,error:error}).then(
            (res)=>{},
            (err)=>{
                // console.log(`xss====>${JSON.stringify(err)}`)
                assert.deepStrictEqual(err.rc, error.rc)
            }
        )

    })
})