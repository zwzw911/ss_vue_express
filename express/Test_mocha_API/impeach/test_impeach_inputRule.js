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

const e_articleStatus=server_common_file_require.mongoEnum.ArticleStatus.DB
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
let baseUrl="/impeach/"
let data={values:{}}
let rootSess

let normalRecord={
    [e_field.IMPEACH.TITLE]:'new impeach',
    [e_field.IMPEACH.CONTENT]:'<i>impeach for articlId 1234</i>',
    [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:'59e441be1bff6335e44ae657',
}



describe('inputRule', async function() {
    let url = `article`, finalUrl = baseUrl + url
    
    /*
    * @sess：是否需要sess
    * @APIUrl:测试使用的URL
    * @normalRecordInfo:一个正常的输入(document)
    * @method：测试require的时候，使用哪种method。默认是create
    * @singleRuleName: field下，某个rule的名称
    * @collRule: 整个coll的rule
    * */

    let parameter={
        //sess:rootSess,
        APIUrl:finalUrl,
        normalRecordInfo:normalRecord,
        method:e_method.UPDATE,//只能测试update，create的话，因为code会自动生成title和content，所以无法测试   //非要测试CREATE，只能测试field e_field.IMPEACH.IMPEACHED_ARTICLE_ID
	    collRule:browserInputRule[e_coll.IMPEACH],
        app:app,
    }

    before('prepare', async function () {
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
/*        parameter.sess = await API_helper.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })*/
        // console.log(`testData.user.user1 is=============>${JSON.stringify(testData.user.user1)}`)
        /*              delete/create/getId  user1                    */
        let result=await component_function.reCreateUser_returnSessUserId_async(testData.user.user1,app)
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


    inputRule_API_tester.ruleCheckAll({
        parameter:parameter,
        expectedRuleToBeCheck:[],//[e_serverRuleType.REQUIRE],
        expectedFieldName:[],//[e_field.ARTICLE_COMMENT.CONTENT]
    })


})




