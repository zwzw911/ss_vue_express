/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const adminApp=require('../../app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const test_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')


let userId  //create后存储对应的id，以便后续的update操作

let finalUrl='',baseUrl="/admin_penalize/"
describe('user format check:', function() {
    let data = {values: {}}
    let rootSess
    before('root admin user login', async function(){
        /*              清理已有数据              */
        // console.log(`######   delete exist record   ######`)
        // console.log(`correctValueForModel ${JSON.stringify(correctValueForModel)}`)
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:testData.admin_user.adminRoot.name,
            [e_field.ADMIN_USER.PASSWORD]:testData.admin_user.adminRoot.password,
        },adminApp:adminApp})
        // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });

    it('miss part:method', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        request(adminApp).post(baseUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // console.log(`${controllerHelperError.methodPartMustExistInDispatcher}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                // controllerHelperError.methodPartMustExistInDispatcher.rc
                assert.deepStrictEqual(parsedRes.rc,controllerHelperError.methodPartMustExistInDispatcher.rc)
                done();
            });
    });
    it('additional part:recordId', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_ID]=10
        request(adminApp).post(baseUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // console.log(`${controllerHelperError.methodPartMustExistInDispatcher}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                // controllerHelperError.methodPartMustExistInDispatcher.rc
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.inputValuePartNumNotExpected.rc)
                done();
            });
    });
    it('method is unknown value', function(done) {
        data.values={}
        data.values[e_part.METHOD]='10'
        // console.log(`data is ========.${JSON.stringify(data)}`)
        request(adminApp).post(baseUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes is ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                // console.log(`${JSON.stringify(validateError)}`)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateValue.methodValueUndefined.rc)
                done();
            });
    });

    it('not login cant create penalize', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data={values:{}}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]=testData.admin_user.adminUser1 //随便填入的数据
        request(adminApp).post(baseUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // console.log(`${controllerHelperError.methodPartMustExistInDispatcher}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                // controllerHelperError.methodPartMustExistInDispatcher.rc
                assert.deepStrictEqual(parsedRes.rc,controllerError.notLoginCantCreatePenalize.rc)
                done();
            });
    });

    it('recordInfo wrong format', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data={values:{}}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]=10
        request(adminApp).post(baseUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // console.log(`${controllerHelperError.methodPartMustExistInDispatcher}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                // controllerHelperError.methodPartMustExistInDispatcher.rc
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.inputValuePartRecordInfoValueFormatWrong.rc)
                done();
            });
    });
})






