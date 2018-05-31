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
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck
const resourceCheck=server_common_file_require.helperError.resourceCheck
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
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
//用户登录信息
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let userData,tmpResult,copyNormalRecord
let adminRootSess,adminRootId,data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc

let user1ParentFolderIdCrypted,user1ParentFolderIdGetByUser2Crypted,user1ParentFolderIdGetByAdminRoot,unExistCryptedFolderIdForUser1
let user2ParentFolderIdCrypted,user2ParentFolderIdGetByUser1Crypted//,user1ParentFolderIdGetByAdminRoot

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
        user1Info =await userComponentFunction.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        user2Info =await userComponentFunction.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        user3Info =await userComponentFunction.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        // ap.inf('user3Info',user3Info)
        user3Id=user3Info[`userId`]//非加密
        user3Sess=user3Info[`sess`]

        // adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootSess=await adminUserComponentFunction.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})

        /*** create penalize for user3 ***/
        let adminRootSalt=await commonAPI.getTempSalt_async({sess:adminRootSess})
        // ap.inf('root user salt',adminRootSalt)
        let cryptedUser3Id=crypt.cryptSingleFieldValue({fieldValue:user3Id,salt:adminRootSalt}).msg
        // ap.inf('cryptedUser3Id',cryptedUser3Id)
        await penalizeAPI.createPenalize_returnPenalizeId_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfoForUser3,penalizedUserId:cryptedUser3Id,adminApp:adminApp})

        // data.values={[e_part.RECORD_INFO]:normalRecord}
        // // ap.inf('data',data)
        /*** user1 get its own folder id ***/
        let user1AllTopLevelFolderResult=await folderAPI.getAllTopLevelFolder_async({sess:user1Sess,app:app})
        user1ParentFolderIdCrypted=user1AllTopLevelFolderResult['folder'][0][e_field.FOLDER.ID]

        /*** user2 get user1 folder id ***/
        let tmpResult =await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:{[e_field.FOLDER.AUTHOR_ID]:user1Id},[e_field.FOLDER.LEVEL]:1})
        let user1ParentFolderId=tmpResult[0]['id']
        // let user2Salt=await commonAPI.getTempSalt_async({sess:user2Sess})
        // user1ParentFolderIdGetByUser2Crypted=crypt.cryptSingleFieldValue({fieldValue:user1ParentFolderId,salt:user2Salt}).msg
        user1ParentFolderIdGetByUser2Crypted=await commonAPI.cryptObjectId_async({objectId:user1ParentFolderId,sess:user2Sess})
        /*** user2 get its own folder id ***/
        let user2AllTopLevelFolderResult=await folderAPI.getAllTopLevelFolder_async({sess:user1Sess,app:app})
        user2ParentFolderIdCrypted=user2AllTopLevelFolderResult['folder'][0][e_field.FOLDER.ID]
        /*** user1 get user2 folder id ***/
        tmpResult =await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:{[e_field.FOLDER.AUTHOR_ID]:user2Id},[e_field.FOLDER.LEVEL]:1})
        let user2ParentFolderId=tmpResult[0]['id']
        // let user1Salt=await commonAPI.getTempSalt_async({sess:user1Sess})
        // user2ParentFolderIdGetByUser1Crypted=crypt.cryptSingleFieldValue({fieldValue:user2ParentFolderId,salt:user1Salt}).msg
        user2ParentFolderIdGetByUser1Crypted=await commonAPI.cryptObjectId_async({objectId:user2ParentFolderId,sess:user1Sess})
        /*** adminRoot get user1 folder id ***/
        user1ParentFolderIdGetByAdminRoot=await commonAPI.cryptObjectId_async({objectId:user1ParentFolderId,sess:adminRootSess})

        unExistCryptedFolderIdForUser1=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})

        /***    user1 create child folder in root folder    ***/
        let data={values:{}}
        data.values[e_part.RECORD_INFO]={}
        data.values[e_part.RECORD_INFO][e_field.FOLDER.PARENT_FOLDER_ID]=await commonAPI.cryptObjectId_async({objectId:user1ParentFolderId,sess:user1Sess})
        data.values[e_part.RECORD_INFO][e_field.FOLDER.NAME]='test'
        tmpResult=await folderAPI.createFolder_async({sess:user1Sess,data:data,app:app})
        // ap.inf('tmpreuslt',tmpResult)
        recordId1=tmpResult['id']
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /*    it(`penalize check`,async function(){
            //reason:,penalizeType:,penalizeSubype:,duration:
            let penalizeInfo={
                [e_field.ADMIN_PENALIZE.REASON]:'test for test test test',
                [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:e_penalizeType.NO_IMPEACH,
                [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:e_penalizeSubType.CREATE,
                [e_field.ADMIN_PENALIZE.DURATION]:1,
            }
            await API_helper.createPenalize_async({adminUserSess:rootSess,penalizeInfo:penalizeInfo,pernalizedUserData:testData.user.user1,adminApp:adminApp})
        })*/
    /**              create                      **/

    it('1.1 create:unexpected user type', async function() {
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1ParentFolderIdGetByAdminRoot
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('1.2 create:success', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1ParentFolderIdCrypted
        expectedErrorRc=0
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    //创建 不允许字段为null（类型不正确，而 update是允许的）
    it('1.3 create:parentId cant be null', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=null
        expectedErrorRc=validateError.validateValue.CUDTypeWrong.rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.FOLDER.PARENT_FOLDER_ID],app:app})
    });
    /*** 无法测试，因为parentFolderId会预先进行objectId的检测  ***/
