/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/impeach_comment/impeach_comment_setting/impeach_comment_controllerError').controllerError

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
let baseUrl="/impeach_comment/",finalUrl,url

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
let categoryId,categoryIdCryptedByUser1
let articleId1,articleId1CryptedByUser1,article1CryptedByAdminRoot,article1CryptedByUser2
let articleId2,articleId2CryptedByUser1,articleId2CryptedByUser2
let articleId3,articleId3CryptedByUser2,articleId3CryptedByUser3
let impeachId1,impeachId1CryptedByUser1,impeachId1CryptedByUser2,impeachId1CryptedByAdminRoot
let impeachId2,impeachId2CryptedByUser1,impeachId2CryptedByUser2,impeachId2CryptedByAdminRoot
let impeachId3,impeachId3CryptedByUser1,impeachId3CryptedByUser2,impeachId3CryptedByAdminRoot,impeachId3CryptedByUser3

let impeachCommentId1,impeachCommentId1CryptedByUser1,impeachCommentId1CryptedByUser2,impeachCommentId1CryptedByAdminRoot,impeachCommentId1CryptedByUser3
let unExistObjectIdCryptedByUser1
// let articleId1
let data={values:{}}


let normalRecord={
    // [e_field.IMPEACH_COMMENT.]:'new impeach',
    // [e_field.IMPEACH_COMMENT.CONTENT]:'impeach for articlId 1234',
    [e_field.IMPEACH_COMMENT.IMPEACH_ID]:'59e441be1bff6335e44ae657',
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
// ap.wrn('adminRootSess',adminRootSess)

        unExistObjectIdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})
        /**     user1 create article and return articleId1    **/
        articleId1CryptedByUser1=await articleComponentFunction.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        // ap.wrn('articleId1CryptedByUser1',articleId1CryptedByUser1)
        articleId1=await commonAPI.decryptObjectId_async({objectId:articleId1CryptedByUser1,sess:user1Sess})
        // ap.wrn('recordId1',recordId1)
        article1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:articleId1,sess:adminRootSess})
        // ap.wrn('recordId1CryptedByAdminRoot',recordId1CryptedByAdminRoot)
        article1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:articleId1,sess:user2Sess})

        /**     user1 impeach  article1,then submit this impeach       **/
        let recordInfo={}
        recordInfo[e_field.IMPEACH.TITLE]='title is none'
        recordInfo[e_field.IMPEACH.CONTENT]='content is test'
        recordInfo[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId1CryptedByUser1
        data.values={}
        data.values[e_part.RECORD_INFO]=recordInfo
        // ap.wrn('data',data)
        impeachId1CryptedByUser1=await impeachAPI.createImpeachForArticle_returnImpeachId_async({data:data,userSess:user1Sess,app:app})
        // ap.wrn('impeachId1CryptedByUser1',impeachId1CryptedByUser1)
        impeachId1=await commonAPI.decryptObjectId_async({objectId:impeachId1CryptedByUser1,sess:user1Sess})
        impeachId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:impeachId1,sess:user2Sess})
        impeachId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:impeachId1,sess:adminRootSess})
        //提交impeach
        let impeachActionRecord={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId1CryptedByUser1,
        }
        await impeachActionAPI.createImpeachAction_async({sess:user1Sess,impeachActionInfo:impeachActionRecord,app:app})

        // adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})

        /**          user2 create a impeach, but delete it, then no one can add comment to it            **/
        articleId2CryptedByUser2=await articleComponentFunction.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        let impeachInfo2={}
        impeachInfo2[e_field.IMPEACH.TITLE]='title is none'
        impeachInfo2[e_field.IMPEACH.CONTENT]='content is test'
        impeachInfo2[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId2CryptedByUser2
        data.values={}
        data.values[e_part.RECORD_INFO]=impeachInfo2
        impeachId2CryptedByUser2=await impeachAPI.createImpeachForArticle_returnImpeachId_async({data:data,userSess:user2Sess,app:app})
        await impeachAPI.delete_impeach_async({impeachId:impeachId2CryptedByUser2,userSess:user2Sess,app:app})

        /**             user3 create impeach, not submit                **/
        articleId3CryptedByUser3=await articleComponentFunction.createArticle_setToFinish_returnArticleId_async({userSess:user3Sess,app:app})
        let impeachInfo3={}
        impeachInfo3[e_field.IMPEACH.TITLE]='title is none'
        impeachInfo3[e_field.IMPEACH.CONTENT]='content is test'
        impeachInfo3[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId3CryptedByUser3
        data.values={}
        data.values[e_part.RECORD_INFO]=impeachInfo3
        impeachId3CryptedByUser3=await impeachAPI.createImpeachForArticle_returnImpeachId_async({data:data,userSess:user3Sess,app:app})

        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    describe('create impeach comment:',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })

        it('1.1 admin try to create impeach comment', async function () {
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.2 user2 try to create impeach comment for user1s impeach', async function () {
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByUser2
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        /**     手工检查数据库是否只有一个impeach comment的记录     **/
        it('1.3 user1 try to create impeach comment while there is an NEW impeach comment exist', async function () {
            //user2 create a impeach comment for impeach1, but not update,make it stay in NEW
            let canbeReuseImpeachCommentId=await impeachCommentAPI.createImpeachComment_returnId_async({sess:user1Sess,impeachId:impeachId1CryptedByUser1,app:app})
// ap.wrn('prepare done')
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByUser1
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = 0
            let parsedRes=await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
            assert.deepStrictEqual(parsedRes.msg.id, canbeReuseImpeachCommentId)

            let canbeReuseImpeachCommentIdDecrypted=await commonAPI.decryptObjectId_async({objectId:canbeReuseImpeachCommentId,sess:user1Sess})
            await common_operation_model.findByIdAndRemove_async({dbModel:e_dbModel.impeach_comment,id:canbeReuseImpeachCommentIdDecrypted})
        })
        it('1.4 user1 try to create impeach comment for not exist impeach', async function () {
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = unExistObjectIdCryptedByUser1
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.5 user2 try to create impeach comment for deleted impeach', async function () {
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId2CryptedByUser2
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.6 user3 try to create impeach comment for NEW impeach', async function () {
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId3CryptedByUser3
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user3Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('1.7 user1 try to create impeach comment for DONE impeach', async function () {
            let originalDoc=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1})
            // ap.wrn('originalDoc',originalDoc)
            let updated=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:e_impeachState.DONE}})
            // ap.wrn('updated',updated)
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByUser1
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:originalDoc[e_field.IMPEACH.CURRENT_STATE]}})
        })
        it('1.8 user1 reach max comment num for impeach', async function () {
            let resourceRange=e_resourceRange.MAX_COMMENT_PER_IMPEACH_PER_USER
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC})
            // ap.wrn('originalSetting',originalSetting)
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:0})

            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByUser1
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = resourceCheckError.ifEnoughResource_async.totalImpeachCommentPerUserNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        })
    })


    describe('update(submit) impeach comment:',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
            /**     user1 add impeachComment for impeach1       **/
            impeachCommentId1CryptedByUser1= await impeachCommentAPI.createImpeachComment_returnId_async({sess:user1Sess,impeachId:impeachId1CryptedByUser1,app:app})
            ap.wrn('impeachCommentId1CryptedByUser1',impeachCommentId1CryptedByUser1)
            impeachCommentId1=await commonAPI.decryptObjectId_async({objectId:impeachCommentId1CryptedByUser1,sess:user1Sess})
            impeachCommentId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:impeachCommentId1,sess:adminRootSess})
            impeachCommentId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:impeachCommentId1,sess:user2Sess})
            impeachCommentId1CryptedByUser3=await commonAPI.cryptObjectId_async({objectId:impeachCommentId1,sess:user3Sess})


            normalRecord={}
            normalRecord[e_field.IMPEACH_COMMENT.CONTENT]='testtesttestteset'
        })
        it('2.1 admin try to update impeach comment', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID] = impeachCommentId1CryptedByAdminRoot
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.2 user1 try to change impeachId ', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachCommentId1CryptedByUser1
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1

            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID] = impeachCommentId1CryptedByUser1

            //expectedErrorRc = validateError.validateValue.fieldValueShouldNotExistSinceNoRelateApplyRange({}).rc
            expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.fieldNotMatchApplyRange.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,fieldName:[e_field.IMPEACH_COMMENT.IMPEACH_ID],app: app})

            delete normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]
        })
        it('2.3 user2 try to update user1s impeach comment', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachCommentId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser2

            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID] = impeachCommentId1CryptedByUser2

            expectedErrorRc = controllerError.update.notImpeachCreatorCantUpdateComment.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            delete normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]
        })
        it('2.4 user1 try to update non NEW impeach comment ', async function () {
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach_comment,id:impeachCommentId1,updateFieldsValue:{[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]:e_documentStatus.COMMIT}})
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1

            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID] = impeachCommentId1CryptedByUser1

            expectedErrorRc = controllerError.update.impeachCommentAlreadyCommitCantBeUpdate.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach_comment,id:impeachCommentId1,updateFieldsValue:{[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]:e_documentStatus.NEW}})
        })
        it('2.5 user1 try to update impeach comment status', async function () {

            normalRecord[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]=e_documentStatus.NEW

            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID] = impeachCommentId1CryptedByUser1

            expectedErrorRc = validateError.validateFormat.recordInfoFiledRuleNotDefine.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            delete normalRecord[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]
        })
        it('2.6 user1 try to update impeach comment with XSS ', async function () {
            let originContent=normalRecord[e_field.IMPEACH_COMMENT.CONTENT]
            normalRecord[e_field.IMPEACH_COMMENT.CONTENT]='<script><alert></alert></script>'
            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID] = impeachCommentId1CryptedByUser1

            expectedErrorRc = inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            normalRecord[e_field.IMPEACH_COMMENT.CONTENT]=originContent
        })
    })

})


