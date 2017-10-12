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

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/admin/admin_setting/admin_user_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const test_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')

// const db=require('../Test_helper/db_operation_helper')

let data = {values: {}},  baseUrl="/admin_user/",finalUrl=baseUrl
let user1Sess,user2Sess,user3Sess,user1Id,user2Id

/*              create_admin_user中的错误               */
describe('create user error:', function() {
    let data={values:{method:e_method.CREATE}}
    let rootSess
    before('prepare===>create user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({
            userData:testData.admin_user.adminRoot,
            adminApp:adminApp
        })
        /*              delete admin user1/2/3                    */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser2.name)
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser3.name)
        /*                  create user2 without create adminUser priority      */
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]}),adminApp:adminApp})
        user2Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser2,adminApp:adminApp})
        /*                  create user3 without create adminUser priority      */
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser3, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]}),adminApp:adminApp})
        user3Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser3,adminApp:adminApp})
    });
    it('create user without login(no sess)', function(done) {
        data.values[e_part.RECORD_INFO]=testData.admin_user.adminUser1
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.notLoginCantCreateUser.rc)
                done();
            });
    });
    it('create root user not allow', function(done) {
        data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_TYPE]:e_adminUserType.ROOT,[e_field.ADMIN_USER.USER_PRIORITY]:['1']})
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.cantCreateRootUserByAPI.rc)
                done();
            });
    });
    it('priority(enum) value duplicate', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerCheckerError.containDuplicateValue({fieldName:'pripority'}).rc)
                done();
            });
    });
    it('adminUser2 without create priority try to create adminUser1', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user2Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.currentUserHasNotPriorityToCreateUser.rc)
                done();
            });
    });
    it('adminUser3 try to create adminUser1 without inherit priority', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_REVIEW]})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user3Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.createUserPriorityNotInheritedFromParent.rc)
                done();
            });
    });
    it('create admin user1 correctly(without priority create)', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1']})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,0)
                done();
            });
    });

    it('create admin user1 again to unique check', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1']})
        console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.ADMIN_USER,fieldName:e_field.ADMIN_USER.NAME}).rc)
                done();
            });
    });
})






describe('update user error:', function() {
    let data={values:{method:e_method.UPDATE}},url=``,finalUrl=baseUrl+url
    let rootSess,adminUser1Sess,adminUser2Sess,rootId,adminUser1Id,adminUser2Id
    before('prepare===>update user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        /*              delete admin user1 then create user1 with no anu CRUD priority                    */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]}),adminApp:adminApp})

        adminUser1Sess=await API_helper.adminUserLogin_returnSess_async({
            userData:testData.admin_user.adminUser1,
            adminApp:adminApp
        })
        /*              delete admin user2 then create user2 with update priority                  */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser2.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.UPDATE_ADMIN_USER]}),adminApp:adminApp})
        adminUser2Sess=await API_helper.adminUserLogin_returnSess_async({
            userData:testData.admin_user.adminUser2,
            adminApp:adminApp
        })
        /*              get rootid and adminUser1Id                     */
        rootId=await test_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})
        adminUser1Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})
        adminUser2Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.adminUser2.name})

        // console.log(`adminUser1Id=========${JSON.stringify(adminUser1Id)}`)
    });
    it('update user without login(no cookie)', function(done) {
        data.values[e_part.RECORD_ID]=adminUser2Id
        // data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.notLoginCantUpdateUser.rc)
                done();
            });
    });

    it('user1 without priority try to update admin user2 ', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.UPDATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=adminUser2Id
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.currentUserHasNotPriorityToUpdateUser.rc)
                done();
            });
    });
    it('user2 update admin user1 without inherit priority', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.UPDATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=adminUser1Id
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser2Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.updatePriorityNotInheritedFromParent.rc)
                done();
            });
    });
    it('user2 with priority try to update root', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.UPDATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=rootId
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser2Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.onlyRootCanUpdateRoot.rc)
                done();
            });
    });
})


describe('delete user error:', function() {
    let data={values:{method:e_method.DELETE}},url=``,finalUrl=baseUrl+url
    let rootSess,adminUser1Sess,adminUser2Sess,rootId,adminUser1Id,adminUser2Id
    before('prepare=====>delete user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        //API_helper.
        /*              delete admin user1 then create user1 with no anu CRUD priority                    */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]}),adminApp:adminApp})

        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser2.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.DELETE_ADMIN_USER]}),adminApp:adminApp})

        adminUser1Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser1,adminApp:adminApp})
        adminUser2Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser2,adminApp:adminApp})
        /*              get rootid and adminUser1Id                     */
        rootId=await test_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})
        adminUser1Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})
        adminUser2Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.adminUser2.name})
    });
    it('delete user without login(no cookie)', function(done) {
        // data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_ID]=adminUser2Id
        // data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.notLoginCantDeleteUser.rc)
                done();
            });
    });
    it('user1 without priority try to delete admin user2 ', function(done) {
        // data.values={}
        // data.values[e_part.METHOD]=e_method.UPDATE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=adminUser2Id
        // console.log(`data=====>${JSON.stringify(data.values)}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.currentUserHasNotPriorityToDeleteUser.rc)
                done();
            });
    });
    it('admin user2 has priority try delete root user not allow', function(done) {
        data.values[e_part.RECORD_ID]=rootId
        // data.values[e_part.METHOD]=e_method.DELETE
        // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser2Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.cantDeleteRootUserByAPI.rc)
                done();
            });
    });

})