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
const controllerError=require('../../server/controller/article/likeDislike_setting/likeDislike_controllerError').controllerError

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
    [e_parameterPart.PENALIZE_RELATED_INFO]:{penalizeType:e_penalizeType.NO_LIKE_DISLIKE,penalizeSubType:e_penalizeSubType.CREATE,penalizedUserData:testData.user.user1,penalizedError:controllerError.userInPenalizeNoArticleCreate,adminApp:adminApp},
    [e_parameterPart.REQ_BODY_VALUES]:{[e_part.RECORD_INFO]:normalRecord},
    [e_parameterPart.COLL_NAME]:e_coll.LIKE_DISLIKE,
    [e_parameterPart.SKIP_PARTS]:undefined,
    [e_parameterPart.APP]:app,
}

describe('dispatch check for like dislike', async function() {
    before('recreate user1 and login', async function(){
        url='likeDislike'
        finalUrl=baseUrl+url
        parameter[`APIUrl`]=finalUrl

        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        let user1Sess=userInfo.sess
        parameter.sess=user1Sess

        normalRecord[e_field.LIKE_DISLIKE.ARTICLE_ID]=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})

        //for penalize
        parameter[e_parameterPart.PENALIZE_RELATED_INFO]['rootSess']=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})

    });
    it(`preCheck for create`,async function(){
        parameter[e_parameterPart.SESS_ERROR_RC]=controllerError.userNotLoginCantCreate.rc
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizeSubType`]=e_penalizeSubType.CREATE
        parameter[e_parameterPart.PENALIZE_RELATED_INFO][`penalizedError`]=controllerError.userInPenalizeNoLikeDisLikeCreate
        // console.log(`input pramra===========>${JSON.stringify(parameter)}`)
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
    it(`inputRule for create`,async function() {
        parameter[e_parameterPart.REQ_BODY_VALUES][e_part.METHOD]=e_method.CREATE
        parameter[e_parameterPart.SKIP_PARTS]=[]//会自动转换成正确的格式（无错误的字段）
        await inputRule_API_tester.ruleCheckAll_async({
            parameter:parameter,
            expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
            expectedFieldName:[],
            skipRuleToBeCheck:[],
            skipFieldName:[],//此2个字段是内部设置，无需检查;第三个字段根据URL确定（是否需要skip）
        })
    })
})






