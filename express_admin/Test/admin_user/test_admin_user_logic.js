/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/**************  特定相关常量  ****************/
const controllerError=require('../../server/controller/admin/admin_setting/admin_user_controllerError').controllerError
let baseUrl="/admin_user/",finalUrl,url


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

const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart



/******************    数据库函数  **************/

/****************  公共函数 ********************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const adminUserAPI=server_common_file_require.admin_user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API
const impeachAPI=server_common_file_require.impeach_API
const friendGroupAPI=server_common_file_require.friend_group_API

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
const systemError=server_common_file_require.systemError
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck

let expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId
let adminUser1IdCryptedByAdminUser1,adminUser1IdCryptedByAdminUser2,adminUser1IdCryptedByAdminUser3,
    adminUser2IdCryptedByAdminUser1,adminUser2IdCryptedByAdminUser2,adminUser2IdCryptedByAdminUser3,
    adminUser3IdCryptedByAdminUser1,adminUser3IdCryptedByAdminUser2,adminUser3IdCryptedByAdminUser3,
    adminRootIdCryptedByAdminUser1,adminRootIdCryptedByAdminUser2,
    adminUser1Sess,adminUser2Sess,adminUser3Sess,
    adminUser1Id,adminUser2Id,adminUser3Id
let unExistObjectCryptedByUser1
let friendGroupId1,friendGroupId1CryptedByUser1
let data={values:{}}

describe('admin user dispatch:',async  function() {
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
        ap.inf('****************************************************************************')
        ap.inf('**********************       user done        ******************************')
        ap.inf('****************************************************************************')

        tmpResult = await generateTestData.getAdminUserCryptedUserId_async({app: app, adminRootSess:adminRootSess,adminApp: adminApp})
        // ap.wrn('tmp',tmpResult)
        adminUser1IdCryptedByAdminUser1 = tmpResult['adminUser1IdCryptedByAdminUser1']
        adminUser1IdCryptedByAdminUser2 = tmpResult['adminUser1IdCryptedByAdminUser2']
        // adminUser1IdCryptedByUser3 = tmpResult['adminUser1IdCryptedByUser3']
        adminUser2IdCryptedByAdminUser1 = tmpResult['adminUser2IdCryptedByAdminUser1']
        adminUser2IdCryptedByAdminUser2 = tmpResult['adminUser2IdCryptedByAdminUser2']
        // adminUser2IdCryptedByUser3 = tmpResult['adminUser2IdCryptedByUser3']
        // adminUser3IdCryptedByUser1 = tmpResult['adminUser3IdCryptedByUser1']
        // adminUser3IdCryptedByUser2 = tmpResult['adminUser3IdCryptedByUser2']
        // adminUser3IdCryptedByUser3 = tmpResult['adminUser3IdCryptedByUser3']
        // user3IdCryptedByAdminRoot = tmpResult['user3IdCryptedByAdminRoot']
        // adminRootIdCryptedByUser1 = tmpResult['adminRootIdCryptedByUser1']
        adminUser1Sess = tmpResult['adminUser1Sess']
        adminUser2Sess = tmpResult['adminUser2Sess']
        // adminUser3Sess = tmpResult['adminUser3Sess']
        // adminRootSess = tmpResult['adminRootSess']
        adminUser1Id = tmpResult['adminUser1Id']
        adminUser2Id = tmpResult['adminUser2Id']
        // adminUser3Id = tmpResult['adminUser3Id']
        // adminRootId = tmpResult['adminRootId']
        // ap.wrn('')
        adminRootIdCryptedByAdminUser1=await commonAPI.cryptObjectId_async({objectId:adminRootId,sess:adminUser1Sess})
        adminRootIdCryptedByAdminUser2=await commonAPI.cryptObjectId_async({objectId:adminRootId,sess:adminUser2Sess})
        ap.inf('****************************************************************************')
        ap.inf('**********************       admin user done  ******************************')
        ap.inf('****************************************************************************')
    })
    /*              create_admin_user中的错误               */
    describe('create admin user:', function() {
        let adminRootCaptcha,adminUser1Captcha,adminUser2Captcha,adminUser3Captcha
        before('prepare', async function () {
            url=''
            finalUrl=baseUrl+url

            // let rootSess=await adminUserAPI.getFirstAdminSession({adminApp:adminApp})
            //生成并获得captcha(for user login)
            await adminUserAPI.genAdminCaptcha({sess:adminRootSess,adminApp:adminApp})
            adminRootCaptcha=await adminUserAPI.getAdminCaptcha({sess:adminRootSess})

            await adminUserAPI.genAdminCaptcha({sess:adminUser1Sess,adminApp:adminApp})
            adminUser1Captcha=await adminUserAPI.getAdminCaptcha({sess:adminUser1Sess})

            await adminUserAPI.genAdminCaptcha({sess:adminUser2Sess,adminApp:adminApp})
            adminUser2Captcha=await adminUserAPI.getAdminCaptcha({sess:adminUser2Sess})

            // await adminUserAPI.genAdminCaptcha({sess:adminUser3Sess,adminApp:adminApp})
            // adminUser3Captcha=await adminUserAPI.getAdminCaptcha({sess:adminUser3Sess})
        })


        it('1.1 create root user not allow', async function() {
            data.values={}
            data.values[e_part.CAPTCHA]=adminRootCaptcha
            data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_TYPE]:e_adminUserType.ADMIN_ROOT,[e_field.ADMIN_USER.USER_PRIORITY]:['1']})
            expectedErrorRc=controllerError.create.cantCreateRootUserByAPI.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });
        it('1.2 adminUser2 without create priority try to create adminUser1', async function() {
            data.values={}
            // data.values[e_part.METHOD]=e_method.CREATE
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.CAPTCHA]=adminUser2Captcha
            data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser2,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]})

            expectedErrorRc=controllerError.create.currentUserHasNotPriorityToCreateUser.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });


        it('1.4 priority type is enum, value duplicate', async function() {
            data.values={}
            data.values[e_part.CAPTCHA]=adminRootCaptcha
            // data.values[e_part.METHOD]=e_method.CREATE
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser3,{[e_field.ADMIN_USER.USER_PRIORITY]:['1','1']})
            expectedErrorRc=inputValueLogicCheckError.ifEnumHasDuplicateValue.containDuplicateValue({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });
        it('1.6 create admin user1 again to unique check', async function() {
            data.values={}
            data.values[e_part.CAPTCHA]=adminRootCaptcha
            // data.values[e_part.METHOD]=e_method.CREATE
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1']})
            // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
            expectedErrorRc=inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });

        it('1.8 admin user1 try to create admin user3 with priority not own', async function() {
            data.values={}
            // data.values[e_part.METHOD]=e_method.CREATE
            data.values[e_part.CAPTCHA]=adminUser1Captcha
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.RECORD_INFO]=Object.assign({},testData.admin_user.adminUser3,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_REVIEW]})
            // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
            expectedErrorRc=controllerError.create.createUserPriorityNotInheritedFromParent.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
        });
    })

    describe('update user error:', function() {
        // let data={values:{method:e_method.UPDATE}},url=``,finalUrl=baseUrl+url
        before('prepare', async function () {
            url=''
            finalUrl=baseUrl+url
            // sess=await adminUserAPI.getFirstAdminSession({adminApp:adminApp})
        })

        it('2.1 user1 without priority try to update admin user2 ', async function() {
            data.values={}
            // data.values[e_part.METHOD]=e_method.UPDATE
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.RECORD_ID]=adminUser2IdCryptedByAdminUser1
            data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser2,{[e_field.ADMIN_USER.USER_PRIORITY]:['1']})
// ap.wrn('data',data)
            expectedErrorRc=controllerError.update.currentUserHasNotPriorityToUpdateUser.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });
        it('2.2 user2 update admin user1 without inherit priority', async function() {
            data.values={}
            // data.values[e_part.METHOD]=e_method.UPDATE
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.RECORD_ID]=adminUser1IdCryptedByAdminUser2
            data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]})
            expectedErrorRc=controllerError.update.updatePriorityNotInheritedFromParent.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

        });
        it('2.3 user2 with priority try to update root', async function() {
            data.values={}
            // data.values[e_part.METHOD]=e_method.UPDATE
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.RECORD_ID]=adminRootIdCryptedByAdminUser2
            data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.adminUser2,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.UPDATE_ADMIN_USER]})
            expectedErrorRc=controllerError.update.onlyRootCanUpdateRoot.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
        });
        it('2.4 user2 try to assign user1 priority which user2 not own ', async function() {
            data.values={}
            // data.values[e_part.METHOD]=e_method.UPDATE
            // console.log(`Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
            data.values[e_part.RECORD_ID]=adminUser1IdCryptedByAdminUser2
            data.values[e_part.RECORD_INFO]={[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.PENALIZE_USER]}
            expectedErrorRc=controllerError.update.updatePriorityNotInheritedFromParent.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
        });
    })

    describe('delete user error:', function() {
        before('prepare', async function () {
            url=''
            finalUrl=baseUrl+url
            // sess=await adminUserAPI.getFirstAdminSession({adminApp:adminApp})
        })

        it('3.1 user1 without priority try to delete admin user2 ', async function() {
// ap.wrn('adminRootIdCryptedByAdminUser1',adminRootIdCryptedByAdminUser1)
            data.values={}
            data.values[e_part.RECORD_ID]=adminRootIdCryptedByAdminUser1
            expectedErrorRc = controllerError.delete.currentUserHasNotPriorityToDeleteUser.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminUser1Sess,data: data,expectedErrorRc: expectedErrorRc,app: adminApp})
        });
/*        it('3.2 admin user1 has no priority try delete root user not allow', async function() {
            // let adminRooIdCryptedByAdminUser2=await commonAPI.cryptObjectId_async({objectId:adminRootId,sess:adminUser2Sess})
            data.values[e_part.RECORD_ID]=adminRootIdCryptedByAdminUser1
            expectedErrorRc = controllerError.delete.currentUserHasNotPriorityToDeleteUser.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminUser1Sess,data: data,expectedErrorRc: expectedErrorRc,app: adminApp})

        });*/
        it('3.3 admin user2 has priority try delete root user not allow', async function() {
            // let adminRooIdCryptedByAdminUser2=await commonAPI.cryptObjectId_async({objectId:adminRootId,sess:adminUser2Sess})
            data.values={}
            data.values[e_part.RECORD_ID]=adminRootIdCryptedByAdminUser2
            expectedErrorRc = controllerError.delete.cantDeleteRootUserByAPI.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminUser2Sess,data: data,expectedErrorRc: expectedErrorRc,app: adminApp})
        });

    })
})










