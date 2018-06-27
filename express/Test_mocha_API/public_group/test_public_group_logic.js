/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/public_group/public_group_setting/public_group_controllerError').controllerError
let baseUrl="/public_group/",finalUrl,url
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
let publicGroupId2,publicGroupId2CryptedByUser1,publicGroupId2CryptedByUser2,publicGroupId2CryptedByAdminRoot
let publicGroupId3CryptedByUser1,publicGroupId3CryptedByUser2,publicGroupId3CryptedByUser3,publicGroupId3CryptedByAdminRoot

let impeachCommentId1,impeachCommentId1CryptedByUser1,impeachCommentId1CryptedByUser2,impeachCommentId1CryptedByAdminRoot,impeachCommentId1CryptedByUser3
let unExistObjectIdCryptedByUser1
// let articleId1
let data={values:{}}


let normalRecord={
    // [e_field.IMPEACH_COMMENT.]:'new impeach',
    [e_field.PUBLIC_GROUP.NAME]:'group name for user',
    [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.ANYONE_ALLOW,
}
let publicGroupInfo1=objectDeepCopy(normalRecord)
publicGroupInfo1[e_field.PUBLIC_GROUP.NAME]='group name for user1'
let publicGroupInfo2=objectDeepCopy(normalRecord)
publicGroupInfo2[e_field.PUBLIC_GROUP.NAME]='group name for user2'

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

        let user1PublicGroupInfo=objectDeepCopy(normalRecord)
        user1PublicGroupInfo=
        /**     user1 create public group with rule permit      **/
        data.values={}
        data.values[e_part.RECORD_INFO]=publicGroupInfo1
        publicGroupId1CryptedByUser1=await publicGroupAPI.createPublicGroup_returnId_async({sess:user1Sess,data:data,app:app})
        publicGroupId1=await commonAPI.decryptObjectId_async({objectId:publicGroupId1CryptedByUser1,sess:user1Sess})
        publicGroupId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:user2Sess})
        publicGroupId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:adminRootSess})
        /**     user2 create public group with rule permit      **/
        data.values={}
        data.values[e_part.RECORD_INFO]=publicGroupInfo2
        publicGroupId2CryptedByUser2=await publicGroupAPI.createPublicGroup_returnId_async({sess:user2Sess,data:data,app:app})
        publicGroupId2=await commonAPI.decryptObjectId_async({objectId:publicGroupId2CryptedByUser2,sess:user1Sess})
        // publicGroupId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:user2Sess})
        // publicGroupId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:adminRootSess})
    })

    describe('create public group',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })

        it('1.1 admin try to create public group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.2 user2 try to create a public group with same name as user1s public group ', async function () {
            data.values={}
            data.values[e_part.RECORD_INFO]=publicGroupInfo1
            expectedErrorRc = inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.3 public group name XSS', async function () {
            let originName=publicGroupInfo1[e_field.PUBLIC_GROUP.NAME]
            data.values={}
            publicGroupInfo1[e_field.PUBLIC_GROUP.NAME]=`<script></script>`
            data.values[e_part.RECORD_INFO]=publicGroupInfo1
            expectedErrorRc = inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            publicGroupInfo1[e_field.PUBLIC_GROUP.NAME]=originName
        })
        it('1.4 user1 reach max public group num ', async function () {
            let resourceRange=e_resourceRange.MAX_PUBLIC_GROUP_NUM
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC})
            // ap.wrn('originalSetting',originalSetting)
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:0})

            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByUser1
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = resourceCheckError.ifEnoughResource_async.totalPublicGroupPerUserNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        })
    })

    describe('update public group',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })
        it('2.1 admin try to update user1s public group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = publicGroupId1CryptedByAdminRoot
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.2 user2 try to update user1s public group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = publicGroupId1CryptedByUser2
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.update.notUserGroupAdminCantUpdate.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.3 public group name XSS', async function () {
            let originName=normalRecord[e_field.PUBLIC_GROUP.NAME]
            data.values={}
            normalRecord[e_field.PUBLIC_GROUP.NAME]=`<script></script>`
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc = inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            normalRecord[e_field.PUBLIC_GROUP.NAME]=originName
        })
        it('2.4 user2 try to update public group name same as user1s public group name', async function () {
            data.values={}
            data.values[e_part.RECORD_ID]=publicGroupId2CryptedByUser2
            data.values[e_part.RECORD_INFO]=publicGroupInfo1
            expectedErrorRc = inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
    })

    describe('delete public group',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })
        it('3.1 admin try to delete user1s public group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = publicGroupId1CryptedByAdminRoot
            // data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.2 user2 try to delete user1s public group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = publicGroupId1CryptedByUser2
            // data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.delete.notGroupCreatorCantDelete.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.3 user1 try to delete public group with member id exceed 1', async function () {
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:publicGroupId1,updateFieldsValue:{"$push":{[e_field.PUBLIC_GROUP.MEMBERS_ID]:testData.unExistObjectId}}})
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = publicGroupId1CryptedByUser1
            // data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.delete.cantDeleteGroupContainMember.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:publicGroupId1,updateFieldsValue:{"$pull":{[e_field.PUBLIC_GROUP.MEMBERS_ID]:testData.unExistObjectId}}})
        })
    })
})


