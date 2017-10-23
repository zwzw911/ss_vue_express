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

const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/article/liekDislike_logic').controllerError

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

// const controllerError=require('../../server/controller/article/liekDislike_logic').controllerError
let baseUrl="/article/",url,finalUrl


let normalRecord={
    [e_field.LIKE_DISLIKE.ARTICLE_ID]:'', //创建user后直接获得id后填入
    [e_field.LIKE_DISLIKE.LIKE]:true,
}


/*
 * @sess：是否需要sess
 * @APIUrl:测试使用的URL
 * @penalizeRelatedInfo: {penalizeType:,penalizeSubType:,penalizedUserData:,penalizedError:,rootSess:,adminApp}
 * @normalRecordInfo:一个正常的输入(document)
 * @method：测试require的时候，使用哪种method。默认是create
 * @fieldName：需要对那个field进行require测试
 * @singleRuleName: field下，某个rule的名称
 * @collRule: 整个coll的rule
 * */
let parameter={
    sess:undefined,
    APIUrl:undefined,
    penalizeRelatedInfo:undefined,
    normalRecordInfo:normalRecord,
    method:undefined,
    collRule:browserInputRule[e_coll.LIKE_DISLIKE],
    app:app,
}

describe('dispatch check', async function() {
    before('recreate user1 and login', async function(){
        url='likeDislike'
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl
        /*              清理已有数据              */
        // console.log(`######   delete exist record   ######`)
        // console.log(`correctValueForModel ${JSON.stringify(correctValueForModel)}`)
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        parameter.sess=userInfo[`sess`]
        // console.log(`parameter.sess ${JSON.stringify(parameter.sess)}`)
    });
    it(`dispatch check for create`,async function(){
        parameter[`sessErrorRc`]=controllerError.userNotLoginCantCreate.rc
        parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
    /*it(`dispatch check for update`,async function(){
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
     })*/

})

describe('inputRule', async function() {
    before('prepare', async function () {
        url = `likeDislike`
        finalUrl = baseUrl + url
        parameter[`APIUrl`]=finalUrl
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
/*        parameter.sess = await API_helper.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })*/
        // console.log(`testData.user.user1 is=============>${JSON.stringify(testData.user.user1)}`)
        /*              delete/create/getId  user1                    */
        let result=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let userId=result.userId
        parameter.sess=result.sess

        normalRecord[e_field.LIKE_DISLIKE.ARTICLE_ID]=await API_helper.createNewArticle_returnArticleId_async({userSess:result.sess,app:app})
        // await test_helper.deleteUserAndRelatedInfo_async({account:.account})
        // await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}

        // console.log(`normalRecord===========>${JSON.stringify(normalRecord)}`)
    });

    it(`inputRule: CREATE`,async function() {
        parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.ruleCheckAll_async({
            parameter: parameter,
            expectedRuleToBeCheck: [],//[e_serverRuleType.REQUIRE],
            expectedFieldName: [],//[e_field.ADMIN_PENALIZE.PUNISHED_ID]
        })
    })


})




