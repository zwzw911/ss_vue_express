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
const helperError=server_common_file_require.helperError.helper
// const common_operation_model=server_common_file_require.common_operation_model
/****************  公共函数 ********************/
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
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
    // [e_field.FOLDER.AUTHOR_ID]:undefined,
    // [e_field.FOLDER.LEVEL]:undefined,
    [e_field.FOLDER.NAME]:undefined,
    [e_field.FOLDER.PARENT_FOLDER_ID]:undefined,
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
        user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]
        // ap.inf('test123')
        user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        // ap.inf('user3Info',user3Info)
        user3Id=user3Info[`userId`]
        user3Sess=user3Info[`sess`]

        // adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootSess=await component_function.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})

        //create penalize for user3
        await penalizeAPI.createPenalize_returnPenalizeId_async({adminUserSess:adminRootSess,penalizeInfo:penalizeInfoForUser3,penalizedUserId:user3Id,adminApp:adminApp})
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
    /*              create                      */
    it('1. user type chekc', async function() {
        expectedErrorRc=controllerError.dispatch.post.notLoginCantCreateFolder.rc
        let sess=await userAPI.getFirstSession({app})
        // ap.inf('sess',sess)
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2. user in penalize cant create', async function() {
        expectedErrorRc=controllerError.dispatch.post.userInPenalizeCantCreateComment.rc
        // let sess=await API_helper.getFirstSession({app})
        // ap.inf('sess',sess)
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.1 inputValue: req.body undefined', async function() {
        expectedErrorRc=validateError.validateFormat.valuesUndefined.rc
        data=undefined
        // let sess=await API_helper.getFirstSession({app})
        // ap.inf('sess',sess)
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.1.2 inputValue: req.body not object', async function() {
        expectedErrorRc=validateError.validateFormat.reqBodyMustBeObject.rc
        data=[]
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.2 inputValue: req.body no key values', async function() {
        expectedErrorRc=validateError.validateFormat.valuesUndefined.rc
        data={testkey:1234}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.2.2 inputValue: req.body.values undefined', async function() {
        expectedErrorRc=validateError.validateFormat.valuesUndefined.rc
        data={values:undefined}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.2.3 inputValue: req.body.values not object', async function() {
        expectedErrorRc=validateError.validateFormat.valueMustBeObject.rc
        data={values:[]}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('3.3.1 inputValue: req.body.values part number not expected', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartNumNotExpected.rc
        data={values:{}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    //cant be tested
/*    it('3.3.2 inputValue: expected part not pre-defined', async function() {
        expectedErrorRc=validateError.validateFormat.inputValueExceptedPartNotValid.rc
        data={values:{'unexpectedPart':'test'}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });*/
    it('3.3.3 inputValue: req.body.values part not expected', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartNotMatch.rc
        data={values:{[e_part.CAPTCHA]:'test'}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('4.1 inputValue: req.body.values part RECORDINFO null', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartRecordInfoValueFormatWrong.rc
        data={values:{[e_part.RECORD_INFO]:null}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
/*    it('4.1.1 inputValue: req.body.values part RECORDINFO undefined', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartRecordInfoValueFormatWrong.rc
        data={values:{[e_part.RECORD_INFO]:undefined}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });*/
    it('4.2 inputValue: req.body.values part RECORDINFO not objectId', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartRecordInfoValueFormatWrong.rc
        data={values:{[e_part.RECORD_INFO]:[]}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('5.1 inputValue: req.body.values part->fieldValue to be decrypt not string', async function() {
        expectedErrorRc=helperError.cryptDecryptSingleRecord.encryptedObjectIdInvalid.rc
        data={values:{[e_part.RECORD_INFO]:{[e_field.FOLDER.AUTHOR_ID]:1234}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('5.2 inputValue: req.body.values part->fieldValue to be decrypt is string, but regex check failed', async function() {
        expectedErrorRc=helperError.cryptDecryptSingleRecord.encryptedObjectIdInvalid.rc
        data={values:{[e_part.RECORD_INFO]:{[e_field.FOLDER.AUTHOR_ID]:'1234'}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });


})



