/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


// const request=require('supertest')
const adminApp=require('../../app')
// const assert=require('assert')
const app=require(`../../../express/app`)

const server_common_file_require=require('../../server_common_file_require')
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
const e_dbModel=require('../../server/constant/genEnum/dbModel')

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
const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
let baseUrl="/admin_penalize/",finalUrl,url
let recordId
let normalRecord={
    [e_field.ADMIN_PENALIZE.PUNISHED_ID]:'asdf', //创建user后直接获得id后填入
    [e_field.ADMIN_PENALIZE.DURATION]:5,
    [e_field.ADMIN_PENALIZE.REASON]:'testtesttesttesttesttest',
    [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:e_penalizeType.NO_ARTICLE,
    [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:e_penalizeSubType.CREATE,
}


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
    [e_parameterPart.PENALIZE_RELATED_INFO]:undefined,//{penalizeType:undefined,penalizeSubType:undefined,penalizedUserData:undefined,penalizedError:undefined,adminApp:adminApp},
    [e_parameterPart.REQ_BODY_VALUES]:{[e_part.RECORD_INFO]:normalRecord},
    [e_parameterPart.COLL_NAME]:e_coll.ADMIN_PENALIZE,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:adminApp,
}


describe('preCheck check for penalize', function() {

    before('root admin user login', async function(){
        url=''
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl

        let rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        parameter[e_parameterPart.SESS]=rootSess

        //首先清空所有penalize
        await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel.admin_penalize]})
        //for update/delete
        recordId=await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:rootSess,penalizeInfo:normalRecord,penalizedUserData:testData.user.user1,adminApp:adminApp})
    });


    it(`preCheck for create`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantCreatePenalize.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        // parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=undefined
        // parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=undefined
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    /*    it(`dispatch check for update`,async function(){
     parameter[`sessErrorRc`]=controllerError.notLoginCantUpdateUser.rc
     parameter[`method`]=e_method.UPDATE
     await inputRule_API_tester.dispatch_partCheck_async(parameter)
     })*/
    it(`preCheck for delete`,async function(){

        // parameter[`sessErrorRc`]=controllerError.notLoginCantDeletePenalize.rc
        // parameter[`method`]=e_method.DELETE
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantDeletePenalize.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.DELETE
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=recordId
        // parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=undefined
        // parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=undefined
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })

})


describe('inputRule', async function() {

    before('prepare', async function () {
        /*========== 设置parameter =======*/
        url=``
        finalUrl = baseUrl + url

        parameter[`APIUrl`]=finalUrl

        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        parameter.sess = await API_helper.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })
        // console.log(`testData.user.user1 is=============>${JSON.stringify(testData.user.user1)}`)
        /*              delete/create/getId  user1                    */
        let result=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let userId=result.userId
        // await test_helper.deleteUserAndRelatedInfo_async({account:.account})
        // await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=userId
    });


    it(`inputRule for create`,async function(){
        parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })
    it(`inputRule for delete`,async function(){
        parameter[`method`]=e_method.DELETE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })
})

/*describe('inputRule:DELETE', async function() {
    before('prepare', async function () {
        /!*========== 设置parameter =======*!/
        url=``
        finalUrl = baseUrl + url
        parameter[`method`]=e_method.DELETE
        parameter[`APIUrl`]=finalUrl

        // console.log(`######   delete exist record   ######`)
        /!*              root admin login                    *!/
        parameter.sess = await API_helper.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })
        // console.log(`testData.user.user1 is=============>${JSON.stringify(testData.user.user1)}`)
        /!*              delete/create/getId  user1                    *!/
        let result=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let userId=result.userId
        // await test_helper.deleteUserAndRelatedInfo_async({account:.account})
        // await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=userId
        // console.log(`normalRecord===========>${JSON.stringify(normalRecord)}`)
    });


    it(`DELETE`,async function(){
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
        })
    })

})*/


