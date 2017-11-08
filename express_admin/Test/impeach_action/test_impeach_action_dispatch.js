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
const enumValue=require(`../../server/constant/genEnum/enumValue`)
// const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB

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
const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_action_controllerError').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
let baseUrl="/impeach_action/",finalUrl,url

let normalRecord={
    [e_field.IMPEACH_ACTION.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:undefined,
    // [e_field.IMPEACH_STATE.OWNER_ID]:undefined,

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
    [e_parameterPart.COLL_NAME]:e_coll.IMPEACH_ACTION,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:adminApp,
}

let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let rootSess,rootUserId
describe('dispatch', function() {

    before('reCreate adminUser1/2', async function(){
        url=''
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl
/*        /!*              reCreate root user without IMPEACH priority                 *!/
        let adminUser=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]})
        await component_function.reCreateAdminRoot_async({adminRoorData:adminUser})*/
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        rootUserId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})

        /*              adminUser1 only has deal priority           */
        adminUser1Data=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_ASSIGN,e_adminPriorityType.IMPEACH_DEAL]})
        adminUser1Info=await component_function.reCreateAdminUser_returnSessUserId_async({userData:testData.admin_user.adminUser1,rootSess:rootSess,adminApp:adminApp})
        adminUser1Sess=adminUser1Info[`sess`]
        adminUser1Id=adminUser1Info[`userId`]
/*        /!*              adminUser1 only has assign priority           *!/
        adminUser2Data=Object.assign({},testData.admin_user.adminUser2,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_ASSIGN,e_adminPriorityType.IMPEACH_ASSIGN]})
        adminUser2Info=await component_function.reCreateAdminUser_returnSessUserId_async({userData:testData.admin_user.adminUser2,rootSess:rootSess,adminApp:adminApp})
        adminUser2Sess=adminUser2Info[`sess`]
        adminUser2Id=adminUser2Info[`userId`]*/

        /*              普通用户创建一个impeach，并且submit                */
        let userInfo =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let {sess:user1Sess,userId}=userInfo
        // parameter['sess']=user1Sess
        // let articledId=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        let articledId=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})

        // console.log(`articledId=============>${JSON.stringify(articledId)}`)
        let impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articledId,userSess:user1Sess,app:app})
        //submit impeach
        let impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeachId,
        }
        await API_helper.createImpeachAction_async({sess:user1Sess,impeachActionInfo,app:app})

        normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeachId
        normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN

        parameter[e_parameterPart.SESS]=adminUser1Sess
        // normalRecord[e_field.IMPEACH_ACTION.]=userId
    });

    it(`preCheck for create`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantChangeAction.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        // parameter[`sessErrorRc`]=controllerError.notLoginCantChangeAction.rc
        // parameter[`method`]=e_method.CREATE
        // console.log(`parameter===================>${JSON.stringify(parameter)}`)
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

    it(`inputRule for create`,async function(){
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })

/*    after(`rollback adminRoot priority configure`, async function(){
        /!*              reCreate root user without all priority                 *!/
        let adminUser=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:enumValue.AdminPriorityType})
        await component_function.reCreateAdminRoot_async({adminRoorData:adminUser})
    })*/
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


