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

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/admin/admin_setting/admin_user_controllerError').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const test_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester

let userId  //create后存储对应的id，以便后续的update操作

let finalUrl,baseUrl='/admin_user/',url

let normalRecord=testData.admin_user.adminUser1
testData.admin_user.adminUser1[e_field.ADMIN_USER.USER_PRIORITY]=['1']

/*
 * @sess：是否需要sess
 * @sessErrorRc：但要测试sess的时候，期望产生的错误
 * @APIUrl:测试使用的URL
 * @normalRecordInfo:一个正常的输入(document)
 * @method：测试require的时候，使用哪种method。默认是create
 * @fieldName：需要对那个field进行require测试
 * @singleRuleName: field下，某个rule的名称
 * @collRule: 整个coll的rule
 * */
let parameter={
    sess:undefined,
    sessErrorRc:undefined,
    APIUrl:undefined,
    normalRecordInfo:normalRecord,
    method:undefined,
    collRule:browserInputRule[e_coll.ADMIN_USER],
    app:adminApp,
}
describe('dispatch check', async function() {
    before('root admin user login', async function(){
        url=''
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl
        /*              清理已有数据              */
        // console.log(`######   delete exist record   ######`)
        // console.log(`correctValueForModel ${JSON.stringify(correctValueForModel)}`)
        parameter.sess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });
    it(`dispatch check for create`,async function(){
        parameter[`sessErrorRc`]=controllerError.notLoginCantCreateUser.rc
        parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    it(`dispatch check for update`,async function(){
        parameter[`sessErrorRc`]=controllerError.notLoginCantUpdateUser.rc
        parameter[`method`]=e_method.UPDATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    it(`dispatch check for delete`,async function(){
        parameter[`sessErrorRc`]=controllerError.notLoginCantDeleteUser.rc
        parameter[`method`]=e_method.DELETE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    it(`dispatch check for login`,async function(){
        delete parameter[`sess`]
        parameter[`method`]=e_method.MATCH
        // console.log(`parameter=======>${JSON.stringify(parameter)}`)
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })

})

describe('inputRule', async function() {
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
        await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.adminUser1.name)
        // await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]['value']=await test_helper.getUserId_async({userAccount:testData.user.user1ForModel.account})
        // console.log(`normalRecord===========>${JSON.stringify(normalRecord)}`)
    });



    it(`inputRule: CREATE`,async function(){
        parameter['method']=e_method.CREATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ADMIN_USER.USER_PRIORITY]
        })
        });
    it(`inputRule: UPDATE`,async function() {
        parameter['method'] = e_method.UPDATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter: parameter,
            expectedRuleToBeCheck: [],//[e_serverRuleType.REQUIRE],
            expectedFieldName: [],//[e_field.ADMIN_USER.USER_PRIORITY]
        })
    });

})


