/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const adminApp=require('../../app')
const app=require('../../../express/app')
const assert=require('assert')
const ap=require(`awesomeprint`)

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
const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const misc_helper=server_common_file_require.misc_helper

// const db=require('../db_operation_helper/db_operation_helper')

let data = {values: {}},  baseUrl="/admin_penalize/",finalUrl=baseUrl
let adminUser1Sess,adminUser2Sess,adminUser3Sess,user1Sess,user1Id,user2Id

let copyNormalRecord

let normalRecord={
    // [e_field.ADMIN_PENALIZE.PUNISHED_ID]:{value:'asdf'}, //创建user后直接获得id后填入
    [e_field.ADMIN_PENALIZE.DURATION]:5,
    [e_field.ADMIN_PENALIZE.REASON]:'testtesttesttesttesttest',
    [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:e_penalizeType.NO_ARTICLE,
    [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:e_penalizeSubType.CREATE,
}

let deleteRecordInfo={[e_field.ADMIN_PENALIZE.REVOKE_REASON]:'123456766123456766123456766'}

/*              create_admin_user中的错误               */
describe('create penalize', async function() {
    let data={values:{method:e_method.CREATE}}
    let adminUser1Data,adminUser2Data,adminUser3Data
    let adminUser1Info,adminUser2Info,adminUser3Info
    let rootSess
    before('prepare===>create penalize', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        // ap.wrn('before rootSess',rootSess)
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        // console.log(`rootSess==================>${JSON.stringify(rootSess)}`)
        // ap.inf('rootSess',rootSess)
        /*              reCreate  adminUser1/2/3                    */
        adminUser1Data=Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.PENALIZE_USER]})
        adminUser2Data=Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.REVOKE_PENALIZE]})
        adminUser3Data=Object.assign({},testData.admin_user.adminUser3, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]})
        adminUser1Info=await component_function.reCreateAdminUser_returnSessUserId_async({rootSess:rootSess,userData:adminUser1Data,adminApp:adminApp})
        // console.log(`adminUser1 created`)
        adminUser2Info=await component_function.reCreateAdminUser_returnSessUserId_async({rootSess:rootSess,userData:adminUser2Data,adminApp:adminApp})
        // console.log(`adminUser1 created`)
        adminUser3Info=await component_function.reCreateAdminUser_returnSessUserId_async({rootSess:rootSess,userData:adminUser3Data,adminApp:adminApp})
        // console.log(`adminUser1 created`)
        adminUser1Sess=adminUser1Info[`sess`]
        adminUser2Sess=adminUser2Info[`sess`]
        adminUser3Sess=adminUser3Info[`sess`]

        /*              reCreate  user1                    */
        let user1Info=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=user1Info[`sess`]
        user1Id=user1Info[`userId`]

