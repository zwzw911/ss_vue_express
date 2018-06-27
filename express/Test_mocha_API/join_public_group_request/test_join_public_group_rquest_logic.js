/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/join_public_group_request/join_public_group_request_setting/join_public_group_request_controllerError').controllerError

/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
const assert=require(`assert`)
/******************    待测函数  **************/
const app=require('../../app')
const adminApp=require(`../../../express_admin/app`)

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
const e_impeachState=mongoEnum.ImpeachState.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB
const e_documentStatus=mongoEnum.DocumentStatus.DB
const e_impeachUserAction=mongoEnum.ImpeachAllAction.DB
const e_publicGroupJoinInRule=mongoEnum.PublicGroupJoinInRule.DB
const e_dbModel=require('../../server/constant/genEnum/dbModel')
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart


const e_iniSettingObject=require('../../server/constant/genEnum/initSettingObject').iniSettingObject

/******************    数据库函数  **************/

/****************  公共函数 ********************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const common_operation_model=server_common_file_require.common_operation_model
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API
const impeachAPI=server_common_file_require.impeach_API
const impeachActionAPI=server_common_file_require.impeachAction_API
const impeachCommentAPI=server_common_file_require.impeachComment_API
const publicGroupAPI=server_common_file_require.publicGroup_API
const joinPublicGroupRequestAPI=server_common_file_require.joinPublicGroupRequest_API

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
const resourceCheckError=server_common_file_require.helperError.resourceCheck
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck



// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
/****************  变量 ********************/
let baseUrl="/join_public_group_request/",finalUrl,url

let recordId1,recordId2,recordId3,expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId

let recordId1CryptedByAdminRoot,recordId1CryptedByUser1,recordId1CryptedByUser2,recordId1CryptedByUser3,recordId2CryptedByUser2
let folderId1,folderId1CryptedByUser1,folderId1CryptedByUser2
let folderId2,folderId2CryptedByUser1,folderId2CryptedByUser2
let unexistFolderId,unexistFolderIdCryptedByUser1
let publicGroupId1,publicGroupId1CryptedByUser1,publicGroupId1CryptedByUser2,publicGroupId1CryptedByAdminRoot
let publicGroupId2CryptedByUser1,publicGroupId2CryptedByUser2,publicGroupId2CryptedByAdminRoot
let publicGroupId3,publicGroupId3CryptedByUser1,publicGroupId3CryptedByUser2,publicGroupId3CryptedByUser3,publicGroupId3CryptedByAdminRoot

let impeachCommentId1,impeachCommentId1CryptedByUser1,impeachCommentId1CryptedByUser2,impeachCommentId1CryptedByAdminRoot,impeachCommentId1CryptedByUser3
let unExistObjectIdCryptedByUser1
let user2RequestToPublicGroup1,user2RequestToPublicGroup1CryptedByUser1,user2RequestToPublicGroup1CryptedByUser2,user2RequestToPublicGroup1CryptedByAdminRoot
// let articleId1
let data={values:{}}


