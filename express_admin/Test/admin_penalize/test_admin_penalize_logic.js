/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const adminApp=require('../../app')
const app=require('../../../express/app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
//for fkValue check
const e_chineseFieldName=require('../../server/constant/genEnum/inputRule_field_chineseName').ChineseName

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const test_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')

// const db=require('../Test_helper/db_operation_helper')

let data = {values: {}},  baseUrl="/admin_penalize/",finalUrl=baseUrl
let adminUser1Sess,adminUser2Sess,adminUser3Sess,user1Sess,user1Id,user2Id

let normalRecord={
    // [e_field.ADMIN_PENALIZE.PUNISHED_ID]:{value:'asdf'}, //创建user后直接获得id后填入
    [e_field.ADMIN_PENALIZE.DURATION]:{value:5},
    [e_field.ADMIN_PENALIZE.REASON]:{value:'testtesttesttesttesttest'},
    [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:{value:e_penalizeType.NO_ARTICLE},
    [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:{value:e_penalizeSubType.CREATE},
}
/*              create_admin_user中的错误               */
describe('create penalize', async function() {
    let data={values:{method:e_method.CREATE}}
    let rootSess
    before('prepare===>create penalize', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.rootAdmin,adminApp:adminApp})
        /*              delete admin user1/2/3                    */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user1ForModel.name)
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user2ForModel.name)
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user3ForModel.name)
        /*                  create admin user1 with create penalize priority      */
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.user1, {[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.PENALIZE_USER]}}),adminApp:adminApp})
        adminUser1Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.user1,adminApp:adminApp})
        /*                  create admin user2 with revoke penalize priority      */
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.user2, {[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.REVOKE_PENALIZE]}}),adminApp:adminApp})
        adminUser2Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.user2,adminApp:adminApp})
        /*                  create admin user3 without create/revoke penalize priority      */
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.user3, {[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.CREATE_ADMIN_USER]}}),adminApp:adminApp})
        adminUser3Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.user3,adminApp:adminApp})

        /*              delete/create  user1                    */
        await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user1ForModel.account})
        await API_helper.createUser_async({userData:testData.user.user1,app:app})
        user1Sess=await API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
        user1Id=await test_helper.getUserId_async({userAccount:testData.user.user1ForModel.account})

        /*              delete user1 penalize record            */
        await test_helper.deleteUserPenalize_async({account:testData.user.user1ForModel.account})

    });



    it('punished user not exists', function(done) {
        data.values={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={value:"59d446dbbd708b15a4c11ae9"}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerHelperError.fkValueNotExist(e_chineseFieldName.admin_penalize.punishedId,normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]).rc)
                done();
            });
    });
    it('non admin user create penalize not allow', function(done) {
        data.values={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={value:user1Id}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        console.log(`user1Sess=====>${JSON.stringify(user1Sess)}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.onlyAdminUserCanCreatePenalize.rc)
                done();
            });
    });

    it('admin user2 has no priority to create penalize', function(done) {
        data.values={}
        let testRecord=objectDeepCopy(normalRecord)
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={value:user1Id}
        data.values[e_part.RECORD_INFO]=testRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser2Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.currentUserHasNotPriorityToCreatePenalize.rc)
                done();
            });
    });

    it('admin user1 create penalize for user1 success', function(done) {
        data.values={}
        let testRecord=objectDeepCopy(normalRecord)
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={value:user1Id}
        data.values[e_part.RECORD_INFO]=testRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser1Sess]).send(data)
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

    it('admin user1 create penalize for user1 while user1 has active penalize(must follow previous test case)', function(done) {
        data.values={}
        let testRecord=objectDeepCopy(normalRecord)
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={value:user1Id}
        data.values[e_part.RECORD_INFO]=testRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.currentUserHasValidPenalizeRecord.rc)
                done();
            });
    });

})






describe('update user error:', function() {
    let data={values:{method:e_method.UPDATE}},url=``,finalUrl=baseUrl+url
    let rootSess,adminadminUser1Sess,adminadminUser2Sess,rootId,adminUser1Id,adminUser2Id
    before('prepare===>update user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:testData.admin_user.rootAdmin.name,
            [e_field.ADMIN_USER.PASSWORD]:testData.admin_user.rootAdmin.password,
        },adminApp:app})
        /*              delete admin user1 then create user1 with no anu CRUD priority                    */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user1ForModel.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.user1, {[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.IMPEACH_DEAL]}}),adminApp:app})

        adminadminUser1Sess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:{value:testData.admin_user.user1ForModel.name},
            [e_field.ADMIN_USER.PASSWORD]:{value:testData.admin_user.user1ForModel.password},
        },adminApp:app})
        /*              delete admin user2 then create user2 with update priority                  */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user2ForModel.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.user2, {[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.UPDATE_ADMIN_USER]}}),adminApp:app})
        adminadminUser2Sess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:{value:testData.admin_user.user2ForModel.name},
            [e_field.ADMIN_USER.PASSWORD]:{value:testData.admin_user.user2ForModel.password},
        },adminApp:app})
        /*              get rootid and adminUser1Id                     */
        rootId=await test_helper.getAdminUserId_async({userName:testData.admin_user.rootAdminForModel.name})
        adminUser1Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.user1ForModel.name})
        adminUser2Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.user2ForModel.name})

        // console.log(`adminUser1Id=========${JSON.stringify(adminUser1Id)}`)
    });
    it('update user without login(no cookie)', function(done) {
        data.values[e_part.RECORD_ID]=adminUser2Id
        // data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
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
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=adminUser2Id
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminadminUser1Sess]).send(data)
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
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=adminUser1Id
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.CREATE_ADMIN_USER]}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminadminUser2Sess]).send(data)
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
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=rootId
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminadminUser2Sess]).send(data)
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
    let rootSess,adminadminUser1Sess,adminadminUser2Sess,rootId,adminUser1Id,adminUser2Id
    before('prepare=====>delete user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:testData.admin_user.rootAdmin.name,
            [e_field.ADMIN_USER.PASSWORD]:testData.admin_user.rootAdmin.password,
        },adminApp:app})
        //API_helper.
        /*              delete admin user1 then create user1 with no anu CRUD priority                    */
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user1ForModel.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.user1, {[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.IMPEACH_DEAL]}}),adminApp:app})

        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user2ForModel.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.user2, {[e_field.ADMIN_USER.USER_PRIORITY]:{value:[e_adminPriorityType.DELETE_ADMIN_USER]}}),adminApp:app})

        adminadminUser1Sess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:{value:testData.admin_user.user1ForModel.name},
            [e_field.ADMIN_USER.PASSWORD]:{value:testData.admin_user.user1ForModel.password},
        },adminApp:app})
        adminadminUser2Sess=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:{value:testData.admin_user.user2ForModel.name},
            [e_field.ADMIN_USER.PASSWORD]:{value:testData.admin_user.user2ForModel.password},
        },adminApp:app})
        /*              get rootid and adminUser1Id                     */
        rootId=await test_helper.getAdminUserId_async({userName:testData.admin_user.rootAdminForModel.name})
        adminUser1Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.user1ForModel.name})
        adminUser2Id=await test_helper.getAdminUserId_async({userName:testData.admin_user.user2ForModel.name})
    });
    it('delete user without login(no cookie)', function(done) {
        // data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_ID]=adminUser2Id
        // data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
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
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_ID]=adminUser2Id
        // console.log(`data=====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminadminUser1Sess]).send(data)
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
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminadminUser2Sess]).send(data)
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