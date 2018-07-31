/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
/**************  特定相关常量  ****************/
const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
let baseUrl="/admin_penalize/",finalUrl,url


/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/******************    待测函数  **************/
const adminApp=require('../../app')
const app=require(`../../../express/app`)

const server_common_file_require=require('../../server_common_file_require')
/****************  公共常量 ********************/
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum

const mongoEnum=server_common_file_require.mongoEnum
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_impeachAllAction=mongoEnum.ImpeachAllAction.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_publicGroupJoinInRule=mongoEnum.PublicGroupJoinInRule.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachAdminAction=mongoEnum.ImpeachAdminAction.DB
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
const e_dbModel=require('../../server/constant/genEnum/dbModel')

const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart



/******************    数据库函数  **************/

/****************  公共函数 ********************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const adminUserAPI=server_common_file_require.admin_user_API//require('../API_helper/API_helper')
const userAPI=server_common_file_require.user_API
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API
const impeachAPI=server_common_file_require.impeach_API
const friendGroupAPI=server_common_file_require.friend_group_API
const impeachActionAPI=server_common_file_require.impeachAction_API

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const articleComponentFunction=server_common_file_require.article_component_function
const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy
const generateTestData=server_common_file_require.generateTestData

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule


/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerCheckerError=server_common_file_require.helperError.checker
const systemError=server_common_file_require.systemError
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck

let expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,user1IdCryptedByAdminUser1,user1IdCryptedByAdminUser2,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId
let adminUser1IdCryptedByAdminUser1,adminUser1IdCryptedByAdminUser2,adminUser1IdCryptedByAdminUser3,adminUser1IdCryptedByUser1,//adminUser1IdCryptedByUser1,adminUser1IdCryptedByUser2,
    adminUser2IdCryptedByAdminUser1,adminUser2IdCryptedByAdminUser2,adminUser2IdCryptedByAdminUser3,
    adminUser3IdCryptedByAdminUser1,adminUser3IdCryptedByAdminUser2,adminUser3IdCryptedByAdminUser3,
    adminRootIdCryptedByAdminUser1,adminRootIdCryptedByAdminUser2,
    adminUser1Sess,adminUser2Sess,adminUser3Sess,
    adminUser1Id,adminUser2Id,adminUser3Id
let penalize1Id,penalize1IdCryptedByAdminRoot,penalize1IdCryptedByAdmin1,penalize1IdCryptedByAdmin2,penalize1IdCryptedByUser1
// let data={values:{}}

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
describe('penalize', async function() {
    let data={values:{}}
    let adminUser1Data,adminUser2Data,adminUser3Data
    let adminUser1Info,adminUser2Info,adminUser3Info
    // let adminRootSess
    before('prepare===>create penalize', async function(){
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        // ap.wrn('prepare in')
        adminRootSess=await adminUserComponentFunction.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        // ap.wrn('adminroot done')
        // console.log(`adminRootSess==================>${JSON.stringify(adminRootSess)}`)
        // ap.inf('adminRootSess',adminRootSess)
        /*              reCreate  adminUser1/2/3                    */
        adminUser1Data=Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.PENALIZE_USER]})
        adminUser2Data=Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.REVOKE_PENALIZE]})
        adminUser3Data=Object.assign({},testData.admin_user.adminUser3, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]})


        adminUser1Info=await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({adminRootSess:adminRootSess,userData:adminUser1Data,adminApp:adminApp})
        // console.log(`adminUser1 created`)
        adminUser2Info=await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({adminRootSess:adminRootSess,userData:adminUser2Data,adminApp:adminApp})
        // console.log(`adminUser1 created`)
        adminUser3Info=await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({adminRootSess:adminRootSess,userData:adminUser3Data,adminApp:adminApp})

        adminUser1Id=adminUser1Info[`userId`]
        adminUser2Id=adminUser2Info[`userId`]
        adminUser3Id=adminUser3Info[`userId`]
        adminUser1Sess=adminUser1Info[`sess`]
        adminUser2Sess=adminUser2Info[`sess`]
        adminUser3Sess=adminUser3Info[`sess`]
        // ap.wrn('admin done')
        /*              reCreate  user1                    */
        let user1Info=await userComponentFunction.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=user1Info[`sess`]
        user1Id=user1Info[`userId`]
        // ap.wrn('user1IdCryptedByUser1',user1IdCryptedByUser1)
        user1IdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:user1Id,sess:user1Sess})
        user1IdCryptedByAdminUser1=await commonAPI.cryptObjectId_async({objectId:user1Id,sess:adminUser1Sess})
        user1IdCryptedByAdminUser2=await commonAPI.cryptObjectId_async({objectId:user1Id,sess:adminUser2Sess})