let normalRecord={
    // [e_field.IMPEACH_COMMENT.]:'new impeach',
    // [e_field.IMPEACH_COMMENT.CONTENT]:'impeach for articlId 1234',
    [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:'59e441be1bff6335e44ae657',
}

describe('impeach comment:',async function() {

    before('prepare', async function () {
        let tmpResult = await generateTestData.getUserCryptedUserId_async({app: app, adminApp: adminApp})

        user1IdCryptedByUser1 = tmpResult['user1IdCryptedByUser1']
        user1IdCryptedByUser2 = tmpResult['user1IdCryptedByUser2']
        user1IdCryptedByUser3 = tmpResult['user1IdCryptedByUser3']
        user2IdCryptedByUser1 = tmpResult['user2IdCryptedByUser1']
        user2IdCryptedByUser2 = tmpResult['user2IdCryptedByUser2']
        user2IdCryptedByUser3 = tmpResult['user2IdCryptedByUser3']
        user3IdCryptedByUser1 = tmpResult['user3IdCryptedByUser1']
        user3IdCryptedByUser2 = tmpResult['user3IdCryptedByUser2']
        user3IdCryptedByUser3 = tmpResult['user3IdCryptedByUser3']
        user3IdCryptedByAdminRoot = tmpResult['user3IdCryptedByAdminRoot']
        adminRootIdCryptedByUser1 = tmpResult['adminRootIdCryptedByUser1']
        user1Sess = tmpResult['user1Sess']
        user2Sess = tmpResult['user2Sess']
        user3Sess = tmpResult['user3Sess']
        adminRootSess = tmpResult['adminRootSess']
        user1Id = tmpResult['user1Id']
        user2Id = tmpResult['user2Id']
        user3Id = tmpResult['user3Id']
        adminRootId = tmpResult['adminRootId']

        /**     user1 create public group with rule permit      **/
        let publicGroupInfo={
            [e_field.PUBLIC_GROUP.NAME]:'test group 1',
            [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.PERMIT_ALLOW
        }
        data.values={}
        data.values[e_part.RECORD_INFO]=publicGroupInfo
        publicGroupId1CryptedByUser1=await publicGroupAPI.createPublicGroup_returnId_async({sess:user1Sess,data:data,app:app})
        publicGroupId1=await commonAPI.decryptObjectId_async({objectId:publicGroupId1CryptedByUser1,sess:user1Sess})
        publicGroupId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:user2Sess})
        publicGroupId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:adminRootSess})
        /**     user2 send a request to join public group1       **/
        data.values={}
        data.values[e_part.RECORD_INFO]={[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:publicGroupId1CryptedByUser2}
        //入群请求不返回id
        await joinPublicGroupRequestAPI.createJoinPublicGroupRequest_returnId_async({sess:user2Sess,data:data,app:app})
        let condition={
            [e_field.JOIN_PUBLIC_GROUP_REQUEST.CREATOR_ID]:user2Id,
            [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:publicGroupId1,
        }
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.join_public_group_request,condition:condition})
        user2RequestToPublicGroup1=tmpResult[0]['_id']
        ap.wrn('user2RequestToPublicGroup1',user2RequestToPublicGroup1)
        // user2RequestToPublicGroup1=await commonAPI.decryptObjectId_async({objectId:user2RequestToPublicGroup1CryptedByUser2,sess:user2Sess})
        user2RequestToPublicGroup1CryptedByUser1=await commonAPI.cryptObjectId_async({objectId:user2RequestToPublicGroup1,sess:user1Sess})
        user2RequestToPublicGroup1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:user2RequestToPublicGroup1,sess:user2Sess})
        user2RequestToPublicGroup1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:user2RequestToPublicGroup1,sess:adminRootSess})
        /**     user2 create public group with rule anyone      **/
        publicGroupInfo={
            [e_field.PUBLIC_GROUP.NAME]:'test group 2',
            [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.ANYONE_ALLOW
        }
        data.values={}
        data.values[e_part.RECORD_INFO]=publicGroupInfo
        publicGroupId2CryptedByUser2=await publicGroupAPI.createPublicGroup_returnId_async({sess:user2Sess,data:data,app:app})
        /**     user3 create public group with rule noone      **/
        publicGroupInfo={
            [e_field.PUBLIC_GROUP.NAME]:'test group 3',
            [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.NOONE_ALLOW
        }
        data.values={}
        data.values[e_part.RECORD_INFO]=publicGroupInfo
        publicGroupId3CryptedByUser3=await publicGroupAPI.createPublicGroup_returnId_async({sess:user3Sess,data:data,app:app})
        publicGroupId3=await commonAPI.decryptObjectId_async({objectId:publicGroupId3CryptedByUser3,sess:user3Sess})
        publicGroupId3CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:publicGroupId3,sess:user2Sess})
        /**     crypt unexistFolderIdCryptedByUser1     **/
        unexistFolderIdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})

        normalRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]=publicGroupId1CryptedByUser1
    })

    describe('create request',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })

        it('1.1 admin try to create request', async function () {
            normalRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID] = publicGroupId1CryptedByAdminRoot
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.2 user1 try to join unexist public group', async function () {
            normalRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID] = unexistFolderIdCryptedByUser1
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.3 user2 reach max  public group1 request decline', async function () {
            let resourceRange=e_resourceRange.MAX_DECLINE_JOIN_REQUEST
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC})
            // ap.wrn('originalSetting',originalSetting)
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:0})

            normalRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID] = publicGroupId1CryptedByUser2
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = resourceCheckError.ifEnoughResource_async.totalJoinPubliGroupDeclineNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        })
        it('1.4 user1 try to join own public group', async function () {
            normalRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID] = publicGroupId1CryptedByUser1
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.create.alreadyInPublicGroup.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.5 user2 already send request join public group 1', async function () {
            normalRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID] = publicGroupId1CryptedByUser2
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.create.requestAlreadyExist.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.6 user2 try to send request to join public group 3 which forbid join', async function () {
            normalRecord[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID] = publicGroupId3CryptedByUser2
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.create.publicGroupNotAllowJoin.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
    })

    describe('update request',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = 'accept'
            finalUrl = baseUrl + url
        })

        it('2.1 admin try to update request', async function () {

            data.values[e_part.RECORD_ID] = user2RequestToPublicGroup1CryptedByAdminRoot
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.2 user2 not public group1s admin,but try to accept request', async function () {

            data.values[e_part.RECORD_ID] = user2RequestToPublicGroup1CryptedByUser2
            expectedErrorRc = controllerError.update.notPublicGroupAdminMemberCantHandleJoinRequest.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.3 user1 is public group1s admin,try to accept request', async function () {

            data.values[e_part.RECORD_ID] = user2RequestToPublicGroup1CryptedByUser1
            expectedErrorRc = 0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
    })
})


