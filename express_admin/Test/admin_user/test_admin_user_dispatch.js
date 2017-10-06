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

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminUserPriority=server_common_file_require.mongoEnum.AdminPriorityType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/admin/admin_setting/admin_user_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const test_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')


let userId  //create后存储对应的id，以便后续的update操作

let finalUrl='',baseUrl=''
describe('user format check:', function() {
    let data = {values: {}},  baseUrl="/admin_user/"
    let rootSess
    before('root admin user login', async function(){
        /*              清理已有数据              */
        // console.log(`######   delete exist record   ######`)
        // console.log(`correctValueForModel ${JSON.stringify(correctValueForModel)}`)
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:testData.admin_user.rootAdmin.name,
            [e_field.ADMIN_USER.PASSWORD]:testData.admin_user.rootAdmin.password,
        },adminApp:app})
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
    it('additional part:recordId', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_ID]=10
        request(app).post(baseUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
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

    it('not login cant create user', function(done) {
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
    });

    it('recordInfo wrong format', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        data={values:{}}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]=10
        request(app).post(baseUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
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
    before('prepare', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:testData.admin_user.rootAdmin.name,
            [e_field.ADMIN_USER.PASSWORD]:testData.admin_user.rootAdmin.password,
        },adminApp:app})
        /*              delete admin user1                    */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user1ForModel.name)
    });

    let data={values:{}},url=``,baseUrl='/admin_User/',finalUrl=baseUrl
// console.log(`url==============> ${JSON.stringify(finalUrl)}`)
    it('miss require field name', function(done) {
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]={password:{value:'12345678'}}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.admin_user.name.require.error.rc)
                done();
            });
    });
    it('require field name too short', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'1'}}
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
    });
    it('require field name too long', function(done) {
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
    });

    it('miss require field password', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'}}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.password.rc,browserInputRule.admin_user.password.require.error.rc)
                done();
            });
    });


    it('not exist field check', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},password:{value:'1'},notExist:{value:123}}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
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

    it('priority(enum) value not string', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:[99999]}})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.userPriority.rc,validateError.validateValue.CUDTypeWrong.rc)
                done();
            });
    });
    it('priority(enum) value not correct', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['99999']}})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.userPriority.rc,browserInputRule.admin_user.userPriority.enum.error.rc)
                done();
            });
    });

    it('priority(enum) too short(no value)', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:[]}})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.userPriority.rc,browserInputRule.admin_user.userPriority.arrayMinLength.error.rc)
                done();
            });
    });

    it('priority(enum) too long', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:["1","2","3","10","11","12","20","21","22",]}})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.userPriority.rc,browserInputRule.admin_user.userPriority.arrayMaxLength.error.rc)
                done();
            });
    });
})


