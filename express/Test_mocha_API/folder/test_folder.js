/**
 * Created by Ada on 2019/5/11.
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
/****************  class ********************/
const class_user=server_common_file_require.class_user
/******************    数据库函数  **************/
const common_operation_model=server_common_file_require.common_operation_model

/****************  公共常量 ********************/
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const e_part=nodeEnum.ValidatePart

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
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB

const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule
/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck
const resourceCheckError=server_common_file_require.helperError.resourceCheck
// const common_operation_model=server_common_file_require.common_operation_model
/****************  公共函数 ********************/
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const commonAPI=server_common_file_require.common_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const userAPI=server_common_file_require.user_API
const folderAPI=server_common_file_require.folder_API
const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt
/****************  全局设置 ********************/
let globalConfiguration=server_common_file_require.globalConfiguration


/****************  变量 ********************/
let  baseUrl="/folder/",finalUrl,url
//管理员登录信息

let userData,tmpResult,copyNormalRecord
let adminRootSess,adminRootId,data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc



let user1=new class_user.c_user({userData:testData.user.user1})
let user2=new class_user.c_user({userData:testData.user.user2})
let user3=new class_user.c_user({userData:testData.user.user3})
let user4=new class_user.c_user({userData:testData.user.user4})

let adminRoot=new class_user.c_adminUser({adminUserData:testData.admin_user.adminRoot})

let normalRecord={
    // [e_field.FOLDER.AUTHOR_ID]:undefined,
    // [e_field.FOLDER.LEVEL]:undefined,
    [e_field.FOLDER.NAME]:'test',
    [e_field.FOLDER.PARENT_FOLDER_ID]:null,
}


describe('dispatch', function() {

    before('user1/2/3  login and create article and impeach', async function(){
        url=''
        // parameter[`APIUrl`]=finalUrl
        finalUrl=baseUrl+url

        let penalizeInfoForUser3={
            penalizeType:e_penalizeType.NO_FOLDER,
            penalizeSubType:e_penalizeSubType.ALL,
            // penalizedError:undefined, //错误根据具体method定义
            [e_field.ADMIN_PENALIZE.DURATION]:0,
            [e_field.ADMIN_PENALIZE.REASON]:'test reason, no indication',
        }
        // ap.inf('test')
        // parameter[`APIUrl`]=finalUrl
        await user1.reCreateUserGetSessUserIdSalt_async()
        await user2.reCreateUserGetSessUserIdSalt_async()
        await user3.reCreateUserGetSessUserIdSalt_async()
        await user4.reCreateUserGetSessUserIdSalt_async()
        await adminRoot.adminLoginGetSessUserIdSalt_async()

        /*** create penalize for user3 ***/
        await adminRoot.createPenalize_async({penalizeInfo:penalizeInfoForUser3,decryptedUserId:user3.userId})



        /***    user1 create child folder in root folder    ***/
        recordId1=await user1.createFolderReturnId_async({folderName:'user1_new_folder',parentEncryptedFolderId:user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})})

        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /**              create                      **/

    it('1.1 create:unexpected user type', async function() {
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=adminRoot.encryptedObjectId({decryptedObjectId:user1.userId})
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('1.2 create:success', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})
        expectedErrorRc=0
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    //创建 不允许字段为null（类型不正确，而 update是允许的）
    it('1.3 create:parentId cant be null', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=null
        expectedErrorRc=validateError.validateValue.CUDTypeWrong.rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.FOLDER.PARENT_FOLDER_ID],app:app})
    });
    /*** 无法测试，因为parentFolderId会预先进行objectId的检测  ***/
/*    it('1.4 create:parentId cant be null', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=''
        expectedErrorRc=validateError.validateValue.CUDTypeWrong.rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.FOLDER.PARENT_FOLDER_ID],app:app})
    });*/
    it('1.5 create:unExist parentId', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:testData.unExistObjectId})
        expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist().rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('1.6 create: user1 try to user user2 folderId as parentId', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user2.userId})
        expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /*** 无法测试，rule阻止输入符号  ***/
