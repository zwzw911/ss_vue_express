/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/impeach/impeach_setting/impeach_controllerError').controllerError

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
const e_impeachAllAction=mongoEnum.ImpeachAllAction.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_impeachState=mongoEnum.ImpeachState.DB
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
let baseUrl="/impeach/",finalUrl,url

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
    [e_field.IMPEACH.TITLE]:'new impeach',
    [e_field.IMPEACH.CONTENT]:'impeach for articlId 1234',
    [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:'59e441be1bff6335e44ae657',
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
        articleId1CryptedByUser1=await articleAPI.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        // ap.wrn('articleId1CryptedByUser1',articleId1CryptedByUser1)
        articleId1=await commonAPI.decryptObjectId_async({objectId:articleId1CryptedByUser1,sess:user1Sess})
        // ap.wrn('recordId1',recordId1)
        article1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:articleId1,sess:adminRootSess})
        // ap.wrn('recordId1CryptedByAdminRoot',recordId1CryptedByAdminRoot)
        article1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:articleId1,sess:user2Sess})

        /**     user2 create article and return articleId2    **/
        articleId2CryptedByUser2=await articleAPI.createNewArticle_returnArticleId_async({userSess:user2Sess,app:app})
        // ap.wrn('articleId1CryptedByUser1',articleId1CryptedByUser1)
        articleId2=await commonAPI.decryptObjectId_async({objectId:articleId2CryptedByUser2,sess:user2Sess})
        /**     user2 update article to status finish       **/
        data.values={}
        data.values[e_part.RECORD_ID]=articleId2CryptedByUser2
        data.values[e_part.RECORD_INFO]={[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED}
        await articleAPI.updateArticle_returnArticleId_async({userSess:user2Sess,data:data,app:app})
        /**     user2 impeach  article2       **/
        let recordInfo=objectDeepCopy(normalRecord)
        recordInfo[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId2CryptedByUser2
        data.values={}
        data.values[e_part.RECORD_INFO]=recordInfo
        // ap.wrn('data',data)
        impeachId1CryptedByUser2=await impeachAPI.createImpeachForArticle_returnImpeachId_async({data:data,userSess:user2Sess,app:app})
        // ap.wrn('impeachId1CryptedByUser1',impeachId1CryptedByUser1)
        impeachId1=await commonAPI.decryptObjectId_async({objectId:impeachId1CryptedByUser2,sess:user2Sess})
        impeachId1CryptedByUser1=await commonAPI.cryptObjectId_async({objectId:impeachId1,sess:user1Sess})
        impeachId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:impeachId1,sess:adminRootSess})

        /**     user2 create article and return articleId3    **/
        articleId3CryptedByUser2=await articleAPI.createNewArticle_returnArticleId_async({userSess:user2Sess,app:app})
        // ap.wrn('articleId1CryptedByUser1',articleId1CryptedByUser1)
        articleId3=await commonAPI.decryptObjectId_async({objectId:articleId3CryptedByUser2,sess:user2Sess})
        /**     user2 update article to status finish       **/
        data.values={}
        data.values[e_part.RECORD_ID]=articleId3CryptedByUser2
        data.values[e_part.RECORD_INFO]={[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED}
        await articleAPI.updateArticle_returnArticleId_async({userSess:user2Sess,data:data,app:app})
    })



    describe('create impeach:',async  function() {
        before('prepare', async function () {
            data.values={}
            url='article'
            finalUrl=baseUrl+url
        })

        it('1.1 admin try to create article', async function () {
            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=article1CryptedByAdminRoot
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.2 articleId/commentId cant coexist', async function () {
            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId1CryptedByUser1
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=articleId1CryptedByUser1
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.cantImpeachMultiItem.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.3 articleId/commentId cant coexist', async function () {
            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=undefined
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=undefined
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.noImpeachedItem.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.4 articleId/commentId must match url', async function () {
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=articleId1CryptedByUser1
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerError.create.notSetImpeachedArticle.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('1.5 articleId not finished, treate as not exist', async function () {
            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId1CryptedByUser1
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=undefined
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('1.6 content XSS check', async function () {
            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId1CryptedByUser1
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=undefined
            normalRecord[e_field.IMPEACH.CONTENT]='<script><alert>test</alert></script>>'
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })



        it('1.7 user2 add too many  editing impeach', async function () {
            let resourceRange=e_resourceRange.MAX_SIMULTANEOUS_NEW_OR_EDITING_IMPEACH_PER_USER
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC})
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:0})

            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId3CryptedByUser2
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=undefined
            normalRecord[e_field.IMPEACH.CONTENT]='testetwetstasasdqwer'
            data.values[e_part.RECORD_INFO]=normalRecord

            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalNewOrEditingImpeachNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        })
        it('1.8 user2 add too many  wait assign impeach', async function () {
            let resourceRange=e_resourceRange.MAX_SIMULTANEOUS_WAIT_FOR_ASSIGN_IMPEACH_PER_USER
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC})
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:0})

            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId3CryptedByUser2
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=undefined
            normalRecord[e_field.IMPEACH.CONTENT]='testetwetstasasdqwer'
            data.values[e_part.RECORD_INFO]=normalRecord

            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalWaitAssignImpeachNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        })
        it('1.9 user2 try to impeach article2 again', async function () {
            normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId2CryptedByUser2
            normalRecord[e_field.IMPEACH.IMPEACHED_COMMENT_ID]=undefined
            normalRecord[e_field.IMPEACH.CONTENT]='testetwetstasasdqwer'
            data.values[e_part.RECORD_INFO]=normalRecord
            expectedErrorRc=controllerCheckerError.compoundFieldHasMultipleDuplicateRecord({collName:e_coll.IMPEACH,singleCompoundFieldName:'unique_impeach_for_article'}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
    })


    describe('update impeach:',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })

        it('2.1 admin try to update impeach', async function () {
            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByAdminRoot,
                [e_part.RECORD_INFO]: {
                    [e_field.IMPEACH.CONTENT]: 'new nametestete',
                }
            }
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('2.2 user1 try to update user2s impeach', async function () {
            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByUser1,
                [e_part.RECORD_INFO]: {
                    [e_field.IMPEACH.CONTENT]: 'new name test  test',
                }
            }
            expectedErrorRc = controllerError.update.notAuthorCantUpdateImpeach.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

        // it('2.3 user2 try to update impeach with impeached object change', async function () {
        //     data.values = {
        //         [e_part.RECORD_ID]: impeachId1CryptedByUser2,
        //         [e_part.RECORD_INFO]: {
        //             [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]: impeachId1CryptedByUser2,
        //         }
        //     }
        //     expectedErrorRc = browserInputRule.impeach.impeachedArticleId.require.error.rc
        //     await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // })

        it('2.4 user2 try to update impeach with CSS', async function () {
            let tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1})
// ap.inf('tmpResult',tmpResult)
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:e_impeachState.NEW}})
            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByUser2,
                [e_part.RECORD_INFO]: {
                    [e_field.IMPEACH.CONTENT]: '<script></script>',
                }
            }
            expectedErrorRc = inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:tmpResult[e_field.IMPEACH.CURRENT_STATE]}})
        })
        it('2.5 user2 try to update submitted impeach', async function () {
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId1,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:e_impeachState.WAIT_ASSIGN}})
            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByUser2,
                [e_part.RECORD_INFO]: {
                    [e_field.IMPEACH.CONTENT]: 'test testtest test',
                }
            }
            expectedErrorRc = controllerError.update.impeachedSubmittedCantUpdate.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach,updateFieldsValue:{[e_field.IMPEACH.CURRENT_STATE]:e_impeachState.EDITING}})
        })
    })

    describe('delete impeach:',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })

        it('3.1 admin try to delete impeach', async function () {
            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByAdminRoot,
            }
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.2 user1 try to delete user2s impeach', async function () {
            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByUser1,
            }
            expectedErrorRc = controllerError.delete.notCreatorCantDeleteImpeach.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.3 impeach in handle, cant delete', async function () {
            let impeachAction={
                [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:testData.randomObject.objectId1,
                [e_field.IMPEACH_ACTION.CREATOR_ID]:testData.randomObject.objectId2,
                [e_field.IMPEACH_ACTION.CREATOR_COLL]:'admin',
                [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId1,
                [e_field.IMPEACH_ACTION.ACTION]:e_impeachAllAction.ACCEPT
            }
            let tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_action,value:impeachAction})
            let adminActionRecordId=tmpResult['_id']


            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByUser2,
            }
            expectedErrorRc = controllerError.delete.impeachAlreadyHandledByAdmin.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            await common_operation_model.findByIdAndRemove_async({dbModel:e_dbModel.impeach_action,id:adminActionRecordId})
        })
        it('3.4 revoke successful', async function () {
            data.values = {
                [e_part.RECORD_ID]: impeachId1CryptedByUser2,
            }
            expectedErrorRc = 0
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
    })

})


