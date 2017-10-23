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
const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/impeach_state/impeach_state_setting/impeach_state_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
// const db=require('../db_operation_helper/db_operation_helper')

let  baseUrl="/impeach_state/",finalUrl,url
let adminUser1Sess,adminUser2Sess,adminUser3Sess,user1Sess,user1Id,user2Id

let normalRecord={
    [e_field.IMPEACH_STATE.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_STATE.STATE]:e_impeachState.NEW,
    [e_field.IMPEACH_STATE.OWNER_COLL]:undefined,
    [e_field.IMPEACH_STATE.OWNER_ID]:undefined,

}
/*              create_impeach_state中的错误               */
describe('create impeach state', async function() {
    let data={values:{method:e_method.CREATE}}
    before('root admin user login', async function(){
        url=''
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        let userInfo =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let {sess:user1Sess,userId:user1Id}=userInfo
        // parameter['sess']=user1Sess
        let articledId=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        let impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articledId,userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH_STATE.IMPEACH_ID]=impeachId
        normalRecord[e_field.IMPEACH_STATE.OWNER_COLL]=e_coll.USER
        normalRecord[e_field.IMPEACH_STATE.OWNER_ID]=user1Id
        console.log(`normalRecord==========${JSON.stringify(normalRecord)}`)
        console.log(`user1Sess==========${JSON.stringify(user1Sess)}`)
    });


    /*              fk exists check            */
    it('fk:IMPEACH_ID not exists', function(done) {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_STATE.IMPEACH_ID]="59d446dbbd708b15a4c11ae9"
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
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
    it('fk:ownColl/ownId not exists', function(done) {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_STATE.OWNER_ID]=user1Id
        copyNormalRecord[e_field.IMPEACH_STATE.OWNER_COLL]=e_coll.ADMIN_USER
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(adminApp).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
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
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
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
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
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
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
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
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
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
    let rootSess,adminUser1Sess,adminUser2Sess,rootId,adminUser1Id,adminUser2Id
    before('prepare===>update user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        /*              delete admin user1 then create user1 with no anu CRUD priority                    */
        await db_operation_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]}),adminApp:adminApp})

        adminUser1Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser1,adminApp:adminApp})
        /*              delete admin user2 then create user2 with update priority                  */
        await db_operation_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user2.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.UPDATE_ADMIN_USER]}),adminApp:adminApp})
        adminUser2Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser2,adminApp:adminApp})
        /*              get rootid and adminUser1Id                     */
        rootId=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})
        adminUser1Id=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})
        adminUser2Id=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser2.name})

        // console.log(`adminUser1Id=========${JSON.stringify(adminUser1Id)}`)
    });
    it('update user without login(no cookie)', function(done) {
        data.values[e_part.RECORD_ID]=adminUser2Id
        // data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
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
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser2,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser1Sess]).send(data)
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
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser2Sess]).send(data)
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
        data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser2Sess]).send(data)
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


describe('delete penalize error:', function() {
    let data={values:{method:e_method.DELETE}},url=``,finalUrl=baseUrl+url
    let rootSess,adminUser1Sess,adminUser2Sess,rootId,adminUser1Id,adminUser2Id
    before('prepare=====>delete user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        //API_helper.
        /*              delete admin user1 then create user1 with no anu CRUD priority                    */
        await db_operation_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]}),adminApp:adminApp})

        await db_operation_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user2.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.DELETE_ADMIN_USER]}),adminApp:adminApp})

        adminUser1Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser1,adminApp:adminApp})
        adminUser2Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser2,adminApp:adminApp})
        /*              get rootid and adminUser1Id                     */
        rootId=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})
        adminUser1Id=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})
        adminUser2Id=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser2.name})
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
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser1Sess]).send(data)
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
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminUser2Sess]).send(data)
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