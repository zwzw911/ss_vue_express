/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/article/article_setting/article_controllerError').controllerError

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
// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy



// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
/****************  变量 ********************/
let baseUrl="/article/",finalUrl,url

let recordId1,recordId2,recordId3,expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId

let recordId2CryptedByAdminRoot,recordId1CryptedByUser2,recordId1CryptedByUser3,recordId2CryptedByUser2
let recordId1CryptedByUser1
let data={values:{}}


let normalRecord={
    [e_field.ARTICLE.NAME]:"new article",
    [e_field.ARTICLE.STATUS]:e_articleStatus.NEW,
    [e_field.ARTICLE.FOLDER_ID]:undefined,
    [e_field.ARTICLE.HTML_CONTENT]:'<i>adsfasdfasdfsafasdfsfasdfsaf</i>',
    [e_field.ARTICLE.TAGS]:['test'],
    [e_field.ARTICLE.CATEGORY_ID]:undefined,
}

describe('user1 register unique check:',async  function() {

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

        /**     user1 create article and return recordId1    **/
        recordId1CryptedByUser1=await articleAPI.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        /**     admin create penalize for user3     **/
        //create penalize for user3
        let adminRootSalt = await commonAPI.getTempSalt_async({sess: adminRootSess})
        // ap.inf('root user salt',adminRootSalt)
        let cryptedUser3Id = crypt.encryptSingleValue({fieldValue: user3Id, salt: adminRootSalt}).msg
        // ap.inf('cryptedUser3Id',cryptedUser3Id)
        let penalizeInfoForUser3 = {
            penalizeType: e_penalizeType.NO_ARTICLE,
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


    /***************    create  new article   ***************/
    describe('create new article:',async  function() {
        let sess
        before('prepare', async function () {
            url=''
            finalUrl=baseUrl+url
            sess=await userAPI.getFirstSession({app})
        })
        it('1.1 user not login', async function() {
            // ap.inf('sess',sess)
            expectedErrorRc=controllerError.dispatch.post.notLoginCantCreateArticle.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.2 user in penalize cant create article', async function() {
            expectedErrorRc=controllerError.dispatch.post.userInPenalizeCantCreateArticle.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })

    /***************    update article   ***************/
    describe('update article:',async  function() {
        let sess
        before('prepare', async function () {
            url=''
            finalUrl=baseUrl+url
            sess=await userAPI.getFirstSession({app})
        })
        it('2.1 user not login', async function() {
            expectedErrorRc=controllerError.dispatch.put.notLoginCantUpdateArticle.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.2 user in penalize cant update', async function() {
            expectedErrorRc=controllerError.dispatch.put.userInPenalizeCantUpdateArticle.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.3 crypted RecordId format invalid', async function() {
            data.values={}
            data.values={
                [e_part.RECORD_ID]:1234,
                [e_part.RECORD_INFO]:{},
            }
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.4 decrypted RecordId format invalid', async function() {
            data.values={}
            data.values={
                [e_part.RECORD_ID]:testData.encryptedObjectId,
                [e_part.RECORD_INFO]:{
                    [e_field.ARTICLE.STATUS]:e_articleStatus.EDITING,
                },
            }
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdDecryptedValueFormatWrong.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.5 update allowComment with invalid data type', async function() {
            data.values={}
            data.values={
                [e_part.RECORD_ID]:recordId1CryptedByUser1,
                [e_part.RECORD_INFO]:{
                    [e_field.ARTICLE.ALLOW_COMMENT]:{},
                },
            }
            expectedErrorRc=validateError.validateValue.CUDTypeWrong.rc
            await misc_helper.putDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.ARTICLE.ALLOW_COMMENT],app:app})
        });
    })
})




