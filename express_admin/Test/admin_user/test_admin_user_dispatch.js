/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const adminApp=require('../../app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminUserPriority=server_common_file_require.mongoEnum.AdminPriorityType.DB

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
const controllerError=require('../../server/controller/admin/admin_setting/admin_user_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function



let finalUrl,baseUrl='/admin_user/',url

let normalRecord=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:['1']})
// testData.admin_user.adminUser1[e_field.ADMIN_USER.USER_PRIORITY]=['1']

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
    [e_parameterPart.COLL_NAME]:e_coll.ADMIN_USER,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:adminApp,
}
describe('dispatch check for admin user:', async function() {
    let rootSess
    let adminUser1Info,adminUser1Id,adminUser1Sess
    before('root admin user login', async function(){
        url=''
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl
        /*              清理已有数据              */
        // console.log(`######   delete exist record   ######`)
        // console.log(`correctValueForModel ${JSON.stringify(correctValueForModel)}`)
        rootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        parameter[e_parameterPart.SESS]=rootSess

        adminUser1Info=await component_function.reCreateAdminUser_returnSessUserId_async({userData:testData.admin_user.adminUser1,rootSess:rootSess,adminApp:adminApp})
        adminUser1Sess=adminUser1Info[`sess`]
            adminUser1Id=adminUser1Info[`userId`]
            // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });
    it(`preCheck for create`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantCreateUser.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE

        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    it(`preCheck for update`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantUpdateUser.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=adminUser1Id
        /*              为了实施正确的update for admin user，需要recordInfo中去除name字段          */
        let updateInfo=objectDeepCopy(normalRecord)
        delete updateInfo[e_field.ADMIN_USER.NAME]
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]=updateInfo

        await inputRule_API_tester.dispatch_partCheck_async(parameter)

        /*              恢复原始数据                  */
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]=normalRecord
    })
    it(`preCheck for delete`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.notLoginCantDeleteUser.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.DELETE

        /*              delete 无需recordInfo             */
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=adminUser1Id
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
        /*              恢复原始数据                      */
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]=normalRecord
    })
    it(`preCheck for login`,async function(){

        delete parameter[`sess`]

        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.MATCH

        // console.log(`parameter=======>${JSON.stringify(parameter)}`)
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })

})

describe('inputRule check for admin user', async function() {
    before('prepare', async function () {
        url = ``, finalUrl = baseUrl + url
        parameter[`APIUrl`]=finalUrl
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        parameter.sess = await API_helper.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })
        // console.log(`parameter.sess is=============>${JSON.stringify(parameter.sess)}`)
        /*              delete  adminUser1                    */
        await db_operation_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        // await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]['value']=await db_operation_helper.getUserId_async({userAccount:testData.user.user1ForModel.account})
        // console.log(`normalRecord===========>${JSON.stringify(normalRecord)}`)
    });



    it(`inputRule for create`,async function(){
        // parameter['method']=e_method.CREATE
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_USER.USER_PRIORITY]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
        });
    it(`inputRule for update`,async function() {
        // parameter['method'] = e_method.UPDATE
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter: parameter,
            expectedRuleToBeCheck: [],//[e_serverRuleType.REQUIRE],
            expectedFieldName: [],//[e_field.ADMIN_USER.USER_PRIORITY]
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    });

})


