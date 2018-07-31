/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
/**************  特定相关常量  ****************/
const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_action_controllerError').controllerError
let baseUrl="/impeach_action/",finalUrl,url


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
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachAdminAction=mongoEnum.ImpeachAdminAction.DB
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
const impeachActionAPI=server_common_file_require.impeachAction_API

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
const systemError=server_common_file_require.systemError
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck

let expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId
let adminUser1IdCryptedByAdminUser1,adminUser1IdCryptedByAdminUser2,adminUser1IdCryptedByAdminUser3,adminUser1IdCryptedByUser1,//adminUser1IdCryptedByUser1,adminUser1IdCryptedByUser2,
    adminUser2IdCryptedByAdminUser1,adminUser2IdCryptedByAdminUser2,adminUser2IdCryptedByAdminUser3,
    adminUser3IdCryptedByAdminUser1,adminUser3IdCryptedByAdminUser2,adminUser3IdCryptedByAdminUser3,
    adminRootIdCryptedByAdminUser1,adminRootIdCryptedByAdminUser2,
    adminUser1Sess,adminUser2Sess,adminUser3Sess,
    adminUser1Id,adminUser2Id,adminUser3Id
let unExistObjectCryptedByUser1,unExistObjectCryptedByAdminUser2
let friendGroupId1,friendGroupId1CryptedByUser1
let articleId1CryptedByUser1
let articleId2CryptedByUser2
let articleId3CryptedByUser3
let impeachId1,impeachId1CryptedByUser1,impeachId1CryptedByAdminUser1,impeachId1CryptedByAdminUser2
let impeachId2CryptedByUser1,impeachId2CryptedByUser2,impeachId2CryptedByAdminUser1,impeachId2CryptedByAdminUser2
let impeachId3CryptedByUser3