/*        /!*              delete user1 penalize record            *!/
        await db_operation_helper.deleteUserPenalize_async({account:testData.user.user1.account})*/
        /**         create penalize     **/
        await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})
        penalize1IdCryptedByAdmin1=await penalizeAPI.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:normalRecord,penalizedUserId:user1IdCryptedByAdminUser1,adminApp:adminApp})
        // ap.wrn('penalize1IdCryptedByAdmin1',penalize1IdCryptedByAdmin1)
        penalize1Id=await commonAPI.decryptObjectId_async({objectId:penalize1IdCryptedByAdmin1,sess:adminUser1Sess})
        penalize1IdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:penalize1Id,sess:user1Sess})
        penalize1IdCryptedByAdmin2=await commonAPI.cryptObjectId_async({objectId:penalize1Id,sess:adminUser2Sess})
        console.log(`=========================================================================`)
        console.log(`==================      before done         =============================`)
        console.log(`=========================================================================`)
    });

    describe('create penalize', async function() {
        before('create penalize', async function(){
            url=''
            finalUrl=baseUrl+url
            // normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
            // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
        });
        it('1.1 non admin user create penalize not allow', async function() {
            // ap.inf('case ',adminRootSess)
            data.values={}
            normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1IdCryptedByUser1
            data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            // console.log(`user1Sess=====>${JSON.stringify(user1Sess)}`)
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:adminApp})
        });

        it('1.2 admin user2 has no priority to create penalize',async  function() {
            data.values={}
            let testRecord=objectDeepCopy(normalRecord)
            testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1IdCryptedByAdminUser2
            data.values[e_part.RECORD_INFO]=testRecord
            expectedErrorRc=controllerError.create.currentUserHasNotPriorityToCreatePenalize.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });

        it('1.3 fk: punished user not exists',async function() {
            data.values={}
            normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=await commonAPI.cryptObjectId_async({objectId:"59d446dbbd708b15a4c11ae9",sess:adminUser1Sess})
            data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc//controllerHelperError.fkValueNotExist(e_chineseFieldName.admin_penalize.punishedId,normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
        });


        it('1.4 admin user1 create penalize for user1 while user1 has active penalize(not reach endData)',async function() {
            /*              delete all penalize record            */
            await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})

            await penalizeAPI.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:normalRecord,penalizedUserId:user1IdCryptedByAdminUser1,adminApp:adminApp})

            data.values={}
            let testRecord=objectDeepCopy(normalRecord)
            testRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1IdCryptedByAdminUser1
            data.values[e_part.RECORD_INFO]=testRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            expectedErrorRc=controllerError.create.currentUserHasValidPenalizeRecord.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });

        it('1.5 admin user1 create penalize for user1 while user1 has active penalize(duration is 0)',async function() {
            /*              delete all penalize record            */
            await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})

            let testRecord=objectDeepCopy(normalRecord)
            testRecord[e_field.ADMIN_PENALIZE.DURATION]=0
            await penalizeAPI.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:testRecord,penalizedUserId:user1IdCryptedByAdminUser1,adminApp:adminApp})

            data.values={}
            normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1IdCryptedByAdminUser1
            data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
            // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
            expectedErrorRc=controllerError.create.currentUserHasValidPenalizeRecord.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });

        it('1.6 admin user1 create penalize for user1(user1 has not reach endDate penalize but deleted by admin)',async function() {
            /*              delete all penalize record            */
            await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel[e_coll.ADMIN_PENALIZE]]})

            /*                  create an active penalize               */
            let testRecord=objectDeepCopy(normalRecord)
            testRecord[e_field.ADMIN_PENALIZE.DURATION]=0
            penalize1IdCryptedByAdmin1=await penalizeAPI.createPenalize_returnPenalizeId_async({adminUserSess:adminUser1Sess,penalizeInfo:testRecord,penalizedUserId:user1IdCryptedByAdminUser1,adminApp:adminApp})
            // ap.wrn('penalize1IdCryptedByAdmin1',penalize1IdCryptedByAdmin1)
            penalize1Id=await commonAPI.decryptObjectId_async({objectId:penalize1IdCryptedByAdmin1,sess:adminUser1Sess})
            // ap.wrn('penalize1Id',penalize1Id)
            penalize1IdCryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:penalize1Id,sess:adminRootSess})
            // ap.wrn('penalize1IdCryptedByAdminRoot',penalize1IdCryptedByAdminRoot)
            /*                  revoke(delete) this penalize            */
            data.values={}
            data.values[e_part.RECORD_ID]=penalize1IdCryptedByAdminRoot
            data.values[e_part.RECORD_INFO]={[e_field.ADMIN_PENALIZE.REVOKE_REASON]:'test for revoke penalize by id'}
            await penalizeAPI.deletePenalizeById_async({adminUserSess:adminRootSess,data:data,adminApp:adminApp})

            data.values={}
            normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=user1IdCryptedByAdminUser1
            data.values[e_part.RECORD_INFO]=normalRecord
            // ap.wrn('data',data)
            // data.values[e_part.METHOD]=e_method.CREATE
            // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
            // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:0,app:adminApp})

        });
    })
    describe('delete penalize', async function() {
        before('delete penalize', async function(){
            url=''
            finalUrl=baseUrl+url
            // normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
            // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
        });
        it('2.1 non admin user delete penalize not allow', async function() {
            data.values={}
            // copyNormalRecord=objectDeepCopy(normalRecord)
            data.values[e_part.RECORD_INFO]=deleteRecordInfo
            // data.values[e_part.METHOD]=e_method.DELETE
            data.values[e_part.RECORD_ID]=penalize1IdCryptedByUser1
            // console.log(`user1Sess=====>${JSON.stringify(user1Sess)}`)
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:adminApp})
        });

        it('2.2 admin user1 has no priority to delete penalize',async  function() {
            data.values={}
            // let testRecord=objectDeepCopy(normalRecord)
            data.values[e_part.RECORD_ID]=penalize1IdCryptedByAdmin1
            data.values[e_part.RECORD_INFO]=deleteRecordInfo
            // ap.wrn('data.values',data.values)
            // data.values[e_part.METHOD]=e_method.DELETE
            // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
            // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
            expectedErrorRc=controllerError.delete.currentUserHasNotPriorityToRevokePenalize.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
        });


        it('2.3 recordInfo contain more field than REASON', async function() {
            // data.values[e_part.RECORD_INFO]={}
            data.values={}
            // data.values[e_part.METHOD]=e_method.DELETE
            data.values[e_part.RECORD_ID]=penalize1IdCryptedByAdmin1
            data.values[e_part.RECORD_INFO]={
                [e_field.ADMIN_PENALIZE.DURATION]:9,
                [e_field.ADMIN_PENALIZE.REVOKE_REASON]:'123456789090973452345345'
            }
            let expectedErrorRc=validateError.validateValue.fieldValueShouldNotExistSinceNoRelateApplyRange({}).rc
            await misc_helper.deleteAPI_compareFieldRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.ADMIN_PENALIZE.DURATION],app:adminApp})

        });

        /*it('2.4 recordInfo contain 1 filed but not REASON', async function() {
            // data.values[e_part.RECORD_INFO]={}
            data.values={}
            // data.values[e_part.METHOD]=e_method.DELETE
            data.values[e_part.RECORD_ID]=penalize1IdCryptedByAdmin1

            data.values[e_part.RECORD_INFO]={
                [e_field.ADMIN_PENALIZE.DURATION]:9,
                // [e_field.ADMIN_PENALIZE.REVOKE_REASON]:'123456789090973452345345'
            }
            let expectedErrorRc=browserInputRule.admin_penalize.revokeReason.require.error.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.ADMIN_PENALIZE.REVOKE_REASON],app:adminApp})

        });*/
    })


})