/*        /!*              delete user1 penalize record            *!/
        await db_operation_helper.deleteUserPenalize_async({account:testData.user.user1.account})*/


        console.log(`=========================================================================`)
        console.log(`==================      before done         =============================`)
        console.log(`=========================================================================`)
    });


    it('non admin user create penalize not allow', async function() {
        // ap.inf('case ',rootSess)
        data.values={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`user1Sess=====>${JSON.stringify(user1Sess)}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:adminApp})
    });

    it('admin user2 has no priority to create penalize',async  function() {
        data.values={}
        let testRecord=objectDeepCopy(normalRecord)
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
        data.values[e_part.RECORD_INFO]=testRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:controllerError.currentUserHasNotPriorityToCreatePenalize.rc,app:adminApp})

    });
    
    it('fk: punished user not exists',async function() {
        data.values={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]="59d446dbbd708b15a4c11ae9"
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        let expectedErrorRc=controllerHelperError.fkValueNotExist(e_chineseFieldName.admin_penalize.punishedId,normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]).rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
    });
    

    it('admin user1 create penalize for user1 while user1 has active penalize(not reach endData)',async function() {
        /*              delete all penalize record            */
        await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})

        await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:normalRecord,penalizedUserData:testData.user.user1,adminApp:adminApp})

        data.values={}
        let testRecord=objectDeepCopy(normalRecord)
        testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
        data.values[e_part.RECORD_INFO]=testRecord
        data.values[e_part.METHOD]=e_method.CREATE

        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.currentUserHasValidPenalizeRecord.rc,app:adminApp})

    });

    it('admin user1 create penalize for user1 while user1 has active penalize(duration is 0)',async function() {
        /*              delete all penalize record            */
        await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})

        let testRecord=objectDeepCopy(normalRecord)
        testRecord[e_field.ADMIN_PENALIZE.DURATION]=0
        await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:testRecord,penalizedUserData:testData.user.user1,adminApp:adminApp})

        data.values={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.currentUserHasValidPenalizeRecord.rc,app:adminApp})

    });

    it('admin user1 create penalize for user1(user1 has not reach endDate penalize but deleted by admin)',async function() {
        /*              delete all penalize record            */
        await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})

        /*                  create an active penalize               */
        let testRecord=objectDeepCopy(normalRecord)
        testRecord[e_field.ADMIN_PENALIZE.DURATION]=0
        let penalizeId=await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:testRecord,penalizedUserData:testData.user.user1,adminApp:adminApp})
        /*                  revoke(delete) this penalize            */
        await API_helper.deletePenalizeById_async({adminUserSess:rootSess,penalizeId:penalizeId,adminApp:adminApp})

        data.values={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:0,app:adminApp})

    });
})






/*describe('update user error:', function() {
    let data={values:{method:e_method.UPDATE}},url=``,finalUrl=baseUrl+url
    let rootSess,adminUser1Sess,adminUser2Sess,rootId,adminUser1Id,adminUser2Id
    before('prepare===>update user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /!*              root admin login                    *!/
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        /!*              delete admin user1 then create user1 with no anu CRUD priority                    *!/
        await db_operation_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]}),adminApp:adminApp})

        adminUser1Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser1,adminApp:adminApp})
        /!*              delete admin user2 then create user2 with update priority                  *!/
        await db_operation_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user2.name)
        await API_helper.createAdminUser_async({sess:rootSess,userData:Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.UPDATE_ADMIN_USER]}),adminApp:adminApp})
        adminUser2Sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminUser2,adminApp:adminApp})
        /!*              get rootid and adminUser1Id                     *!/
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
})*/

//delete复用update的dispatch，因为delete除了recordId，还需要recordInfo来携带reason
describe('delete penalize', function() {
    let data={values:{method:e_method.DELETE}},url=``,finalUrl=baseUrl+url
    let adminUser1Data,adminUser2Data,adminUser1Info,adminUser2Info
    let rootSess,adminUser1Sess,adminUser2Sess,rootId,adminUser1Id,adminUser2Id
    let penalizeId
    let normalRecordForDelete={
        [e_field.ADMIN_PENALIZE.REASON]:'revoke reason is test'
    }
    before('prepare=====>delete user error', async function(){
        // console.log(`######   delete exist record   ######`)
        let user1Info=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=user1Info[`sess`]
        /*              root admin login                    */
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        rootId=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})


        adminUser1Data=Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.PENALIZE_USER,e_adminPriorityType.REVOKE_PENALIZE]})
        adminUser2Data=Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.DELETE_ADMIN_USER]})
        adminUser1Info=await component_function.reCreateAdminUser_returnSessUserId_async({rootSess:rootSess,userData:adminUser1Data,adminApp:adminApp})
        adminUser2Info=await component_function.reCreateAdminUser_returnSessUserId_async({rootSess:rootSess,userData:adminUser2Data,adminApp:adminApp})
        adminUser1Sess=adminUser1Info[`sess`]
        adminUser1Id=adminUser1Info[`userId`]
        adminUser2Sess=adminUser2Info[`sess`]
        adminUser2Id=adminUser2Info[`userId`]
        // adminUser3Sess=adminUser3Info[`sess`]

        /*              delete all penalize record            */
        await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})

        penalizeId=await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:normalRecord,penalizedUserData:testData.user.user1,adminApp:adminApp})
        // ap.inf('before onde',user1Info)
    });
    it('non admin user delete penalize not allow', async function() {
        data.values={}
        // copyNormalRecord=objectDeepCopy(normalRecord)
        data.values[e_part.RECORD_INFO]=deleteRecordInfo
        data.values[e_part.METHOD]=e_method.DELETE
        data.values[e_part.RECORD_ID]=penalizeId
        // console.log(`user1Sess=====>${JSON.stringify(user1Sess)}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:adminApp})
    });

    it('admin user2 has no priority to delete penalize',async  function() {
        data.values={}
        // let testRecord=objectDeepCopy(normalRecord)
        data.values[e_part.RECORD_ID]=penalizeId
        data.values[e_part.RECORD_INFO]=deleteRecordInfo
        data.values[e_part.METHOD]=e_method.DELETE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:controllerError.currentUserHasNotPriorityToRevokePenalize.rc,app:adminApp})
    });


    it('recordInfo contain more than REASON', async function() {
        // data.values[e_part.RECORD_INFO]={}
        data.values={}
        data.values[e_part.METHOD]=e_method.DELETE
        data.values[e_part.RECORD_ID]=penalizeId
        data.values[e_part.RECORD_INFO]={
            [e_field.ADMIN_PENALIZE.DURATION]:9,
            [e_field.ADMIN_PENALIZE.REVOKE_REASON]:'123456789090973452345345'
        }
        let expectedErrorRc=validateError.validateValue.fieldValueShouldNotExistSinceNoRelateApplyRange({}).rc
        await misc_helper.sendDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.ADMIN_PENALIZE.DURATION],app:adminApp})

    });

    it('recordInfo contain 1 filed but not REASON', async function() {
        // data.values[e_part.RECORD_INFO]={}
        data.values={}
        data.values[e_part.METHOD]=e_method.DELETE
        data.values[e_part.RECORD_ID]=penalizeId

        data.values[e_part.RECORD_INFO]={
            [e_field.ADMIN_PENALIZE.DURATION]:9,
            // [e_field.ADMIN_PENALIZE.REVOKE_REASON]:'123456789090973452345345'
        }
let expectedErrorRc=browserInputRule.admin_penalize.revokeReason.require.error.rc
        await misc_helper.sendDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.ADMIN_PENALIZE.REVOKE_REASON],app:adminApp})

    });
})