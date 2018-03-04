/*    gene by D:\ss_vue_express\server_common\function\assist\misc.js     */ 
 
"use strict"

const appSetting=require('../server_common/constant/config/appSetting.js')
const globalConfiguration=require('../server_common/constant/config/globalConfiguration.js')
const calcResourceConfig=require('../server_common/constant/define/calcResourceConfig.js')
const collEnum=require('../server_common/constant/enum/collEnum.js')
const inputDataRuleType=require('../server_common/constant/enum/inputDataRuleType.js')
const mongoEnum=require('../server_common/constant/enum/mongoEnum.js')
const nodeEnum=require('../server_common/constant/enum/nodeEnum.js')
const nodeRuntimeEnum=require('../server_common/constant/enum/nodeRuntimeEnum.js')
const not_used_compoundUniqueField=require('../server_common/constant/enum/not_used_compoundUniqueField.js')
const assistError=require('../server_common/constant/error/assistError.js')
const helperError=require('../server_common/constant/error/controller/helperError.js')
const maintainError=require('../server_common/constant/error/maintainError.js')
const mongoError=require('../server_common/constant/error/mongo/mongoError.js')
const redisError=require('../server_common/constant/error/redis/redisError.js')
const systemError=require('../server_common/constant/error/systemError.js')
const validateError=require('../server_common/constant/error/validateError.js')
const regex=require('../server_common/constant/regex/regex.js')
const controllerChecker=require('../server_common/controller/controllerChecker.js')
const controllerHelper=require('../server_common/controller/controllerHelper.js')
const dataConvert=require('../server_common/controller/dataConvert.js')
const awesomeCaptcha=require('../server_common/function/assist/awesomeCaptcha.js')
const checkRobot=require('../server_common/function/assist/checkRobot.js')
const cookieSession=require('../server_common/function/assist/cookieSession.js')
const crypt=require('../server_common/function/assist/crypt.js')
const gmImage=require('../server_common/function/assist/gmImage.js')
const misc=require('../server_common/function/assist/misc.js')
const pagination=require('../server_common/function/assist/pagination.js')
const sanityHtml=require('../server_common/function/assist/sanityHtml.js')
const system=require('../server_common/function/assist/system.js')
const upload=require('../server_common/function/assist/upload.js')
const validateFormat=require('../server_common/function/validateInput/validateFormat.js')
const validateHelper=require('../server_common/function/validateInput/validateHelper.js')
const validateValue=require('../server_common/function/validateInput/validateValue.js')
const API_helper=require('../server_common/Test/API_helper.js')
const component_function=require('../server_common/Test/component_function.js')
const db_operation_helper=require('../server_common/Test/db_operation_helper.js')
const generateTestData_API=require('../server_common/Test/generateTestData_API.js')
const inputRule_API_tester=require('../server_common/Test/inputRule_API_tester.js')
const misc_helper=require('../server_common/Test/misc_helper.js')
const testData=require('../server_common/Test/testData.js')
const redis_common_operation=require('../server_common/model/redis/operation/redis_common_operation.js')
const redis_common_script=require('../server_common/model/redis/operation/redis_common_script.js')
const common_operation_model=require('../server_common/model/mongo/operation/common_operation_model.js')
const common_operation_helper=require('../server_common/model/mongo/operation/common_operation_helper.js')
const common_operation_document=require('../server_common/model/mongo/operation/common_operation_document.js')
const fkConfig=require('../server_common/model/mongo/fkConfig.js')
const generateMongoEnumKeyValueExchange=require('../server_common/maintain/generateFunction/generateMongoEnumKeyValueExchange.js')

module.exports={
    appSetting,
    globalConfiguration,
    calcResourceConfig,
    collEnum,
    inputDataRuleType,
    mongoEnum,
    nodeEnum,
    nodeRuntimeEnum,
    not_used_compoundUniqueField,
    assistError,
    helperError,
    maintainError,
    mongoError,
    redisError,
    systemError,
    validateError,
    regex,
    controllerChecker,
    controllerHelper,
    dataConvert,
    awesomeCaptcha,
    checkRobot,
    cookieSession,
    crypt,
    gmImage,
    misc,
    pagination,
    sanityHtml,
    system,
    upload,
    validateFormat,
    validateHelper,
    validateValue,
    API_helper,
    component_function,
    db_operation_helper,
    generateTestData_API,
    inputRule_API_tester,
    misc_helper,
    testData,
    redis_common_operation,
    redis_common_script,
    common_operation_model,
    common_operation_helper,
    common_operation_document,
    fkConfig,
    generateMongoEnumKeyValueExchange,
}