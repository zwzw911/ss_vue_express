/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const ap=require(`awesomeprint`)
const app=require('../../app')
// const assert=require('assert')
const adminApp=require(`../../../express_admin/app`)

const server_common_file_require=require('../../server_common_file_require')
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

const e_addFriendStatus=server_common_file_require.mongoEnum.AddFriendStatus.DB
const e_impeachAllAction=server_common_file_require.mongoEnum.ImpeachAllAction.DB

const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart
// const e_=server_common_file_require.mongoEnum.
// const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker


// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
let rootSess
let baseUrl="/add_friend_request/",finalUrl,url
const controllerError=require('../../server/controller/add_friend_request/add_friend_setting/add_friend_controllerError').controllerError
let recordId //当有update/delete的时候，需要真实的recordid，来pass recordId的最后一个case（正确通过）
let normalRecord={
    // [e_field.ADD_FRIEND_REQUEST.ORIGINATOR]:undefined,
    [e_field.ADD_FRIEND_REQUEST.RECEIVER]:undefined,
}


let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let adminRootSess,adminRootId,data={values:{}}

let recorderId //for update
/*
 * @sess：是否需要sess
 * @sessErrorRc：测试sess是否存在时，使用的error
 * @APIUrl:测试使用的URL
 * @penalizeRelatedInfo: {penalizeType:,penalizeSubType:,penalizedUserData:,penalizedError:,rootSess:,adminApp}
 * @reqBodyValues: 各个part。包含recordInfo/recordId/searchParams等
 * @skipParts：某些特殊情况下，需要skip掉的某些part
 * @collName: 获得collRule，进行collName的对比等
 * */
let parameter={
    [e_parameterPart.SESS]:undefined,
    [e_parameterPart.SESS_ERROR_RC]:undefined,
    [e_parameterPart.API_URL]:undefined,
    [e_parameterPart.PENALIZE_RELATED_INFO]:{penalizeType:e_penalizeType.NO_ADD_FRIEND,penalizeSubType:e_penalizeSubType.CREATE,penalizedUserData:testData.user.user1,penalizedError:controllerError.userInPenalizeNoImpeachCreate,adminApp:adminApp},
    [e_parameterPart.REQ_BODY_VALUES]:{[e_part.RECORD_INFO]:normalRecord},
    [e_parameterPart.COLL_NAME]:e_coll.ADD_FRIEND,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:app,
}
describe('dispatch', function() {

    before('user1/2/3  login and create', async function(){
        url=''
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl
        let user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        let user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        let user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        user3Id=user3Info[`userId`]
        user3Sess=user3Info[`sess`]



        //设置penalize相关信息
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        parameter[`penalizeRelatedInfo`][`rootSess`]=rootSess


        console.log(`==============================================================`)
        console.log(`============    user1 add user2 as friend      ===============`)
        console.log(`==============================================================`)
        normalRecord[e_field.ADD_FRIEND_REQUEST.RECEIVER]=user2Id
        let result=await API_helper.createAddFriend_returnRecord_async({userData:normalRecord,sess:user1Sess,app:app})
        recordId=result['_id']


        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /*    it(`penalize check`,async function(){
     //reason:,penalizeType:,penalizeSubype:,duration:
     let penalizeInfo={
     [e_field.ADMIN_PENALIZE.REASON]:'test for test test test',
     [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:e_penalizeType.NO_IMPEACH,
     [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:e_penalizeSubType.CREATE,
     [e_field.ADMIN_PENALIZE.DURATION]:1,
     }
     await API_helper.createPenalize_async({adminUserSess:rootSess,penalizeInfo:penalizeInfo,pernalizedUserData:testData.user.user1,adminApp:adminApp})
     })*/
    it(`preCheck for create`,async function(){

        parameter[e_parameterPart.SESS]=user1Sess
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantCreateAddFriend.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeType`]=e_penalizeType.NO_ADD_FRIEND
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=e_penalizeSubType.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedUserData`]=testData.user.user1
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=controllerError.currentUserForbidToCreateAddFriend
        // parameter[`sessErrorRc`]=controllerError.notLoginCantChangeState.rc
        // parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    it(`preCheck for update`,async function(){
        normalRecord={[e_field.ADD_FRIEND_REQUEST.STATUS]:e_addFriendStatus.ACCEPT}
        parameter[e_parameterPart.SESS]=user2Sess
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantUpdateAddFriend.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeType`]=e_penalizeType.NO_ADD_FRIEND
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=e_penalizeSubType.UPDATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedUserData`]=testData.user.user1
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=controllerError.currentUserForbidToUpdateAddFriend
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=recordId
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]
    })
    /*    it(`preCheck for delete`,async function(){
     // parameter[`sessErrorRc`]=controllerError.notLoginCantDeletePenalize.rc
     // parameter[`method`]=e_method.DELETE
     parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantDeletePenalize.rc
     parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.DELETE
     parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]='59f882b8a260a901c0b34597'
     // parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=undefined
     // parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=undefined
     await inputRule_API_tester.dispatch_partCheck_async(parameter)
     })*/




    it(`inputRule for create`,async function(){
        normalRecord={
            [e_field.ADD_FRIEND_REQUEST.RECEIVER]:user1Id,
            [e_field.ADD_FRIEND_REQUEST.STATUS]:e_addFriendStatus.ACCEPT,
        }
        parameter[e_parameterPart.SESS]=user1Sess
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]=normalRecord
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        // ap.print('parameter[e_parameterPart.REQ_BODY_VALUES]',parameter[e_parameterPart.REQ_BODY_VALUES])
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })

    it(`inputRule for create`,async function(){
        normalRecord={
            [e_field.ADD_FRIEND_REQUEST.RECEIVER]:user1Id,
            [e_field.ADD_FRIEND_REQUEST.STATUS]:e_addFriendStatus.ACCEPT,
        }
        parameter[e_parameterPart.SESS]=user1Sess
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]=normalRecord
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        // ap.print('parameter[e_parameterPart.REQ_BODY_VALUES]',parameter[e_parameterPart.REQ_BODY_VALUES])
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })

    it(`inputRule for update`,async function(){
        normalRecord={
            [e_field.ADD_FRIEND_REQUEST.RECEIVER]:user2Id,
            [e_field.ADD_FRIEND_REQUEST.STATUS]:e_addFriendStatus.ACCEPT,
        }
        parameter[e_parameterPart.SESS]=user1Sess
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]=normalRecord
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=recordId
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        //更新user的时候，无需recordId，而是直接从sess中获得
        // parameter[e_parameterPart.SKIP_PARTS]=[e_part.RECORD_ID]
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })
})


