/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/folder/folder_setting/folder_controllerError').controllerError


/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const request=require('supertest')
const assert=require('assert')

/******************    待测函数  **************/
const app=require('../../app')
const adminApp=require('../../../express_admin/app')


const server_common_file_require=require('../../server_common_file_require')
/******************    数据库函数  **************/
const common_operation_model=server_common_file_require.common_operation_model

/****************  公共常量 ********************/
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

const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_impeachAdminAction=mongoEnum.ImpeachAdminAction.DB


const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule
/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const helperError=server_common_file_require.helperError.helper
// const common_operation_model=server_common_file_require.common_operation_model
/****************  公共函数 ********************/
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const misc_helper=server_common_file_require.misc_helper

/****************  全局设置 ********************/
let globalConfiguration=server_common_file_require.globalConfiguration


/****************  变量 ********************/
let  baseUrl="/folder/",finalUrl,url
//管理员登录信息
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
//用户登录信息
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let userData,tmpResult,copyNormalRecord
let adminRootSess,adminRootId,data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc

let normalRecord={
    [e_field.FOLDER.AUTHOR_ID]:undefined,
    [e_field.FOLDER.LEVEL]:undefined,
    [e_field.FOLDER.NAME]:undefined,
    [e_field.FOLDER.PARENT_FOLDER_ID]:undefined,
}





/*              create_folder               */
describe('create folder:', async function() {
    data={values:{method:e_method.CREATE}}
    let impeachId,impeachId2
    before('user1/2/3  login and create article and impeach', async function(){
        url=''
        // parameter[`APIUrl`]=finalUrl
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        user3Id=user3Info[`userId`]
        user3Sess=user3Info[`sess`]

        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})

        //create penalize for user3
        await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:adminRootSess,penalizeInfo,penalizedUserData:user3Data,adminApp:adminApp})
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /*              create                      */
    it('1. not login cant create', async function() {
        expectedErrorRc=controllerError.dispatch.post.notLoginCantCreateFolder.rc
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
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

    it('fk:receiver not exist', async function() {
        data.values={}
        copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.ADD_FRIEND.RECEIVER]=testData.unExistObjectId
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=controllerHelperError.fkValueNotExist(e_chineseFieldName.impeach_action.impeachId,normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]).rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('user1 add user2 already, user 2 not handle, then user1 add again', async function() {
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

