/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/article_comment/article_comment_setting/article_comment_controllerError').controllerError

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
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB


const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart



/******************    数据库函数  **************/

/****************  公共函数 ********************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt

const generateTestData=server_common_file_require.generateTestData

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule


/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerCheckerError=server_common_file_require.helperError.checker
const systemError=server_common_file_require.assistError.systemError
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck
const resourceCheckError=server_common_file_require.helperError.resourceCheck
// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy



// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
/****************  变量 ********************/
let baseUrl="/article_comment/",finalUrl,url

let recordId1,recordId2,recordId3,expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId

let recordId1CryptedByAdminRoot,recordId1CryptedByUser2,recordId1CryptedByUser3,recordId2CryptedByUser2
let recordId1CryptedByUser1,recordId11CryptedByUser1
let data={values:{}}


let normalRecord={
    [e_field.ARTICLE_COMMENT.CONTENT]:"new article comment",
    [e_field.ARTICLE_COMMENT.ARTICLE_ID]:undefined,
    // [e_field.ARTICLE_COMMENT.FOLDER_ID]:undefined,

}

describe('article comment logic test:',async  function() {

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

        /**     user1 create article1 and return recordId1    **/
        recordId1CryptedByUser1 = await articleAPI.createNewArticle_returnArticleId_async({userSess: user1Sess,app: app})
        recordId1=await commonAPI.decryptObjectId_async({objectId:recordId1CryptedByUser1,sess:user1Sess})
        // ap.wrn('recordId1',recordId1)
        recordId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:recordId1,sess:adminRootSess})
        /**     user1 create article2 and update to finish    **/
        recordId11CryptedByUser1 = await articleAPI.createNewArticle_returnArticleId_async({userSess: user1Sess,app: app})
        data.values = {
            [e_part.RECORD_ID]: recordId11CryptedByUser1,
            [e_part.RECORD_INFO]: {[e_field.ARTICLE.STATUS]: e_articleStatus.FINISHED}
        }
        await articleAPI.updateArticle_returnArticleId_async({userSess: user1Sess, data: data, app: app})
        // ap.wrn('recordId1CryptedByAdminRoot',recordId1CryptedByAdminRoot)
        /**     user2 create article2 and return recordId2, then update to change status to editing    **/
        recordId2CryptedByUser2 = await articleAPI.createNewArticle_returnArticleId_async({userSess: user2Sess,app: app})
        // let values=
        data.values = {
            [e_part.RECORD_ID]: recordId2CryptedByUser2,
            [e_part.RECORD_INFO]: {[e_field.ARTICLE.STATUS]: e_articleStatus.EDITING}
        }
        await articleAPI.updateArticle_returnArticleId_async({userSess: user2Sess, data: data, app: app})
        /**     admin create penalize for user3     **/
/*        adminRootSess = await adminUserComponentFunction.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })*/
        // adminRootId = await db_operation_helper.getAdminUserId_async({userName: testData.admin_user.adminRoot.name})
        //create penalize for user3
        let adminRootSalt = await commonAPI.getTempSalt_async({sess: adminRootSess})
        // ap.inf('root user salt',adminRootSalt)
        let cryptedUser3Id = crypt.encryptSingleValue({fieldValue: user3Id, salt: adminRootSalt}).msg
        // ap.inf('cryptedUser3Id',cryptedUser3Id)
        let penalizeInfoForUser3 = {
            penalizeType: e_penalizeType.NO_ARTICLE_COMMENT,
            penalizeSubType: e_penalizeSubType.ALL,
            // penalizedError:undefined, //错误根据具体method定义
            [e_field.ADMIN_PENALIZE.DURATION]: 0,
            [e_field.ADMIN_PENALIZE.REASON]: 'test reason, no indication',
        }
        await penalizeAPI.createPenalize_returnPenalizeId_async({
            adminUserSess: adminRootSess,
            penalizeInfo: penalizeInfoForUser3,
            penalizedUserId: cryptedUser3Id,
            adminApp: adminApp
        })
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });
    describe('create article comment:',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })
        it('1.1 admin try to create article comment', async function () {
            normalRecord[e_field.ARTICLE_COMMENT.ARTICLE_ID]=recordId1CryptedByAdminRoot
            data.values={[e_part.RECORD_INFO]:normalRecord}
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.2 user1 try to create comment with  unexist article ', async function () {
            normalRecord[e_field.ARTICLE_COMMENT.ARTICLE_ID]=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})
            data.values={[e_part.RECORD_INFO]:normalRecord}
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.3 user1 try to create  comment with XSS ', async function () {
            normalRecord[e_field.ARTICLE_COMMENT.ARTICLE_ID]=recordId11CryptedByUser1
            normalRecord[e_field.ARTICLE_COMMENT.CONTENT]='<acript><alert>test</alert>></acript>'
            data.values={[e_part.RECORD_INFO]:normalRecord}
            expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.4 user1 reach max comment per article ', async function () {
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COMMENT_PER_ARTICLE,resourceType:e_resourceType.BASIC})
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COMMENT_PER_ARTICLE,resourceType:e_resourceType.BASIC,num:0})

            normalRecord[e_field.ARTICLE_COMMENT.ARTICLE_ID]=recordId11CryptedByUser1
            normalRecord[e_field.ARTICLE_COMMENT.CONTENT]='灌水15字，灌水15字，灌水15字，灌水15字，灌水15字'
            data.values={[e_part.RECORD_INFO]:normalRecord}
            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalCommentPerArticleNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COMMENT_PER_ARTICLE,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        })
        it('1.5 user1 reach max comment per article per user', async function () {
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COMMENT_PER_ARTICLE_PER_USER,resourceType:e_resourceType.BASIC})
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COMMENT_PER_ARTICLE_PER_USER,resourceType:e_resourceType.BASIC,num:0})

            normalRecord[e_field.ARTICLE_COMMENT.ARTICLE_ID]=recordId11CryptedByUser1
            normalRecord[e_field.ARTICLE_COMMENT.CONTENT]='灌水15字，灌水15字，灌水15字，灌水15字，灌水15字'
            data.values={[e_part.RECORD_INFO]:normalRecord}
            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalCommentPerArticlePerUserNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COMMENT_PER_ARTICLE_PER_USER,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        })

        it('1.6 user1 try to update article with status new, response no fk exist', async function () {
            normalRecord[e_field.ARTICLE_COMMENT.ARTICLE_ID]=recordId1CryptedByUser1
            data.values={[e_part.RECORD_INFO]:normalRecord}
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('1.7 user2 try to update article with status editing,response no fk exist', async function () {
            normalRecord[e_field.ARTICLE_COMMENT.ARTICLE_ID]=recordId2CryptedByUser2
            data.values={[e_part.RECORD_INFO]:normalRecord}
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })

    })
})



