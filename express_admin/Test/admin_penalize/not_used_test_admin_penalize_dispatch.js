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

const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

let userId  //create后存储对应的id，以便后续的update操作

let finalUrl,baseUrl="/admin_penalize/"

describe('dispatch check for penalize', function() {
    let data = {values: {}},url=''
    finalUrl=baseUrl+url
    // let rootSess
    let parameter={
        sess:undefined,
        sessErrorRc:undefined,
        APIUrl:finalUrl,
        method:undefined,
        app:adminApp,
    }
    before('root admin user login', async function(){
        /*              清理已有数据              */
        // console.log(`######   delete exist record   ######`)
        // console.log(`correctValueForModel ${JSON.stringify(correctValueForModel)}`)
        parameter['sess']=await API_helper.adminUserLogin_returnSess_async({userData:{
            [e_field.ADMIN_USER.NAME]:testData.admin_user.adminRoot.name,
            [e_field.ADMIN_USER.PASSWORD]:testData.admin_user.adminRoot.password,
        },adminApp:adminApp})
        // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });

    it(`dispatch check for create`,async function(){
        parameter[`sessErrorRc`]=controllerError.notLoginCantCreatePenalize.rc
        parameter[`method`]=e_method.CREATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })
/*    it(`dispatch check for update`,async function(){
        parameter[`sessErrorRc`]=controllerError.notLoginCantUpdateUser.rc
        parameter[`method`]=e_method.UPDATE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })*/
    it(`dispatch check for delete`,async function(){
        parameter[`sessErrorRc`]=controllerError.notLoginCantDeletePenalize.rc
        parameter[`method`]=e_method.DELETE
        await inputRule_API_tester.dispatch_partCheck_async(parameter)
    })

})






