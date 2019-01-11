/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/**************  controller相关常量  ****************/

/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/******************    待测函数  **************/
const app=require('../../app')
const adminApp=require(`../../../express_admin/app`)

const server_common_file_require=require('../../server_common_file_require')
/****************  公共常量 ********************/
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum
const e_userType=mongoEnum.UserType.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB


const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
// const controllerError=require('../../server/controller/user/user_logic/user_controllerError').controllerError

/******************    数据库函数  **************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
/****************  公共函数 ********************/
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
const API_helper=server_common_file_require.API_helper//require('../../../server_common/Test/API')
// const inputRule_API_tester=server_common_file_require.inputRule_API_tester
const component_function=server_common_file_require.component_function

// const controllerError=require('../../server/controller/article/liekDislike_logic').controllerError
let baseUrl="/user/",url,finalUrl
let normalRecord=testData.user.user1

/****************  class ********************/
const class_user=server_common_file_require.class_user


let user1=new class_user.c_user({userData:testData.user.user1})

user1.reCreateUserGetSessUserIdSalt_async().then(
    function(r){
        ap.inf('create uer succ',r)
    },
    function(e){
        ap.inf('create uer err',e)
    },
)