/*    it('1.4 create:parentId cant be null', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=''
        expectedErrorRc=validateError.validateValue.CUDTypeWrong.rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:[e_field.FOLDER.PARENT_FOLDER_ID],app:app})
    });*/
    it('1.5 create:unExist parentId', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=unExistCryptedFolderIdForUser1
        expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist().rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('1.6 create: user1 try to user user2 folderId as parentId', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user2ParentFolderIdGetByUser1Crypted
        expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /*** 无法测试，rule阻止输入符号  ***/
/*    it('1.7 create: name XSS', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.NAME]='_1'
        delete normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]//user2ParentFolderIdGetByUser1Crypted
        expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });*/

    it('1.8 create: user1 created sub folder successfully', async function() {
        finalUrl=baseUrl
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1ParentFolderIdCrypted
        expectedErrorRc=0
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /**              get                      **/
    it('2.1 get root folder', async function() {
        expectedErrorRc=0
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.2 get child folder: crypted folder id format invalid', async function() {
        url='12345243535636576785'
        finalUrl=baseUrl+url
        expectedErrorRc=controllerError.dispatch.get.cryptedFolderIdFormatInvalid.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.3 get child folder: decrypted folder id format valid', async function() {
        // url=testData.cryptedObjectId //16c8277c10df1212212acd05acd64f7b8acb644469a8a008c23c7dd76da06863
        url='3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22'
        finalUrl=baseUrl+url
        expectedErrorRc=controllerError.dispatch.get.decryptedFolderIdFormatInvalid.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.4 get: user type incorrect', async function() {
        // url=testData.cryptedObjectId //16c8277c10df1212212acd05acd64f7b8acb644469a8a008c23c7dd76da06863
        url=user1ParentFolderIdGetByAdminRoot
        finalUrl=baseUrl+url
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.5 get: user2 try to get user1 folder', async function() {
        // url=testData.cryptedObjectId //16c8277c10df1212212acd05acd64f7b8acb644469a8a008c23c7dd76da06863
        url=user1ParentFolderIdGetByUser2Crypted
        finalUrl=baseUrl+url
        expectedErrorRc=controllerError.get.notAuthorCantGetFolder.rc
        // let sess=await userAPI.getFirstSession({app})
        // data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /********** update   ***********/
    it('3.1 update: user type incorrect ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        data={values:{[e_part.RECORD_ID]:user1ParentFolderIdGetByAdminRoot,[e_part.RECORD_INFO]:{[e_field.FOLDER.NAME]:'test'}}}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('3.2 update: priority check, user not the owner of folderId ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.update.notAuthorCantUpdateFolder.rc
        data={values:{[e_part.RECORD_ID]:user1ParentFolderIdGetByUser2Crypted,[e_part.RECORD_INFO]:{[e_field.FOLDER.NAME]:'test'}}}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('3.3 update:parentId cant be self', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.update.parentFolderIdCantBeSelf.rc
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1ParentFolderIdCrypted
        data.values={[e_part.RECORD_INFO]:normalRecord,[e_part.RECORD_ID]:user1ParentFolderIdCrypted}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.4 update: empty data', async function() {
        finalUrl=baseUrl
        expectedErrorRc=validateError.validateFormat.recordInfoCantEmpty.rc
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1ParentFolderIdCrypted
        data.values={[e_part.RECORD_INFO]:{},[e_part.RECORD_ID]:user1ParentFolderIdCrypted}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.5 update: no data change', async function() {
        finalUrl=baseUrl
        expectedErrorRc=0
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1ParentFolderIdCrypted
        data.values={[e_part.RECORD_INFO]:{[e_field.FOLDER.NAME]:'我的文档'},[e_part.RECORD_ID]:user1ParentFolderIdCrypted}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /********** delete   ***********/
    it('4.1 delete: user type incorrect ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        data={values:{[e_part.RECORD_ID]:user1ParentFolderIdGetByAdminRoot}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('4.2 delete: priority check, user not the owner of folderId ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.delete.notAuthorCantDeleteFolder.rc
        data={values:{[e_part.RECORD_ID]:user1ParentFolderIdGetByUser2Crypted}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('4.3 delete: has child folder cant be delete ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.delete.childFolderInFolderCanDelete.rc
        data={values:{[e_part.RECORD_ID]:user1ParentFolderIdCrypted}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('4.4 delete: successful ', async function() {
        finalUrl=baseUrl
        expectedErrorRc=0
        data={values:{[e_part.RECORD_ID]:recordId1}}
        await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /****** manual test   *******/
    /** 需要手工在db中改门限值 ***/
    it('5.1 create: resource check', async function() {
        finalUrl=baseUrl
        // normalRecord[e_field.FOLDER.NAME]='test'
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=user1ParentFolderIdCrypted
        expectedErrorRc=resourceCheck.ifEnoughResource_async.totalFolderNumExceed({}).rc
        // let sess=await userAPI.getFirstSession({app})
        data.values={[e_part.RECORD_INFO]:normalRecord}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('5.2 update:parentId can be null', async function() {
        finalUrl=baseUrl
        expectedErrorRc=controllerError.update.parentFolderIdCantBeSelf.rc
        normalRecord[e_field.FOLDER.PARENT_FOLDER_ID]=null
        data.values={[e_part.RECORD_INFO]:normalRecord,[e_part.RECORD_ID]:user1ParentFolderIdCrypted}
        await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
})