/*
describe('impeach for delete ', async function() {
    let user1Info,user2Info,user3Info,user1Sess, user2Sess,user3Sess, user1Id, user2Id, article1Id, article2Id, impeach1Id, impeach2Id,data = {values: {}}
let adminRootSess,adminRootId,adminRootInfo


    //需要removeAll来排除创建时unique检测
    before('remove exists record', async function(){
        await API_helper.removeExistsRecord_async()
    })

    before('user1/2 recreate and login, then create article', async function () {
        let adminRootInfo=await component_function.getAdminUserSessUserId({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=adminRootInfo[`userId`]
        adminRootSess=adminRootInfo[`sess`]
// console.log(`admin login info=============>${JSON.stringify(adminRootInfo)}`)
        user1Info = await component_function.reCreateUser_returnSessUserId_async({userData: testData.user.user1,app: app})
        user1Sess = user1Info['sess']
        user2Info = await component_function.reCreateUser_returnSessUserId_async({userData: testData.user.user2,app: app})
        user2Sess = user2Info['sess']
        user3Info = await component_function.reCreateUser_returnSessUserId_async({userData: testData.user.user3,app: app})
        user3Sess = user3Info['sess']
        //create article then impeach, then submit, then assign
        article1Id = await component_function.createArticle_setToFinish_returnArticleId_async({userSess: user1Sess,app: app})
        impeach1Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user1Sess,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
        //user1 submit
        let impeachAction={
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach1Id,
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT
        }
        await API_helper.createImpeachAction_async({sess:user1Sess,impeachActionInfo:impeachAction,app:app})
        //adminRoot assign to self
        impeachAction={
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach1Id,
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
            [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminRootId
        }
        await API_helper.createImpeachAction_async({sess:adminRootSess,impeachActionInfo:impeachAction,app:adminApp})

        //create article then impeach
        article2Id = await component_function.createArticle_setToFinish_returnArticleId_async({userSess: user2Sess,app: app})
        impeach2Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article2Id,userSess:user2Sess,app:app})
    })

    it('user3 try to delete impeach1 created by user1', async function () {
        data.values={}
        data.values[e_part.RECORD_ID]=impeach1Id
        data.values[e_part.METHOD]=e_method.DELETE
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:controllerError.notCreatorCantDeleteImpeach.rc,app:app})

    });
    it('user1 try to delete impeach1 which already handled by adminUser', async function () {
        data.values={}
        data.values[e_part.RECORD_ID]=impeach1Id
        data.values[e_part.METHOD]=e_method.DELETE
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:controllerError.impeachAlreadyHandledByAdmin.rc,app:app})
    });
    it('user2 try to delete impeach2 successfully', async function () {
        data.values={}
        data.values[e_part.RECORD_ID]=impeach2Id
        data.values[e_part.METHOD]=e_method.DELETE
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:0,app:app})
    });
})*/
