/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/add_friend/add_friend_setting/add_friend_controllerError').controllerError

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
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB

const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart

const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const compound_unique_field_config=server_common_file_require.compound_unique_field_config.compound_unique_field_config
/******************    数据库函数  **************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
/****************  公共函数 ********************/
const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const add_friend_API=server_common_file_require.add_friend_API

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const generateTestData=server_common_file_require.generateTestData

const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt




/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck
const resourceCheckError=server_common_file_require.helperError.resourceCheck
// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy



// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
/****************  变量 ********************/
let baseUrl="/add_friend/",finalUrl,url

//管理员登录信息
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
//用户登录信息
// let user1Sess,user2Sess,user3Sess,adminRootSess
let userData,tmpResult,copyNormalRecord
let data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc


let unExistObjectIdCryptedByUser1

let recordId //当有update/delete的时候，需要真实的recordid，来pass recordId的最后一个case（正确通过）
let normalRecord={
    // [e_field.ADD_FRIEND.ORIGINATOR]:undefined,
    [e_field.ADD_FRIEND.RECEIVER]:undefined,
}

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId

let recordId2CryptedByAdminRoot,recordId1CryptedByUser2,recordId1CryptedByUser3,recordId2CryptedByUser2
/*                             */
describe('add friend logic', async function() {

    before('user1/2/3  login and create article and impeach', async function(){
        url = ''
        // parameter[`APIUrl`]=finalUrl
        finalUrl = baseUrl + url

        let tmpResult=await generateTestData.getUserCryotedUserId_async({app:app,adminApp:adminApp})

        user1IdCryptedByUser1=tmpResult['user1IdCryptedByUser1']
        user1IdCryptedByUser2=tmpResult['user1IdCryptedByUser2']
        user1IdCryptedByUser3=tmpResult['user1IdCryptedByUser3']
        user2IdCryptedByUser1=tmpResult['user2IdCryptedByUser1']
        user2IdCryptedByUser2=tmpResult['user2IdCryptedByUser2']
        user2IdCryptedByUser3=tmpResult['user2IdCryptedByUser3']
        user3IdCryptedByUser1=tmpResult['user3IdCryptedByUser1']
        user3IdCryptedByUser2=tmpResult['user3IdCryptedByUser2']
        user3IdCryptedByUser3=tmpResult['user3IdCryptedByUser3']
        user3IdCryptedByAdminRoot=tmpResult['user3IdCryptedByAdminRoot']
        adminRootIdCryptedByUser1=tmpResult['adminRootIdCryptedByUser1']
        user1Sess=tmpResult['user1Sess']
        user2Sess=tmpResult['user2Sess']
        user3Sess=tmpResult['user3Sess']
        adminRootSess=tmpResult['adminRootSess']
        user1Id=tmpResult['user1Id']
        user2Id=tmpResult['user2Id']
        user3Id=tmpResult['user3Id']
        adminRootId=tmpResult['adminRootId']

        let penalizeInfoForUser3 = {
            penalizeType: e_penalizeType.NO_ADD_FRIEND,
            penalizeSubType: e_penalizeSubType.ALL,
            // penalizedError:undefined, //错误根据具体method定义
            [e_field.ADMIN_PENALIZE.DURATION]: 0,
            [e_field.ADMIN_PENALIZE.REASON]: 'test reason, no indication',
        }
        // ap.inf('test')
        // parameter[`APIUrl`]=finalUrl


        /**     admin create penalize for user3     **/
        await penalizeAPI.createPenalize_returnPenalizeId_async({
            adminUserSess: adminRootSess,
            penalizeInfo: penalizeInfoForUser3,
            penalizedUserId: user3IdCryptedByAdminRoot,
            adminApp: adminApp
        })
        
        unExistObjectIdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})
        // user3IdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:user3Id,sess:user1Sess})
        /*                  user1 add user3 as friend, and user3 accept             */
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    describe('prepare', async function() {
        before('user1 add user3, and user3 accept; user1 add user2, user2 not response yet', async function(){
            let data={values:{}}
            data.values={[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:user3IdCryptedByUser1}}
            await add_friend_API.createAddFriend_returnRecord_async({data:data,sess:user1Sess,app:app})
            recordId1=await db_operation_helper.getAddFriendRequest_async({originatorId:user1Id,receiverId:user3Id})
            recordId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:recordId1,sess:user2Sess})
            recordId1CryptedByUser3=await commonAPI.cryptObjectId_async({objectId:recordId1,sess:user3Sess})
            recordId1=await commonAPI.cryptObjectId_async({objectId:recordId1,sess:user3Sess})
            data.values={[e_part.RECORD_ID]:recordId1}
            // ap.inf('data',data)
            await add_friend_API.acceptAddFriend_returnRecord_async({data:data,sess:user3Sess,app:app})

            /***    user1 add user2, user2 not response yet ***/
            data.values={[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:user2IdCryptedByUser1}}
            await add_friend_API.createAddFriend_returnRecord_async({data:data,sess:user1Sess,app:app})
            recordId2=await db_operation_helper.getAddFriendRequest_async({originatorId:user1Id,receiverId:user2Id})

            recordId2CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:recordId2,sess:adminRootSess})
            recordId2CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:recordId2,sess:user2Sess})
            recordId2=await commonAPI.cryptObjectId_async({objectId:recordId2,sess:user2Sess})
            // data.values={[e_part.RECORD_ID]:recordId1}
            console.log(`==============================================================`)
            console.log(`=================      create done        ====================`)
            console.log(`==============================================================`)
        })
        it('1.1 create:userType check, admin not allow for create', async function() {
            normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3IdCryptedByAdminRoot
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            // let sess=await userAPI.getFirstSession({app})
            data.values={[e_part.SINGLE_FIELD]:normalRecord}

            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.1 create:fk check,receiver not exist', async function() {
            data.values={[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:unExistObjectIdCryptedByUser1}}
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist().rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('3.1 create:user1 cant add user3 multiple times', async function() {
            data.values={}
            normalRecord={}
            normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3IdCryptedByUser1
            // copyNormalRecord[e_field.ADD_FRIEND.]
            data.values[e_part.SINGLE_FIELD]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            expectedErrorRc=controllerCheckerError.compoundFieldHasMultipleDuplicateRecord({arr_compoundField:compound_unique_field_config[e_coll.ADD_FRIEND]['unique_group_name_for_user']}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
        });
        it('4.1 create:user1 cant add self as friend', async function() {
            data.values={}
            normalRecord={}
            normalRecord[e_field.ADD_FRIEND.RECEIVER]=user1IdCryptedByUser1
            // copyNormalRecord[e_field.ADD_FRIEND.]
            data.values[e_part.SINGLE_FIELD]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            expectedErrorRc=controllerError.create.cantAddSelfAsFriend.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
        });
        //adminRootId cant be found in user collection
        it('4.2 create:user1 cant add admin as friend', async function() {
            data.values={}
            normalRecord={}
            normalRecord[e_field.ADD_FRIEND.RECEIVER]=adminRootIdCryptedByUser1
            // copyNormalRecord[e_field.ADD_FRIEND.]
            data.values[e_part.SINGLE_FIELD]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist().rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
        });
        it('5.1 create:user1 try to add friend user2 , exceed profile defined', async function() {
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_UNTREATED_ADD_FRIEND_REQUEST,resourceType:e_resourceType.BASIC})
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_UNTREATED_ADD_FRIEND_REQUEST,resourceType:e_resourceType.BASIC,num:0})
            data.values={}
            normalRecord={}
            normalRecord[e_field.ADD_FRIEND.RECEIVER]=user2IdCryptedByUser1
            // copyNormalRecord[e_field.ADD_FRIEND.]
            data.values[e_part.SINGLE_FIELD]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalFolderNumExceed({}).rc
            ap.inf('expectedErrorRc',expectedErrorRc)
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_UNTREATED_ADD_FRIEND_REQUEST,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        });
        /***            update      ****/
        it('10.1 update:userType check, admin not allow for create', async function() {
            url='accept'
            finalUrl=baseUrl+url

            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            // let sess=await userAPI.getFirstSession({app})
            data.values={[e_part.RECORD_ID]:recordId2CryptedByAdminRoot}

            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('10.2 update:recordId not exist', async function() {
            url='accept'
            finalUrl=baseUrl+url
            let unexistIdCryptedByUser2=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user2Sess})
            data.values={[e_part.RECORD_ID]:unexistIdCryptedByUser2}
            expectedErrorRc=controllerError.update.notReceiverCantUpdate.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('10.2.2 update:user2 try to update record while receiver not self', async function() {
            url='accept'
            finalUrl=baseUrl+url

            data.values={[e_part.RECORD_ID]:recordId1CryptedByUser2}
            expectedErrorRc=controllerError.update.notReceiverCantUpdate.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('11.1 update:user3 accept before, and try to decline which not allow in addFriend', async function() {
            url='decline'
            finalUrl=baseUrl+url

            data.values={[e_part.RECORD_ID]:recordId1CryptedByUser3}
            expectedErrorRc=controllerError.update.requestAlreadyBeTreatedCantDeclineAgain.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('11.2 update:user3 accept before, and try to accept again which not allow ', async function() {
            url='accept'
            finalUrl=baseUrl+url

            data.values={[e_part.RECORD_ID]:recordId1CryptedByUser3}
            expectedErrorRc=controllerError.update.requestAlreadyBeAcceptCantAcceptAgain.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('12.1 update:user2 decline request ', async function() {
            url='decline'
            finalUrl=baseUrl+url

            data.values={[e_part.RECORD_ID]:recordId2CryptedByUser2}
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })






})

