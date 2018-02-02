/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

const controllerError=require('../../server/controller/public_group/public_group_setting/public_group_controllerError').controllerError
let  baseUrl="/public_group/",finalUrl,url

const ap=require(`awesomeprint`)

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
const e_publicGroupJoinInRule=server_common_file_require.mongoEnum.PublicGroupJoinInRule.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
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
    [e_field.PUBLIC_GROUP.NAME]:'test',
    [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.PERMIT_ALLOW,
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined, //普通用户无需操作此字段
}

/*              create_impeach_state中的错误               */
describe('public group', async function() {
    data={values:{method:e_method.CREATE}}
    let impeachId,impeachId2
    before('user1/2/3 recreate and login ', async function(){
        url=''
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        let user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        let user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        let user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        user3Id=user3Info[`userId`]
        user3Sess=user3Info[`sess`]

        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})

        /*          user1/2 create group(for unique test)     */
        tmpResult=await API_helper.genaralCreate_returnRecord_async({userData:normalRecord,sess:user1Sess,app:app,url:finalUrl,})
        recordId1=tmpResult['_id']

        copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.PUBLIC_GROUP.NAME]='test2'
        tmpResult=await API_helper.genaralCreate_returnRecord_async({userData:copyNormalRecord,sess:user2Sess,app:app,url:finalUrl,})
        recordId2=tmpResult['_id']
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /****************************************/
    /*              create                  */
    /****************************************/
    describe('create public group', async function() {
        before('init var', async function(){
            data.values = {}
            data.values[e_part.METHOD] = e_method.CREATE
        })
        it('userType check, admin not allow for create', async function() {

            copyNormalRecord=objectDeepCopy(normalRecord)
            data.values[e_part.RECORD_INFO]=normalRecord

            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it(`field ${e_field.PUBLIC_GROUP.ADMINS_ID} not allow for create`, async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]=user1Id
            data.values[e_part.RECORD_INFO]=copyNormalRecord

            expectedErrorRc=validateError.validateValue.fieldValueShouldNotExistSinceNoRelateApplyRange({}).rc
            await misc_helper.sendDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it(`field ${e_field.PUBLIC_GROUP.CREATOR_ID} not allow for client input`, async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.PUBLIC_GROUP.CREATOR_ID]=user1Id
            data.values[e_part.RECORD_INFO]=copyNormalRecord

            expectedErrorRc=validateError.validateFormat.recordInfoFiledRuleNotDefine.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.CREATOR_ID,app:app})
        });
        it(`field ${e_field.PUBLIC_GROUP.MEMBERS_ID} not allow for create`, async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.PUBLIC_GROUP.MEMBERS_ID]=[user1Id]
            data.values[e_part.RECORD_INFO]=copyNormalRecord

            expectedErrorRc=validateError.validateValue.fieldValueShouldNotExistSinceNoRelateApplyRange({}).rc
            await misc_helper.sendDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.MEMBERS_ID,app:app})
        });

        it(`limitation check: reach max user number(manually change global setting to 0)`, async function() {

            copyNormalRecord=objectDeepCopy(normalRecord)
            // copyNormalRecord[e_field.PUBLIC_GROUP.MEMBERS_ID]=[user1Id]
            data.values[e_part.RECORD_INFO]=copyNormalRecord

            expectedErrorRc=controllerError.publicGroupNumberExceed.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it(`group name xss check`, async function() {

            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.PUBLIC_GROUP.NAME]='<alert>as'
            data.values[e_part.RECORD_INFO]=copyNormalRecord


            expectedErrorRc=helperError.XSSCheckFailed(e_field.PUBLIC_GROUP.NAME).rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        it(`group name unique check`, async function() {

            copyNormalRecord=objectDeepCopy(normalRecord)
            // copyNormalRecord[e_field.PUBLIC_GROUP.NAME]='<alert>as'
            data.values[e_part.RECORD_INFO]=copyNormalRecord


            expectedErrorRc=controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.PUBLIC_GROUP,fieldName:e_field.PUBLIC_GROUP.NAME}).rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })

    describe('update public group', async function() {
        before('init var', async function(){
            data.values = {}
            data.values[e_part.METHOD] = e_method.UPDATE
        })
        it('userType check, admin not allow for update', async function () {

            copyNormalRecord = objectDeepCopy(normalRecord)
            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({
                APIUrl: finalUrl,
                sess: adminRootSess,
                data: data,
                expectedErrorRc: expectedErrorRc,
                app: app
            })
        });
        it('user2 try to update group while user2 not admin', async function () {
            copyNormalRecord = objectDeepCopy(normalRecord)
            data.values[e_part.RECORD_INFO] = normalRecord
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = controllerError.notUserGroupAdminCantUpdate.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user2Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });
        it('only 2 field(name/joinRule) allow update(cant test, already detected by preCheck)', async function () {
            copyNormalRecord = objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]=[user2Id]
            data.values[e_part.RECORD_INFO] = copyNormalRecord
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = controllerError.notAllowUpdateField.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user2Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });

        it('update group name with XSS', async function () {
            copyNormalRecord = objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.PUBLIC_GROUP.NAME]='<alert>a'
            data.values[e_part.RECORD_INFO] = copyNormalRecord
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = helperError.XSSCheckFailed(e_field.PUBLIC_GROUP.NAME).rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user1Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });
        it('update group name with duplicate', async function () {
            copyNormalRecord = objectDeepCopy(normalRecord)
            // copyNormalRecord[e_field.PUBLIC_GROUP.NAME]='<alert>a'
            data.values[e_part.RECORD_INFO] = copyNormalRecord
            data.values[e_part.RECORD_ID]=recordId2

            expectedErrorRc =controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.PUBLIC_GROUP,fieldName:e_field.PUBLIC_GROUP.NAME}).rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user2Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });
        it('normal update', async function () {
            copyNormalRecord = objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.PUBLIC_GROUP.NAME]='test3'
            data.values[e_part.RECORD_INFO] = copyNormalRecord
            data.values[e_part.RECORD_ID]=recordId2

            expectedErrorRc =0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user2Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });
    })

    describe('delete public group', async function() {
        // userType check
        before('init var', async function(){
            data.values = {}
            data.values[e_part.METHOD] = e_method.DELETE
        })


        it('userType check, admin not allow for delete', async function () {
            copyNormalRecord = objectDeepCopy(normalRecord)
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({
                APIUrl: finalUrl,
                sess: adminRootSess,
                data: data,
                expectedErrorRc: expectedErrorRc,
                app: app
            })
        });
        it('user2 try to delete group which create by user1', async function () {
            copyNormalRecord = objectDeepCopy(normalRecord)
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = controllerError.notGroupCreatorCantDelete.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user2Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });


        it('group1 memberId number more than 1', async function () {
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:recordId1,updateFieldsValue:{$addToSet:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:user2Id}}})

            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = controllerError.cantDeleteGroupContainMember.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user1Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });

        it('group1 memberId number 1, but not creator', async function () {
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:recordId1,updateFieldsValue:{$addToSet:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:user2Id}}})
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:recordId1,updateFieldsValue:{$pull:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:user1Id}}})

            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc = controllerError.cantDeleteGroupContainMember.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl: finalUrl, sess: user1Sess, data: data, expectedErrorRc: expectedErrorRc, app: app})
        });

    })
})

