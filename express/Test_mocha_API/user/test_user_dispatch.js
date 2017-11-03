/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


// const request=require('supertest')
const app=require('../../app')
// const assert=require('assert')
const adminApp=require(`../../../express/app`)

const server_common_file_require=require('../../server_common_file_require')
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

const e_userType=server_common_file_require.mongoEnum.UserType.DB

const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/user/user_logic/user_controllerError').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

// const controllerError=require('../../server/controller/article/liekDislike_logic').controllerError
let baseUrl="/user/",url,finalUrl
let normalRecord=testData.user.user1


/*
 * @sess：是否需要sess
 * @sessErrorRc：测试sess是否存在时，使用的error
 * @APIUrl:测试使用的URL
 * @penalizeRelatedInfo: {penalizeType:,penalizeSubType:,penalizedUserData:,penalizedError:,rootSess:,adminApp}
 * @reqBodyValues: 各个part。包含recordInfo/recordId/searchParams等
 * @skipParts：某些特殊情况下，需要skip掉的某些part
 * @collName: 获得collRule，进行collName的对比等
 * */
let parameter={
    [e_parameterPart.SESS]:undefined,
    [e_parameterPart.SESS_ERROR_RC]:undefined,
    [e_parameterPart.API_URL]:undefined,
    [e_parameterPart.PENALIZE_RELATED_INFO]:undefined,//{penalizeType:e_penalizeType.NO_IMPEACH,penalizeSubType:e_penalizeSubType.CREATE,penalizedUserData:testData.user.user1,penalizedError:controllerError.userInPenalizeNoImpeachCreate,adminApp:adminApp},
    [e_parameterPart.REQ_BODY_VALUES]:{[e_part.RECORD_INFO]:normalRecord},
    [e_parameterPart.COLL_NAME]:e_coll.USER,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:app,
}
describe('dispatch', function() {
    before('recreate user1', async function(){
        url = ``
        finalUrl = baseUrl + url
        parameter[`APIUrl`]=finalUrl
        /*              普通用户操作             */

        // await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user1ForModel.account})
        // await  API_helper.createUser_async({userData:testData.user.user1,app:app})
        // user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
        // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });

    it(`dispatch check for create`,async function(){
        delete   parameter[e_parameterPart.SESS]
        // parameter[`sessErrorRc`]=controllerError.notLoginCantChangeState.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    it(`dispatch check for update`,async function(){
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        parameter[e_parameterPart.SESS]=userInfo['sess']
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantUpdate.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
})

describe('inputRule', async function() {
    before('prepare', async function () {
        url = ``
        finalUrl = baseUrl + url
        parameter[`APIUrl`]=finalUrl

    });

    it(`inputRule:CREATE`,async function(){
        delete   parameter[e_parameterPart.SESS]
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })
    it(`inputRule:UPDATE`,async function(){
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        parameter[e_parameterPart.SESS]=userInfo['sess']
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        //更新user的时候，无需recordId，而是直接从sess中获得
        parameter[e_parameterPart.SKIP_PARTS]=[e_part.RECORD_ID]
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })


})




