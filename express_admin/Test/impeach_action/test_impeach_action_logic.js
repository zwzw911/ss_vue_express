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
const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
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

const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_action_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const misc_helper=server_common_file_require.misc_helper

let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let adminRootSess,adminRootId,data={values:{}}

let impeach1Id,impeach2Id,impeach3Id
let article1Id,article2Id,article3Id

let impeachActionInfo
let  baseUrl="/impeach_action/",finalUrl,url

let normalRecord={
    [e_field.IMPEACH_ACTION.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:undefined,
    // [e_field.IMPEACH_STATE.OWNER_ID]:undefined,

}
/*              create_impeach_state中的错误               */
describe('create impeach action', async function() {
    url=''
    finalUrl=baseUrl+url

    before('root admin user login', async function(){
        parameter[`APIUrl`]=finalUrl
        /*              reCreate root user without IMPEACH priority                 */
        let adminUser=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]})
        await component_function.reCreateAdminRoot_async({adminRoorData:adminUser})
        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})

        /*              adminUser1 only has deal priority           */
        adminUser1Data=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_ASSIGN,e_adminPriorityType.IMPEACH_DEAL]})
        adminUser1Info=await component_function.reCreateAdminUser_returnSessUserId_async({userData:testData.admin_user.adminUser1,rootSess:rootSess,adminApp:adminApp})
        adminUser1Sess=adminUser1Info[`sess`]
        adminUser1Id=adminUser1Info[`userId`]
        /*              adminUser1 only has assign priority           */
        adminUser2Data=Object.assign({},testData.admin_user.adminUser2,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_ASSIGN,e_adminPriorityType.IMPEACH_ASSIGN]})
        adminUser2Info=await component_function.reCreateAdminUser_returnSessUserId_async({userData:testData.admin_user.adminUser2,rootSess:rootSess,adminApp:adminApp})
        adminUser2Sess=adminUser2Info[`sess`]
        adminUser2Id=adminUser2Info[`userId`]

        /*              普通用户user1创建一个impeach，并且submit                */
        user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let {sess:user1Sess,userId:user1Id}=user1Info
        article1Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        impeach1Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user1Sess,app:app})
        //submit impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach1Id,
        }
        await API_helper.createImpeachAction_async({sess:user1Sess,impeachActionInfo:impeachActionInfo,app:app})



        /*              普通用户user2创建一个impeach，并且已经结束                */
        user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        let {sess:user2Sess,userId:user2Id}=user2Info
        article2Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        impeach2Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user2Sess,app:app})
        //submit impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.DONE,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach2Id,
        }
        await API_helper.createImpeachAction_async({sess:user2Sess,impeachActionInfo:impeachActionInfo,app:app})

        /*              普通用户user3创建一个impeach，并且删除                */
        user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        let {sess:user3Sess,userId:user3Id}=user3Info
        article3Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        impeach3Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user2Sess,app:app})
        await API_helper.delete_impeach_async({impeachId:impeach3Id,userSess:user3Sess,app:app})


        normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
    });


    /*              userType wrong             */
    it(`userType check`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        data.values[e_part.RECORD_INFO]=normalRecord
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:undefined,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:adminApp})
    })
    /*              action not allow for adminUser            */
    it(`action not allow`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let copy=objectDeepCopy(normalRecord)
        copy[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.CREATE
        data.values[e_part.RECORD_INFO]=normalRecord
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:undefined,data:data,expectedErrorRc:controllerError.invalidActionBaseOnCurrentAction.rc,app:adminApp})
    })
    /*              send multiple action            */
    it(`send multiple action`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let copy=objectDeepCopy(normalRecord)
        copy[e_field.IMPEACH_ACTION.ACTION]=[e_impeachUserAction.CREATE,e_impeachUserAction.SUBMIT]
        data.values[e_part.RECORD_INFO]=copy
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:undefined,data:data,expectedErrorRc:controllerError.invalidActionBaseOnCurrentAction.rc,app:adminApp})
    })
    /*              impeach3 already delete            */
    it(`act on done impeach`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let copy=objectDeepCopy(normalRecord)
        copy[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach3Id
        data.values[e_part.RECORD_INFO]=copy
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.relatedImpeachAlreadyDeleted.rc,app:adminApp})
    })
    /*              impeach2 already done            */
    it(`act on done impeach`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let copy=objectDeepCopy(normalRecord)
        copy[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach2Id
        // copy[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach2Id
        data.values[e_part.RECORD_INFO]=copy
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.relatedImpeachAlreadyDeleted.rc,app:adminApp})
    })



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

    after(`rollback adminRoot priority configure`, async function(){
        /*              reCreate root user without all priority                 */
        let adminUser=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:enumValue.AdminPriorityType})
        await component_function.reCreateAdminRoot_async({adminRoorData:adminUser})
    })
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