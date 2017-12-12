/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const adminApp=require('../../../express_admin/app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

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

const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_action_controllerError').controllerError

let  baseUrl="/impeach_action/",finalUrl,url
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let adminRootSess,adminRootId,data={values:{}}

let recordId,expectedErrorRc

let normalRecord={
    [e_field.IMPEACH_ACTION.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined, //普通用户无需操作此字段
}

/*              create_impeach_state中的错误               */
describe('create impeach action', async function() {
    data={values:{method:e_method.CREATE}}
    let impeachId,impeachId2
    before('user1/2  login and create article and impeach', async function(){
        url=''
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        let user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        let user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})

        let articledId=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articledId,userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId


        let articledId2=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        console.log(`articledId2================>${articledId2}`)
        impeachId2=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articledId2,userSess:user2Sess,app:app})
        await API_helper.delete_impeach_async({impeachId:impeachId2,userSess:user2Sess,app:app})
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /*              userType check              */
    it('userType check, admin not allow for submit', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    /*              authorization check            */
    it('authorization check: user2 not creator try to add impeach comment', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=controllerError.notImpeachCreatorCantCreateComment.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('admin action not allow for user', async function() {
        data.values={}
        normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=controllerError.invalidActionForUser.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });
    it('action create not allow ', async function() {
        data.values={}
        normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.CREATE
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=controllerError.forbidActionForUser.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });

    /*              fk exists check            */
    it('fk:IMPEACH_ID not exists', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=testData.unExistObjectId
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=controllerHelperError.fkValueNotExist(e_chineseFieldName.impeach_action.impeachId,normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]).rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });





})

