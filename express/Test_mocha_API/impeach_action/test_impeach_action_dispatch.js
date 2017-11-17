/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


// const request=require('supertest')
const app=require('../../app')
// const assert=require('assert')
const adminApp=require(`../../../express_admin/app`)

const server_common_file_require=require('../../server_common_file_require')
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
const e_impeachAllAction=server_common_file_require.mongoEnum.ImpeachAllAction.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart
// const e_=server_common_file_require.mongoEnum.
// const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_action_controllerError').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
let rootSess
let baseUrl="/impeach_action/",finalUrl,url

let normalRecord={
    [e_field.IMPEACH_ACTION.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAllAction.SUBMIT,
    [e_field.IMPEACH_ACTION.CURRENT_ADMIN_OWNER_ID]:undefined,
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined,

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
    [e_parameterPart.PENALIZE_RELATED_INFO]:{penalizeType:e_penalizeType.NO_IMPEACH,penalizeSubType:e_penalizeSubType.CREATE,penalizedUserData:testData.user.user1,penalizedError:controllerError.userInPenalizeNoImpeachCreate,adminApp:adminApp},
    [e_parameterPart.REQ_BODY_VALUES]:{[e_part.RECORD_INFO]:normalRecord},
    [e_parameterPart.COLL_NAME]:e_coll.IMPEACH_ACTION,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:app,
}
describe('dispatch', function() {

    before('root admin user login', async function(){
        url=''
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl
        let userInfo =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let {sess:user1Sess,userId}=userInfo
        parameter['sess']=user1Sess
        let articledId=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        let impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articledId,userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId
        // normalRecord[e_field.IMPEACH_ACTION.OWNER_COLL]=e_coll.USER
        // normalRecord[e_field.IMPEACH_ACTION.OWNER_ID]=userId  //普通用户无需输入OWNERID

        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        parameter[`penalizeRelatedInfo`][`rootSess`]=rootSess
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
    it(`preCheck:CREATE`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantChangeAction.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=e_penalizeSubType.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=controllerError.userInPenalizeNoImpeachCreate
        // parameter[`sessErrorRc`]=controllerError.notLoginCantChangeState.rc
        // parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    /*    it(`dispatch check for update`,async function(){
     parameter[`sessErrorRc`]=controllerError.notLoginCantUpdateUser.rc
     parameter[`method`]=e_method.UPDATE
     await inputRule_API_tester.dispatch_partCheck_async(parameter)
     })*/
/*    it(`dispatch check for delete`,async function(){
        parameter[`sessErrorRc`]=controllerError.notLoginCantDeletePenalize.rc
        parameter[`method`]=e_method.DELETE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })*/

    it(`inputRule:CREATE`,async function(){
        parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })

})


/*describe('inputRule', async function() {

    before('prepare', async function () {
        /!*========== 设置parameter =======*!/
        url=``
        finalUrl = baseUrl + url
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
        let {userId,sess}=result
        // await test_helper.deleteUserAndRelatedInfo_async({account:.account})
        // await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]=userId
    });



    it(`DELETE`,async function(){
        parameter[`method`]=e_method.DELETE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
        })
    })
})*/

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


