/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_action_controllerError').controllerError

/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

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
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachAllAction=mongoEnum.ImpeachAllAction.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB

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

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
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
let baseUrl="/impeach_action/",finalUrl,url

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
let articleId3,articleId3CryptedByUser2
let impeachId1,impeachId1CryptedByUser1,impeachId1CryptedByUser2,impeachId1CryptedByAdminRoot
// let articleId1
let data={values:{}}


let normalRecord={
    [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
    // [e_field.IMPEACH_ACTION.CREATOR_COLL]:e_coll.USER,
    // [e_field.IMPEACH_ACTION.CREATOR_ID]:undefined,
    [e_field.IMPEACH_ACTION.IMPEACH_ID]:undefined,
}

describe('impeach:',async  function() {

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
        /**     user1 create article and return articleId1    **/
        articleId1CryptedByUser1 = await articleAPI.createNewArticle_returnArticleId_async({
            userSess: user1Sess,
            app: app
        })
        // ap.wrn('articleId1CryptedByUser1',articleId1CryptedByUser1)
        articleId1 = await commonAPI.decryptObjectId_async({objectId: articleId1CryptedByUser1, sess: user1Sess})
        // ap.wrn('recordId1',recordId1)
        article1CryptedByAdminRoot = await commonAPI.cryptObjectId_async({objectId: articleId1, sess: adminRootSess})
        // ap.wrn('recordId1CryptedByAdminRoot',recordId1CryptedByAdminRoot)
        article1CryptedByUser2 = await commonAPI.cryptObjectId_async({objectId: articleId1, sess: user2Sess})
        /**     user1 update article to status finish       **/
        data.values = {}
        data.values[e_part.RECORD_ID] = articleId1CryptedByUser1
        data.values[e_part.RECORD_INFO] = {[e_field.ARTICLE.STATUS]: e_articleStatus.FINISHED}
        await articleAPI.updateArticle_returnArticleId_async({userSess: user1Sess, data: data, app: app})

        /**     user1 impeach  article1       **/
        let recordInfo ={
            [e_field.IMPEACH.IMPEACHED_ARTICLE_ID] : articleId1CryptedByUser1,
            [e_field.IMPEACH.CONTENT]:'impeach test test',
            [e_field.IMPEACH.TITLE]:'impeach test test',
        }
        data.values = {}
        data.values[e_part.RECORD_INFO] = recordInfo
        // ap.wrn('data',data)
        impeachId1CryptedByUser1 = await impeachAPI.createImpeachForArticle_returnImpeachId_async({data: data,userSess: user1Sess,app: app})
        // ap.wrn('impeachId1CryptedByUser1',impeachId1CryptedByUser1)
        impeachId1 = await commonAPI.decryptObjectId_async({objectId: impeachId1CryptedByUser1, sess: user1Sess})
        impeachId1CryptedByUser2 = await commonAPI.cryptObjectId_async({objectId: impeachId1, sess: user2Sess})
        impeachId1CryptedByAdminRoot = await commonAPI.cryptObjectId_async({objectId: impeachId1, sess: adminRootSess})

        /**     user2 submit impeach1      **/

    })


    describe('create impeach action:', async function () {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })
        it('1.1 admin try to create impeach action through normal users url', async function () {
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByAdminRoot
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user3IdCryptedByAdminRoot
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('1.2 impeach Id not exist', async function () {
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=await commonAPI.cryptObjectId_async({objectId: testData.unExistObjectId, sess: user1Sess})
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.3 action duplicated', async function () {
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=[e_impeachUserAction.SUBMIT,e_impeachUserAction.SUBMIT]

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=validateError.validateValue.CUDTypeWrong.rc
            await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.IMPEACH_ACTION.ACTION,app:app})
        })

        it('1.4 user1 try to create action for deleted impeach', async function () {
            //delete impeach
            await impeachAPI.delete_impeach_async({impeachId:impeachId1CryptedByUser1,userSess:user1Sess,app:app})

            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.relatedImpeachAlreadyDeleted.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //restore impeach
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{"$unset":{'dDate':1}}})
        })
        it('1.5 user1 try to create action for finished impeach', async function () {
            //update impeach to done
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:e_impeachState.DONE}})
            normalRecord={}
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.impeachAlreadyDone.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //restore impeach
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:e_impeachState.EDITING}})
        })
        it('1.6 user2 try to create action for user1 created impeach', async function () {
            normalRecord={}
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser2
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser2
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('1.7 action not for normal user', async function () {
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAllAction.REJECT

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.invalidActionForUser.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.8 user1 try to create create_action ', async function () {
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAllAction.CREATE

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.forbidActionForUser.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.9 admin owner id not allow for normal user ', async function () {
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAllAction.SUBMIT

            normalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=user1IdCryptedByUser1

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.forbidInputOwnerId.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('1.10 next action is not correct(revoke not ok for create) ', async function () {
            normalRecord={}
            normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByUser1
            // normalRecord[e_field.IMPEACH_ACTION.CREATOR_ID]=user1IdCryptedByUser1
            normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAllAction.REVOKE

            // normalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=user1IdCryptedByUser1

            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.invalidActionBaseOnCurrentAction.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
    })
})



