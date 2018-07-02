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
const e_manipulateOperator=nodeEnum.ManipulateOperator

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
const e_joinPublicGroupHandleResult=mongoEnum.JoinPublicGroupHandleResult.DB
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
let unExistObjectIdCryptedByUser1,unExistObjectIdCryptedByUser2,unExistObjectIdCryptedByAdminRoot
// let articleId1
let data={values:{}}


let normalRecord={
    // [e_field.IMPEACH_COMMENT.]:'new impeach',
    [e_field.PUBLIC_GROUP.NAME]:'group name for user',
    [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.PERMIT_ALLOW,
}
let publicGroupInfo1=objectDeepCopy(normalRecord)
publicGroupInfo1[e_field.PUBLIC_GROUP.NAME]='group name for user1'
let publicGroupInfo2=objectDeepCopy(normalRecord)
publicGroupInfo2[e_field.PUBLIC_GROUP.NAME]='group name for user2'

describe('public group:',async function() {

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

        let user1PublicGroupInfo = objectDeepCopy(normalRecord)
        /**     user1 create public group with rule permit(to create join_request)      **/
        data.values = {}
        data.values[e_part.RECORD_INFO] = publicGroupInfo1
        publicGroupId1CryptedByUser1 = await publicGroupAPI.createPublicGroup_returnId_async({sess: user1Sess,data: data,app: app})
        publicGroupId1 = await commonAPI.decryptObjectId_async({objectId: publicGroupId1CryptedByUser1,sess: user1Sess})
        publicGroupId1CryptedByUser2 = await commonAPI.cryptObjectId_async({objectId: publicGroupId1, sess: user2Sess})
        publicGroupId1CryptedByAdminRoot = await commonAPI.cryptObjectId_async({objectId: publicGroupId1,sess: adminRootSess})
        /**     unexist objectId        **/
        unExistObjectIdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})
        unExistObjectIdCryptedByUser2=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user2Sess})
        /**     user2 join public group1        **/
        data.values = {}
        data.values[e_part.RECORD_INFO] = {
            [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:publicGroupId1CryptedByUser2
        }
        await joinPublicGroupRequestAPI.createJoinPublicGroupRequest_returnId_async({sess:user2Sess,data:data,app:app})



        let condition={
            [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:publicGroupId1,
            [e_field.JOIN_PUBLIC_GROUP_REQUEST.CREATOR_ID]:user2Id,
            [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.UNTREATED,
        }
        tmpResult = await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.join_public_group_request,condition:condition})
       /* data.values = {}
        data.values[e_part.RECORD_ID] = await commonAPI.cryptObjectId_async({objectId:tmpResult[0]['_id'],sess:user1Sess})
        await joinPublicGroupRequestAPI.updateJoinPublicGroupAcceptRequest_returnReturn_async({sess:user1Sess,data:data,app:app})*/
        // ap.wrn('condition',condition)

        // ap.wrn('tmpResult',tmpResult)
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.join_public_group_request,id:tmpResult[0]['_id'],updateFieldsValue:{[e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.ACCEPT}})
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:publicGroupId1,updateFieldsValue:{"$push":{[e_field.PUBLIC_GROUP.MEMBERS_ID]:user2Id}}})
    })

    describe('create add/remove admin:',async  function() {
        let manageAdminInfo={
            // [e_field.PUBLIC_GROUP.ADMINS_ID]:{}
        }
        before('prepare', async function () {
            data.values = {}
            url = 'manageAdminMember'
            finalUrl = baseUrl + url
        })

        it('1.1 admin try to manage admin ', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByAdminRoot
            data.values[e_part.MANIPULATE_ARRAY] = manageAdminInfo
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })

        it('1.2 user1 try to manage unexist public group ', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=unExistObjectIdCryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] = manageAdminInfo
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.notFindGroup.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.3 user2 not creator, try to manage public group 1 ', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser2
            data.values[e_part.MANIPULATE_ARRAY] = manageAdminInfo
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.notCreatorCantAddRemoveAdmin.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.4 user1  try to manage public group 1 with empty array', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] = {}
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.canOnlyContain1Field.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        /**     无法测试，browserInput中，只有一个adminIds是数组，没有其他类型是数组的字段来代替      **/
/*        it('1.5 user1  try to manage public group 1 with miss mandatory field', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] = {[e_field.PUBLIC_GROUP.ADMINS_ID]:null}
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.missField.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })*/
        it('1.6 user1  try to manage public group 1 with same userId in both add and remove', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] = {[e_field.PUBLIC_GROUP.ADMINS_ID]:{
                [e_manipulateOperator.ADD]:[publicGroupId1CryptedByUser1],
                    [e_manipulateOperator.REMOVE]:[publicGroupId1CryptedByUser1],
                }}
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.cantAddRemoveSameUser.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.7 user1  try to manage public group 1 with not member user3', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] = {[e_field.PUBLIC_GROUP.ADMINS_ID]:{
                    [e_manipulateOperator.ADD]:[user3IdCryptedByUser1],
                    // [e_manipulateOperator.REMOVE]:[publicGroupId1CryptedByUser1],
                }}
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.notPublicGroupMemberCantBeAdmin.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.8 user1  try to manage public group 1 with self who already admin member', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] = {[e_field.PUBLIC_GROUP.ADMINS_ID]:{
                    [e_manipulateOperator.ADD]:[user1IdCryptedByUser1],
                    // [e_manipulateOperator.REMOVE]:[publicGroupId1CryptedByUser1],
                }}
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.alreadyAdmin.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.9 user1  try to manage public group 1 with delete creator', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] = {[e_field.PUBLIC_GROUP.ADMINS_ID]:{
                    [e_manipulateOperator.REMOVE]:[user1IdCryptedByUser1],
                    // [e_manipulateOperator.REMOVE]:[publicGroupId1CryptedByUser1],
                }}
            expectedErrorRc = controllerError.creatorAddRemoveAdmin.cantDeletePublicGroupCreator.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
    })

    describe('remove member:',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = 'removeMember'
            finalUrl = baseUrl + url
        })
        it('2.1 admin try to remove member ', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByAdminRoot
            data.values[e_part.MANIPULATE_ARRAY] = {[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.2 user1 try to remove member for unexist public group', async function () {
            data.values[e_part.RECORD_ID]=unExistObjectIdCryptedByUser1
            // {'membersId':{'remove':[user1IdCryptedByUser1]}}
            data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerError.adminRemoveMember.notFindGroup.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.3 user2 is not admin, but try to remove member for public group1', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser2
            data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerError.adminRemoveMember.notAdminCantRemoveMember.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.4 user1 try to remove member for public group1 without field', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] ={}
            expectedErrorRc = controllerError.adminRemoveMember.canOnlyContain1Field.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.5 user1 try to remove member for public group1 with wrong field', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.ADMINS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerError.adminRemoveMember.missField.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.6 user1 try to add member for public group1 ', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'add':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerError.adminRemoveMember.wrongKeyExist.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
/*        it('2.7 user1 try to remove member for public group1 with empty user ', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':undefined}}
            expectedErrorRc = controllerError.adminRemoveMember.missMandatoryKey.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })*/
        it('2.8 user2 try to remove admin member for public group1 ', async function () {
            //user to admin
            let data={}
            data.values={}
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY]={
                [e_field.PUBLIC_GROUP.ADMINS_ID]:{[e_manipulateOperator.ADD]:[user2IdCryptedByUser1]},

            }
            await publicGroupAPI.manageAdminMember_async({sess:user1Sess,data:data,app:app})

            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser2
            data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user2IdCryptedByUser2]}}
            expectedErrorRc = controllerError.adminRemoveMember.cantRemoveAdmin.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            //user1 remove user2 from admin to normal
            data.values={}
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY]={
                [e_field.PUBLIC_GROUP.ADMINS_ID]:{[e_manipulateOperator.REMOVE]:[user2IdCryptedByUser1]},
            }
            await publicGroupAPI.manageAdminMember_async({sess:user1Sess,data:data,app:app})
        })
        it('2.9 user1 try to remove user2 duplicate ', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user2IdCryptedByUser1,user2IdCryptedByUser1]}}
            expectedErrorRc = controllerError.adminRemoveMember.removeMemberDuplicate.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
    })

    describe('request exit:',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = 'requestExit'
            finalUrl = baseUrl + url
        })
        it('3.1 admin try to exit public group ', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByAdminRoot
            // data.values[e_part.MANIPULATE_ARRAY] = {[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.2 user1 try to exit unexist public group', async function () {
            data.values[e_part.RECORD_ID]=unExistObjectIdCryptedByUser1
            // {'membersId':{'remove':[user1IdCryptedByUser1]}}
            // data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerError.requestExit.notFindGroup.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.3 user1 is creator try to exit public group', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            // {'membersId':{'remove':[user1IdCryptedByUser1]}}
            // data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = controllerError.requestExit.creatorCantExitPublicGroup.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.4 user2 is creator exit public group successful', async function () {
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser2
            // {'membersId':{'remove':[user1IdCryptedByUser1]}}
            // data.values[e_part.MANIPULATE_ARRAY] ={[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1IdCryptedByUser1]}}
            expectedErrorRc = 0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
    })
})