/*describe('inputRule', async function() {

 before('prepare', async function () {
 /!*========== 设置parameter =======*!/
 url=``
 finalUrl = baseUrl + url
 parameter[`APIUrl`]=finalUrl

 // console.log(`######   delete exist record   ######`)
 /!*              root admin login                    *!/
 parameter.sess = await API_helper.adminUserLogin_returnSess_async({
 userData: testData.admin_user.adminRoot,
 adminApp: adminApp
 })
 // console.log(`testData.user.user1 is=============>${JSON.stringify(testData.user.user1)}`)
 /!*              delete/create/getId  user1                    *!/
 let result=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
 let {userId,sess}=result
 // await test_helper.deleteUserAndRelatedInfo_async({account:.account})
 // await API_helper.createUser_async({userData:testData.user.user1,app:app})
 // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
 normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=userId
 });



 it(`DELETE`,async function(){
 parameter[`method`]=e_method.DELETE
 await inputRule_API_tester.ruleCheckAll_async({
 parameter:parameter,
 expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
 expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
 })
 })
 })*/

/*describe('inputRule:DELETE', async function() {
 before('prepare', async function () {
 /!*========== 设置parameter =======*!/
 url=``
 finalUrl = baseUrl + url
 parameter[`method`]=e_method.DELETE
 parameter[`APIUrl`]=finalUrl

 // console.log(`######   delete exist record   ######`)
 /!*              root admin login                    *!/
 parameter.sess = await API_helper.adminUserLogin_returnSess_async({
 userData: testData.admin_user.adminRoot,
 adminApp: adminApp
 })
 // console.log(`testData.user.user1 is=============>${JSON.stringify(testData.user.user1)}`)
 /!*              delete/create/getId  user1                    *!/
 let result=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
 let userId=result.userId
 // await test_helper.deleteUserAndRelatedInfo_async({account:.account})
 // await API_helper.createUser_async({userData:testData.user.user1,app:app})
 // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
 normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=userId
 // console.log(`normalRecord===========>${JSON.stringify(normalRecord)}`)
 });


 it(`DELETE`,async function(){
 await inputRule_API_tester.ruleCheckAll_async({
 parameter:parameter,
 expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
 expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
 })
 })

 })*/