/*    it('1.7 create: name XSS', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.NAME]='_1'
        delete normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]//user2ParentFolderIdGetByUser1Crypted
        expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });*/

    it('1.8 create: user1 created sub folder successfully', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})
        expectedErrorRc=0
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /**              get                      **/
    it('2.1 get root folder', async function() {
        expectedErrorRc=0
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.2 get child folder: crypted folder id format invalid', async function() {
        url='12345243535636576785'
        finalUrl=baseUrl+url
        expectedErrorRc=controllerError.dispatch.get.cryptedFolderIdFormatInvalid.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.3 get child folder: decrypted folder id format valid', async function() {
        // url=testData.encryptedObjectId //16c8277c10df1212212acd05acd64f7b8acb644469a8a008c23c7dd76da06863
        url='3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22'
        finalUrl=baseUrl+url
        expectedErrorRc=controllerError.dispatch.get.decryptedFolderIdFormatInvalid.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.4 get: user type incorrect', async function() {
        // url=testData.encryptedObjectId //16c8277c10df1212212acd05acd64f7b8acb644469a8a008c23c7dd76da06863
        url=adminRoot.encryptedObjectId({decryptedObjectId:user1.topFolderId})//user1ParentFolderIdGetByAdminRoot
        finalUrl=baseUrl+url
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.5 get: user2 try to get user1 folder', async function() {
        // url=testData.encryptedObjectId //16c8277c10df1212212acd05acd64f7b8acb644469a8a008c23c7dd76da06863
        url=user2.encryptedObjectId({decryptedObjectId:user1.topFolderId})//user1ParentFolderIdGetByUser2Crypted
        finalUrl=baseUrl+url
        expectedErrorRc=controllerError.get.notAuthorCantGetFolder.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /********** update   ***********/
    it('3.1 update: user type incorrect ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        data={values:{[e_part.RECORD_ID]:adminRoot.encryptedObjectId({decryptedObjectId:user1.topFolderId}),[e_part.RECORD_INFO]:{[e_field.FOLDER.NAME]:'test'}}}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('3.2 update: priority check, user not the owner of folderId ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.update.notAuthorCantUpdateFolder.rc
        data={values:{[e_part.RECORD_ID]:user2.encryptedObjectId({decryptedObjectId:user1.topFolderId}),[e_part.RECORD_INFO]:{[e_field.FOLDER.NAME]:'test'}}}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.2.2 update: recordId not exist ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.update.notAuthorCantUpdateFolder.rc
        // let unExistRecordId=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user2.sess})
        data={values:{[e_part.RECORD_ID]:user2.encryptedObjectId({decryptedObjectId:testData.unExistObjectId}),[e_part.RECORD_INFO]:{[e_field.FOLDER.NAME]:'test'}}}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.3 update:parentId cant be self', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.update.parentFolderIdCantBeSelf.rc
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topFolderId}) //user1ParentFolderIdCrypted
        data.values={[e_part.RECORD_INFO]:normalRecord,[e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.3.1 update:parentId not current users', async function() {
        finalUrl=baseUrl
        expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user2.topFolderId}) //user1ParentFolderIdCrypted
        data.values={
            [e_part.RECORD_INFO]:normalRecord,
            [e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.4 update: empty data', async function() {
        finalUrl=baseUrl
        expectedErrorRc=validateError.validateFormat.recordInfoCantEmpty.rc
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})
        data.values={[e_part.RECORD_INFO]:{},[e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.5 update: no data change', async function() {
        finalUrl=baseUrl
        expectedErrorRc=0
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})
        data.values={[e_part.RECORD_INFO]:{[e_field.FOLDER.NAME]:'我的文档'},[e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /********** delete   ***********/
    it('4.1 delete: user type incorrect ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        data={values:{[e_part.RECORD_ID]:adminRoot.encryptedObjectId({decryptedObjectId:user1.topFolderId})}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('4.2 delete: priority check, user not the owner of folderId ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.delete.notAuthorCantDeleteFolder.rc
        data={values:{[e_part.RECORD_ID]:user2.encryptedObjectId({decryptedObjectId:user1.topFolderId})}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('4.3 delete: has child folder cant be delete ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.delete.childFolderInFolderCanDelete.rc
        data={values:{[e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('4.4 delete: successful ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=0
        data={values:{[e_part.RECORD_ID]:recordId1}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /****** manual test   *******/
    /** 需要手工在db中改门限值 ***/
    it('5.1 create: resource check', async function() {
        let resourceRange=e_resourceRange.MAX_FOLDER_NUM_PER_USER
        let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC})
        // ap.wrn('originalSetting',originalSetting)
        await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:0})

        finalUrl=baseUrl
        // normalRecord[e_field.FOLDER.NAME]='test'
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})
        expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalFolderNumExceed({}).rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        //恢复原始设置
        await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
    });
    it('5.2 update sucessfully:parentId can be null', async function() {
        finalUrl=baseUrl
        expectedErrorRc=0
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=null
        data.values={[e_part.RECORD_INFO]:normalRecord,[e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topFolderId})}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
})



