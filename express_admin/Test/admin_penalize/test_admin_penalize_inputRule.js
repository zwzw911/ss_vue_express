/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const adminApp=require('../../app')
const assert=require('assert')
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

const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker


const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const test_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester

const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
let baseUrl="/admin_penalize/"
let data={values:{}}
let rootSess

let normalRecord={
    [e_field.ADMIN_PENALIZE.PUNISHED_ID]:{value:'asdf'}, //创建user后直接获得id后填入
    [e_field.ADMIN_PENALIZE.DURATION]:{value:5},
    [e_field.ADMIN_PENALIZE.REASON]:{value:'testtesttesttesttesttest'},
    [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:{value:e_penalizeType.NO_ARTICLE},
    [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:{value:e_penalizeSubType.CREATE},
}

describe('method=create   misc', function() {
    before('prepare', async function () {
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        rootSess = await API_helper.adminUserLogin_returnSess_async({
            userData: {
                [e_field.ADMIN_USER.NAME]: testData.admin_user.rootAdmin.name,
                [e_field.ADMIN_USER.PASSWORD]: testData.admin_user.rootAdmin.password,
            }, adminApp: adminApp
        })
        // console.log(`rootSess is=============>${JSON.stringify(rootSess)}`)
        /*              delete admin user1                    */
        // await test_helper.deleteAdminUserAndRelatedInfo_async(testData.admin_user.user1ForModel.name)
    });
    it('not exist field check', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let recordInfo=objectDeepCopy(normalRecord)
        delete recordInfo[e_field.ADMIN_PENALIZE.REASON]
        recordInfo['notExist']={value:'xdfg'}
        data.values[e_part.RECORD_INFO]=recordInfo
        console.log(`data.values==========>${JSON.stringify(data.values)}`)
        request(adminApp).post(baseUrl).set('Accept', 'application/json').set('Cookie',[rootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.recordInfoFiledRuleNotDefine.rc)
                done();
            });
    });
})

describe('inputRule', async function() {
    let url = ``, finalUrl = baseUrl + url
    
    /*
    * @sess：是否需要sess
    * @APIUrl:测试使用的URL
    * @normalRecordInfo:一个正常的输入(document)
    * @method：测试require的时候，使用哪种method。默认是create
    * @fieldName：需要对那个field进行require测试
    * @singleRuleName: field下，某个rule的名称
    * @collRule: 整个coll的rule
    * */

    let parameter={
        //sess:rootSess,
        APIUrl:'/admin_penalize/',
        normalRecordInfo:normalRecord,
        method:e_method.CREATE,
	    collRule:browserInputRule[e_coll.ADMIN_PENALIZE],
        app:adminApp,
    }

    before('prepare', async function () {
        // console.log(`######   delete exist record   ######`)
        /*              root admin login                    */
        parameter.sess = await API_helper.adminUserLogin_returnSess_async({
            userData: {
                [e_field.ADMIN_USER.NAME]: testData.admin_user.rootAdmin.name,
                [e_field.ADMIN_USER.PASSWORD]: testData.admin_user.rootAdmin.password,
            }, adminApp: adminApp
        })
        // console.log(`parameter.sess is=============>${JSON.stringify(parameter.sess)}`)
        /*              delete/create/getId  user1                    */
        await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user1ForModel.account})
        await API_helper.createUser_async({userData:testData.user.user1,app:app})
        // normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]={}
        normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]['value']=await test_helper.getUserId_async({userAccount:testData.user.user1ForModel.account})
        // console.log(`normalRecord===========>${JSON.stringify(normalRecord)}`)
    });


    inputRule_API_tester.ruleCheckAll({parameter:parameter,expectedRuleToBeCheck:[]})


})