let impeachActionInfo
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

        tmpResult = await generateTestData.getAdminUserCryptedUserId_async({
            app: app,
            adminRootSess: adminRootSess,
            adminApp: adminApp
        })
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
        adminRootIdCryptedByAdminUser1 = await commonAPI.cryptObjectId_async({
            objectId: adminRootId,
            sess: adminUser1Sess
        })
        adminRootIdCryptedByAdminUser2 = await commonAPI.cryptObjectId_async({
            objectId: adminRootId,
            sess: adminUser2Sess
        })


        adminUser1IdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:adminUser1Id,sess:user1Sess})
        ap.inf('****************************************************************************')
        ap.inf('**********************       admin user done  ******************************')
        ap.inf('****************************************************************************')


        /**     user1 create article and create impeach and submit it   **/
        articleId1CryptedByUser1=await articleComponentFunction.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        let impeach1Data={values:{
            [e_part.RECORD_INFO]:{
                [e_field.IMPEACH.TITLE]:'impeach',
                [e_field.IMPEACH.CONTENT]:'impeach article',
                [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId1CryptedByUser1,
            }
            }}
        impeachId1CryptedByUser1=await impeachAPI.createImpeachForArticle_returnImpeachId_async({data:impeach1Data,userSess:user1Sess,app:app})

        //submit impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId1CryptedByUser1,
        }
        await impeachActionAPI.createImpeachAction_async({sess:user1Sess,impeachActionInfo:impeachActionInfo,app:app})
        impeachId1=await commonAPI.decryptObjectId_async({objectId:impeachId1CryptedByUser1,sess:user1Sess})
        impeachId1CryptedByAdminUser1=await commonAPI.cryptObjectId_async({objectId:impeachId1,sess:adminUser1Sess})
        impeachId1CryptedByAdminUser2=await commonAPI.cryptObjectId_async({objectId:impeachId1,sess:adminUser2Sess})

        /**     user2  create impeach and finish it   **/

        articleId2CryptedByUser2=await articleComponentFunction.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        let impeach2Data={values:{
                [e_part.RECORD_INFO]:{
                    [e_field.IMPEACH.TITLE]:'impeach2',
                    [e_field.IMPEACH.CONTENT]:'impeach2 article',
                    [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId2CryptedByUser2,
                }
            }}
        impeachId2CryptedByUser2=await impeachAPI.createImpeachForArticle_returnImpeachId_async({data:impeach2Data,userSess:user2Sess,app:app})
        //submit impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId2CryptedByUser2,
        }
        await impeachActionAPI.createImpeachAction_async({sess:user2Sess,impeachActionInfo:impeachActionInfo,app:app})
        //assign impeach to admin user 1
        let impeachId2=await commonAPI.decryptObjectId_async({objectId:impeachId2CryptedByUser2,sess:user2Sess})
        // ap.wrn('impeachId2',impeachId2)
        impeachId2CryptedByAdminUser2=await commonAPI.cryptObjectId_async({objectId:impeachId2,sess:adminUser2Sess})
        // ap.wrn('impeachId2',impeachId2)
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId2CryptedByAdminUser2,
            // [e_field.IMPEACH_ACTION.]:adminUser2Id,
            [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1IdCryptedByAdminUser2,
        }
        // ap.wrn('ASSIGN')
        await impeachActionAPI.createImpeachAction_async({sess:adminUser2Sess,impeachActionInfo:impeachActionInfo,app:adminApp})
        //accept impeach
        impeachId2CryptedByAdminUser1=await commonAPI.cryptObjectId_async({objectId:impeachId2,sess:adminUser1Sess})
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ACCEPT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId2CryptedByAdminUser1,
            [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1IdCryptedByAdminUser1,
        }
        // ap.wrn('adminUser1IdCryptedByAdminUser1',adminUser1IdCryptedByAdminUser1)
        // ap.wrn('ACCEPT')
        // ap.wrn('adminUser1IdCryptedByAdminUser1',adminUser1IdCryptedByAdminUser1)
        await impeachActionAPI.createImpeachAction_async({sess:adminUser1Sess,impeachActionInfo:impeachActionInfo,app:adminApp})
        //finish impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.FINISH,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId2CryptedByAdminUser1,
            [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1IdCryptedByAdminUser1,
        }
        await impeachActionAPI.createImpeachAction_async({sess:adminUser1Sess,impeachActionInfo:impeachActionInfo,app:adminApp})

        /**     user3  create impeach and delete it   **/
        articleId3CryptedByUser3=await articleComponentFunction.createArticle_setToFinish_returnArticleId_async({userSess:user3Sess,app:app})
        let impeach3Data={values:{
                [e_part.RECORD_INFO]:{
                    [e_field.IMPEACH.TITLE]:'impeach3',
                    [e_field.IMPEACH.CONTENT]:'impeach3 article',
                    [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId3CryptedByUser3,
                }
            }}
        impeachId3CryptedByUser3=await impeachAPI.createImpeachForArticle_returnImpeachId_async({data:impeach3Data,userSess:user3Sess,app:app})
        // console.log(`impeach3Id===============>${impeach3Id}`)
        await impeachAPI.delete_impeach_async({impeachId:impeachId3CryptedByUser3,userSess:user3Sess,app:app})

        /**     unknown id      **/
        unExistObjectCryptedByAdminUser2=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:adminUser2Sess})
        ap.inf('****************************************************************************')
        ap.inf('**********************       prepare    done  ******************************')
        ap.inf('****************************************************************************')
    })

    /*              create_impeach_state中的错误               */
    describe('impeach action', async function() {




        describe('create impeach action', async function() {
            let sess
            before('create article and impeach', async function(){
                url=''
                finalUrl=baseUrl+url
                // normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
                // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
            });
            /*              userType wrong             */
            it(`1.1 userType check`, async function(){
                data.values={}

                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
                    [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId1CryptedByUser1,
                    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1IdCryptedByUser1,
                }
                expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
                // console.log(`user1Sess============>${JSON.stringify(user1Sess)}`)
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
            })
            /*              action not allow for adminUser            */
            it(`1.2 action create not allow for admin`, async function(){
                data.values={}
                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.CREATE,
                    [e_field.IMPEACH_ACTION.IMPEACH_ID]:adminUser1IdCryptedByAdminUser2,
                    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1IdCryptedByAdminUser2,
                }
                expectedErrorRc=controllerError.create.invalidActionForAdminUser.rc
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
            })
            /*            priority check             */
            it(`1.3 adminUser1 has no priority to assign impeachId1 to adminUser2`, async function(){
                data.values={}
                // data.values[e_part.METHOD]=e_method.CREATE
/*                let copy=objectDeepCopy(normalRecord)
                copy[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByAdminUser1
                copy[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
                copy[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser2Id
                data.values[e_part.RECORD_INFO]=copy*/

                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
                    [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId1CryptedByAdminUser1,
                    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser2IdCryptedByAdminUser1,
                }
                expectedErrorRc=controllerError.create.userHasNoPriorityToThisOption.rc
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
            })
            /*            admin owner id must be set for every admin action            */
            it(`1.4 miss admin owner id`, async function(){
                data.values={}
                // data.values[e_part.METHOD]=e_method.CREATE
/*                let copy=objectDeepCopy(normalRecord)
                copy[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByAdminUser2
                copy[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
                // copy[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser2Id
                data.values[e_part.RECORD_INFO]=copy*/

                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
                    [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId1CryptedByAdminUser2,
                    // [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser2IdCryptedByAdminUser1,
                }

                expectedErrorRc=controllerError.create.ownerIdMustExists.rc
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
            })


            /*              fk exists check            */
            it('1.5 fk:IMPEACH_ID not exists', async function() {
                data.values={}
/*                let copyNormalRecord=objectDeepCopy(normalRecord)
                copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=unExistObjectCryptedByAdminUser2
                copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1IdCryptedByAdminUser2
                copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN

                data.values[e_part.RECORD_INFO]=copyNormalRecord*/

                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
                    [e_field.IMPEACH_ACTION.IMPEACH_ID]:unExistObjectCryptedByAdminUser2,
                    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1IdCryptedByAdminUser2,
                }

                //因为不使用fkChekc，所以错误被controllerError拦截了
                // expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist({}).rc
                expectedErrorRc=controllerError.create.noPreviousActionRecords.rc
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
            });
            it('1.6 adminUser1 try to create action while current owner is adminUser2', async function() {
                data.values={}
/*                let copyNormalRecord=objectDeepCopy(normalRecord)
                copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.FINISH
                copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId1CryptedByAdminUser1
                copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

                data.values[e_part.RECORD_INFO]=copyNormalRecord*/
                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.FINISH,
                    [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId1CryptedByAdminUser1,
                    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1IdCryptedByAdminUser1,
                }
                expectedErrorRc=controllerError.create.forbidToTakeActionForCurrentImpeach.rc
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})

            });
            it('1.7 adminUser1 try to finish impeachId2 again', async function() {
                data.values={}
/*                let copyNormalRecord=objectDeepCopy(normalRecord)
                copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.FINISH
                copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId2CryptedByUser1
                copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

                data.values[e_part.RECORD_INFO]=copyNormalRecord*/

                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.FINISH,
                    [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId2CryptedByAdminUser1,
                    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser2IdCryptedByAdminUser1,
                }

                expectedErrorRc=controllerError.create.invalidActionBaseOnCurrentAction.rc
                await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:expectedErrorRc,app:adminApp})
            });
        })


        /*
        /!*无法测试，被fkValueCheck截胡了*!/
        it('adminUser1 try to finish deleted impeachId3', async function() {
            data.values={}
            let copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.FINISH
            copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach3Id
            copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

            data.values[e_part.RECORD_INFO]=copyNormalRecord
            data.values[e_part.METHOD]=e_method.CREATE
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.relatedImpeachAlreadyDeleted.rc,app:adminApp})
        });
        /!*无法测试，被actionBasePrevious截胡了*!/
        it('adminUser1 try to accept  deleted impeachId2', async function() {
            data.values={}
            let copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ACCEPT
            copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach2Id
            copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

            data.values[e_part.RECORD_INFO]=copyNormalRecord
            data.values[e_part.METHOD]=e_method.CREATE
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.impeachAlreadyDone.rc,app:adminApp})
        });*/


        // after(`rollback adminRoot priority configure`, async function(){
        //     /*              reCreate root user without all priority                 */
        //     let adminUser=Object.assign({},testData.admin_user.adminRoot,{[e_field.ADMIN_USER.USER_PRIORITY]:enumValue.AdminPriorityType})
        //     await component_function.reCreateAdminRoot_async({adminRootData:adminUser})
        // })
    })
})

