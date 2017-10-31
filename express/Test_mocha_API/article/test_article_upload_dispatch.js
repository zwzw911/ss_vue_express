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
const e_impeachAllAction=server_common_file_require.mongoEnum.ImpeachAllAction.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart
// const e_articleStatus=server_common_file_require.mongoEnum.ArticleStatus.DB
// const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker


// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

const initSettingObject=require(`../../server/constant/genEnum/initSettingObject`).iniSettingObject
// const controllerError=require('../../server/controller/article/liekDislike_logic').controllerError

const controllerError=require('../../server/controller/article/article_upload_file_setting/article_upload_file_controllerError').controllerError
let baseUrl="/article/",url,finalUrl
// let data={values:{}}
// let rootSess

let normalRecord={
    // [e_field.IMPEACH.TITLE]:'new impeach',
    // [e_field.IMPEACH.CONTENT]:'<i>impeach for articlId 1234</i>',
    // [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:'59e441be1bff6335e44ae657',
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
    [e_parameterPart.PENALIZE_RELATED_INFO]:{penalizeType:e_penalizeType.NO_ARTICLE,penalizeSubType:e_penalizeSubType.UPDATE,penalizedUserData:testData.user.user1,penalizedError:controllerError.userInPenalizeNoArticleUpdate,adminApp:adminApp},
    [e_parameterPart.REQ_BODY_VALUES]:{},
    [e_parameterPart.COLL_NAME]:e_coll.IMPEACH,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:app,
}

describe('dispatch check', async function() {
    let recordId
    before('recreate user1 and login', async function(){
        url='articleImage'  //上传图片
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl

        let result=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        // let user1Id=result.userId
        let user1Sess=result.sess
        parameter.sess=user1Sess
        recordId=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=recordId

        //for penalize check
        parameter[e_parameterPart.PENALIZE_RELATED_INFO]['rootSess']=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
    });
/*    it(`preCheck for create`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.userNotLoginCantCreate.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=e_penalizeSubType.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=controllerError.userInPenalizeNoImpeachCreate
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })*/
    it(`preCheck for update`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.userNotLoginCantCreateArticleImage.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=e_penalizeSubType.UPDATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=controllerError.userInPenalizeNoArticleUpdate
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=recordId
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]
     })
/*     it(`dispatch check for delete`,async function(){
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


    /*      create只需要检查IMPEACHED_ARTICLE_ID，其余2个field在内部设置，无需检查      */
/*    it(`inputRule for create`,async function() {
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        parameter[e_parameterPart.SKIP_PARTS]=[e_skipPart.RECORD_INFO_MISC]//会自动转换成正确的格式（无错误的字段）
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],
            skipRuleToBeCheck:[],
            skipFieldName:[e_field.IMPEACH.TITLE,e_field.IMPEACH.CONTENT,e_field.IMPEACH.IMPEACHED_COMMENT_ID],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })*/
    //虽然是创建图片，是实际上是更新文档。同时，上传文件无需recordInfo,所以无需inputRule的check
/*    it(`inputRule for update`,async function() {
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.UPDATE
        parameter[e_parameterPart.SKIP_PARTS]=e_skipPart.RECORD_INFO //上传文件无需record_info
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=recordId
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ARTICLE_COMMENT.CONTENT]
        })
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]
    })*/
    /*it(`inputRule for delete`,async function() {
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.DELETE
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]=recordId
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],//[e_field.ARTICLE_COMMENT.CONTENT]
        })
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_INFO]=normalRecord
        delete parameter[e_parameterPart.REQ_BODY_VALUES][e_part.RECORD_ID]
    })*/
})

/*describe('inputRule', async function() {
    before('prepare', async function () {
        url = `article`
        finalUrl = baseUrl + url
        parameter[`APIUrl`]=finalUrl
        // console.log(`######   delete exist record   ######`)
        /!*              root admin login                    *!/
/!*        parameter.sess = await API_helper.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })*!/
        // console.log(`testData.user.user1 is=============>${JSON.stringify(testData.user.user1)}`)
        /!*              delete/create/getId  user1                    *!/
        let result=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let userId=result.userId
        let user1Sess=result.sess
        parameter.sess=user1Sess

        let articleId=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        // let folderId=await db_operation_helper.getUserFolderId_async(testData.user.user1)
        // let categoryId=testData.
        // let impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articleId,userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=articleId
        // console.log(`normalRecord============>${JSON.stringify(normalRecord)}`)
        // normalRecord[e_field.ARTICLE.CATEGORY_ID]=initSettingObject.category.other
        // normalRecord[e_field.IMPEACH_STATE.OWNER_COLL]=e_coll.USER
    });


})*/