/*
//delete复用update的dispatch，因为delete除了recordId，还需要recordInfo来携带reason
describe('delete penalize', function() {
    let data={values:{}},url=``,finalUrl=baseUrl+url
    let adminUser1Data,adminUser2Data,adminUser1Info,adminUser2Info
    let adminRootSess,adminUser1Sess,adminUser2Sess,rootId,adminUser1Id,adminUser2Id
    let penalizeId
    let normalRecordForDelete={
        [e_field.ADMIN_PENALIZE.REASON]:'revoke reason is test'
    }
    before('prepare=====>delete user error', async function(){
        // console.log(`######   delete exist record   ######`)
        /!*let user1Info=await userComponentFunction.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=user1Info[`sess`]
        /!*              root admin login                    *!/
        adminRootSess=await adminUserAPI.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        rootId=await db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})


        adminUser1Data=Object.assign({},testData.admin_user.adminUser1, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.PENALIZE_USER,e_adminPriorityType.REVOKE_PENALIZE]})
        adminUser2Data=Object.assign({},testData.admin_user.adminUser2, {[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.DELETE_ADMIN_USER]})
        adminUser1Info=await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({adminRootSess:adminRootSess,userData:adminUser1Data,adminApp:adminApp})
        adminUser2Info=await adminUserComponentFunction.reCreateAdminUser_returnSessUserId_async({adminRootSess:adminRootSess,userData:adminUser2Data,adminApp:adminApp})
        adminUser1Sess=adminUser1Info[`sess`]
        adminUser1Id=adminUser1Info[`userId`]
        adminUser2Sess=adminUser2Info[`sess`]
        adminUser2Id=adminUser2Info[`userId`]*!/
        // adminUser3Sess=adminUser3Info[`sess`]

        /!*              delete all penalize record            *!/

        // ap.inf('before onde',user1Info)
    });

})*/
