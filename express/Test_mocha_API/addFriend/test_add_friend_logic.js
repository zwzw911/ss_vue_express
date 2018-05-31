/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/*const controllerError=require('../../server/controller/add_friend/add_friend_setting/add_friend_controllerError').controllerError
let  baseUrl="/add_friend/",finalUrl,url

const ap=require('awesomeprint')

const request=require('supertest')
const app=require('../../app')
const adminApp=require('../../../express_admin/app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
//for fkValue check
const e_chineseFieldName=require('../../server/constant/genEnum/inputRule_field_chineseName').ChineseName

const iniSettingObject=require(`../../server/constant/genEnum/initSettingObject`).iniSettingObject

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
const e_addFriendStatus=server_common_file_require.mongoEnum.AddFriendStatus.DB
const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB

const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const helperError=server_common_file_require.helperError.helper
// const common_operation_model=server_common_file_require.common_operation_model

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const misc_helper=server_common_file_require.misc_helper


let globalConfiguration=server_common_file_require.globalConfiguration


let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let userData,tmpResult,copyNormalRecord
let adminRootSess,adminRootId,data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc

let normalRecord={
    [e_field.ADD_FRIEND.ORIGINATOR]:undefined,
    [e_field.ADD_FRIEND.RECEIVER]:undefined,
    [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.ACCEPT
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined, //普通用户无需操作此字段
}*/
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


const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart

const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const compound_unique_field_config=server_common_file_require.compound_unique_field_config.compound_unique_field_config
/******************    数据库函数  **************/

/****************  公共函数 ********************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")


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
const resourceCheck=server_common_file_require.helperError.resourceCheck
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
    user3IdCryptedByAdminRoot,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId
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

    describe('create prepare', async function() {
        before('user1 add user3, and user3 accept', async function(){
            let data={values:{}}
            data.values={[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:user3IdCryptedByUser1}}
            await add_friend_API.createAddFriend_returnRecord_async({data:data,sess:user1Sess,app:app})
            recordId1=await db_operation_helper.getAddFriendRequest_async({originatorId:user1Id,receiverId:user3Id})
            // ap.inf('recordId1')
            recordId1=await commonAPI.cryptObjectId_async({objectId:recordId1,sess:user3Sess})
            data.values={[e_part.RECORD_ID]:recordId1}
            // ap.inf('data',data)
            await add_friend_API.acceptAddFriend_returnRecord_async({data:data,sess:user3Sess,app:app})
            console.log(`==============================================================`)
            console.log(`=================    before create done      ====================`)
            console.log(`==============================================================`)
        })
        it('1.1 create:userType check, admin not allow for create', async function() {
            normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3IdCryptedByAdminRoot
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            // let sess=await userAPI.getFirstSession({app})
            data.values={[e_part.SINGLE_FIELD]:normalRecord}

            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        /* it('Group My Friend reach max', async function() {
             data.values={}
             normalRecord={}
             normalRecord[e_field.ADD_FRIEND.RECEIVER]=user2Id
             data.values[e_part.RECORD_INFO]=normalRecord
             data.values[e_part.METHOD]=e_method.CREATE
             globalConfiguration.userGroupFriend.max.maxUserPerDefaultGroup=0
             expectedErrorRc=controllerError.defaultGroupNumberExceed.rc
             await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
         });*/

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
    })


    it('user1 add user2 already, user 2 accept, then user1 add again', async function() {
        userData={
            [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.ACCEPT
        }
        await API_helper.updateAddFriend_returnRecord_async({userData:userData,recordId:recordId1,sess:user2Sess,app:app})

        data.values={}
        normalRecord={}
        normalRecord[e_field.ADD_FRIEND.RECEIVER]=user2Id
        // copyNormalRecord[e_field.ADD_FRIEND.]
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        expectedErrorRc=controllerError.receiverAlreadyBeFriend('user1').rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });
    it('user1 add user2 already, user 2 reject, then user1 add again', async function() {
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.add_friend,id:recordId1,updateFieldsValue:{[e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.UNTREATED}})
        userData={
            [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.REJECT
        }
        await API_helper.updateAddFriend_returnRecord_async({userData:userData,recordId:recordId1,sess:user2Sess,app:app})

        data.values={}
        normalRecord={}
        normalRecord[e_field.ADD_FRIEND.RECEIVER]=user2Id
        // copyNormalRecord[e_field.ADD_FRIEND.]
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        expectedErrorRc=0
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });


    /*              update                      */
    it('userType check, admin not allow for update', async function() {
        data.values={}
        normalRecord={}
        normalRecord[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.REJECT
        // copyNormalRecord[e_field.ADD_FRIEND.]
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId1
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });
    it('user3 try to update record that user1 add user2', async function() {
        data.values={}
        normalRecord={}
        normalRecord[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.REJECT
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId1
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.notReceiverCantUpdate.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });
    it('user3 try to update record that user1 add user3, and user3 already reject/accept', async function() {
        userData={
            [e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.REJECT
        }
        await API_helper.updateAddFriend_returnRecord_async({userData:userData,recordId:recordId2,sess:user3Sess,app:app})

        data.values={}
        normalRecord={}
        normalRecord[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.REJECT
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId2
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.notReceiverCantUpdate.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });
    it('user3 try to update record that user2 add user3 with not allow field', async function() {
        data.values={}
        normalRecord={}
        // normalRecord[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.REJECT
        normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId3
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=validateError.validateValue.fieldValueShouldNotExistSinceNoRelateApplyRange({fieldName:'receiver',applyRange:e_applyRange.UPDATE_SCALAR}).rc
        await misc_helper.sendDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.ADD_FRIEND.RECEIVER,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });
    it('user3 try to update record that user2 add user3 miss mandatory field', async function() {
        data.values={}
        normalRecord={}
        // normalRecord[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.REJECT
        normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId3
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=browserInputRule.add_friend.status.require.error.rc
        await misc_helper.sendDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.ADD_FRIEND.STATUS,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });
    /*//browser字段太少，无法测试
    it('user3 try to update record that user2 add user3 without necessary field', async function() {
        data.values={}
        // normalRecord[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.REJECT
        // normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3Id
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_ID]=recordId3
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.mandatoryFieldNotExist.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });*/
    /*//无法测试，因为如果输入为UNTREATED，那么会被认为没有改变的数据而直接返回rc:0
    it('user3 try to update record that user2 add user3 with invalid status', async function() {
        data.values={}
        normalRecord[e_field.ADD_FRIEND.STATUS]=4
        // normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId3
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.statusValueInvalid.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });*/

    it('user3  update record that user2 add user3 success', async function() {
        data.values={}
        normalRecord={}
        normalRecord[e_field.ADD_FRIEND.STATUS]=e_addFriendStatus.ACCEPT
        // normalRecord[e_field.ADD_FRIEND.RECEIVER]=user3Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId3
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=0
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})



    });
})

