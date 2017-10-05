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
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

const e_impeachState=mongoEnum.ImpeachState.DB
// const e_adminUserPriority=mongoEnum.AdminPriorityType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/impeach_state/impeach_state_setting/impeach_state_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

// const test_helper=require("../Test_helper/db_operation_helper")
// const testData=require('../testData')
// const API_helper=require('../Test_helper/API')
const test_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')


let data = {values: {}},  baseUrl="/impeach_state/",finalUrl=baseUrl
let user1Sess,user2Sess,user1Id,user2Id

describe('user format check:', function() {
    before('delete user1 then insert user1', async function(){
        /*              普通用户操作             */
        await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user1ForModel.account})
        await  API_helper.createUser_async({userData:testData.user.user1,app:app})
        user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
        // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });

    it('miss part:method', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        request(app).post(baseUrl).set('Accept', 'application/json').send(data)
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

    it('method is unknown value', function(done) {
        data.values={}
        data.values[e_part.METHOD]='10'
        // console.log(`data is ========.${JSON.stringify(data)}`)
        request(app).post(baseUrl).set('Accept', 'application/json').send(data)
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
    it('miss additional part:recordInfo', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // data.values[e_part.RECORD_INFO]={}
        // data.values[e_part.RECORD_ID]=10
        request(app).post(baseUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
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
   /* it('not login cant create user', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data={values:{}}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]=testData.admin_user.user1
        request(app).post(baseUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // console.log(`${controllerHelperError.methodPartMustExistInDispatcher}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                // controllerHelperError.methodPartMustExistInDispatcher.rc
                assert.deepStrictEqual(parsedRes.rc,controllerError.notLoginCantCreateUser.rc)
                done();
            });
    });*/

    it('create: recordInfo wrong format', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]=10
        request(app).post(baseUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
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



describe('method=create: preCheck', function() {
    let rootSess
    before('delete user1 then insert user1', async function(){
        /*              普通用户操作             */
        await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user1ForModel.account})
        await  API_helper.createUser_async({userData:testData.user.user1,app:app})
        user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
        // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });

    it('not exist field check', function(done) {
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={impeachId:{value:'59d4694d5b1c291810713683'},state:{value:e_impeachState.NEW},notExist:{value:123}}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.recordInfoFiledRuleNotDefine.rc)
                done();
            });
    });

    // let data={values:{}},url=``,baseUrl='/admin_User/',finalUrl=baseUrl
// console.log(`url==============> ${JSON.stringify(finalUrl)}`)
    it('miss require field impeachId', function(done) {
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={[e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.SUBMIT}}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.impeachId.rc,browserInputRule.impeach_state.impeachId.require.error.rc)
                done();
            });
    });
    it('require field impeachId not match format', function(done) {
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'1234abcf'},
            [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.SUBMIT}
        }
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.impeachId.rc,browserInputRule.impeach_state.impeachId.format.error.rc)
                done();
            });
    });
   /* it('require field name too long', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789012345678901234567890'}}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.admin_user.name.format.error.rc)
                done();
            });
    });*/

    it('miss require field impeach_state', function(done) {
        data.values[e_part.RECORD_INFO]={[e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'59d45aa2ec0c05121c34c27d'},}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.state.rc,browserInputRule.impeach_state.state.require.error.rc)
                done();
            });
    });

    it('state(enum) value not array', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'59d45aa2ec0c05121c34c27d'},
            [e_field.IMPEACH_STATE.STATE]:{value:'0'},
        }
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.state.rc,browserInputRule.impeach_state.state.enum.error.rc)
                done();
            });
    });
    it('state(enum) value not string', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'59d45aa2ec0c05121c34c27d'},
            [e_field.IMPEACH_STATE.STATE]:{value:1},
        }
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.state.rc,validateError.validateValue.CUDTypeWrong.rc)
                done();
            });
    });
    it('state(enum) value not correct', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'59d45aa2ec0c05121c34c27d'},
            [e_field.IMPEACH_STATE.STATE]:{value:'99999'},
        }
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.state.rc,browserInputRule.impeach_state.state.enum.error.rc)
                done();
            });
    });

    it('state(enum) value has duplicate', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'59d45aa2ec0c05121c34c27d'},
            [e_field.IMPEACH_STATE.STATE]:{value:['0','0']},
        }
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.state.rc,validateError.validateValue.CUDTypeWrong.rc)
                done();
            });
    });

    it('state(enum) value has multiple value', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'59d45aa2ec0c05121c34c27d'},
            [e_field.IMPEACH_STATE.STATE]:{value:[e_impeachState.SUBMIT,e_impeachState.NEW]},
        }
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.state.rc,validateError.validateValue.CUDTypeWrong.rc)
                done();
            });
    });


})


