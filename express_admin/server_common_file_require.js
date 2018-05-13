/*    gene by H:\ss_vue_express\server_common\function\assist\file.js     */ 
 
"use strict"

const globalConfiguration=require('../server_common/constant/config/globalConfiguration.js')
const appSetting=require('../server_common/constant/config/appSetting.js')
const calcResourceConfig=require('../server_common/constant/define/calcResourceConfig.js')
const not_used_calcResourceConfig=require('../server_common/constant/define/not_used_calcResourceConfig.js')
const collEnum=require('../server_common/constant/enum/collEnum.js')
const inputDataRuleType=require('../server_common/constant/enum/inputDataRuleType.js')
const mongoEnum=require('../server_common/constant/enum/mongoEnum.js')
const nodeEnum=require('../server_common/constant/enum/nodeEnum.js')
const not_used_compoundUniqueField=require('../server_common/constant/enum/not_used_compoundUniqueField.js')
const nodeRuntimeEnum=require('../server_common/constant/enum/nodeRuntimeEnum.js')
const helperError=require('../server_common/constant/error/controller/helperError.js')
const mongoError=require('../server_common/constant/error/mongo/mongoError.js')
const redisError=require('../server_common/constant/error/redis/redisError.js')
const assistError=require('../server_common/constant/error/assistError.js')
const maintainError=require('../server_common/constant/error/maintainError.js')
const securityError=require('../server_common/constant/error/securityError.js')
const systemError=require('../server_common/constant/error/systemError.js')
const validateError=require('../server_common/constant/error/validateError.js')
const regex=require('../server_common/constant/regex/regex.js')
const controllerChecker=require('../server_common/controller/controllerChecker.js')
const controllerPreCheck=require('../server_common/controller/controllerPreCheck.js')
const dataConvert=require('../server_common/controller/dataConvert.js')
const resourceCheck=require('../server_common/controller/resourceCheck.js')
const controllerInputValueLogicCheck=require('../server_common/controller/controllerInputValueLogicCheck.js')
const controllerHelper=require('../server_common/controller/controllerHelper.js')
const array=require('../server_common/function/assist/array.js')
const awesomeCaptcha=require('../server_common/function/assist/awesomeCaptcha.js')
const checkRobot=require('../server_common/function/assist/checkRobot.js')
const crypt=require('../server_common/function/assist/crypt.js')
const file=require('../server_common/function/assist/file.js')
const gmImage=require('../server_common/function/assist/gmImage.js')
const misc=require('../server_common/function/assist/misc.js')
const not_used_cookieSession=require('../server_common/function/assist/not_used_cookieSession.js')
const pagination=require('../server_common/function/assist/pagination.js')
const sanityHtml=require('../server_common/function/assist/sanityHtml.js')
const session=require('../server_common/function/assist/session.js')
const string=require('../server_common/function/assist/string.js')
const system=require('../server_common/function/assist/system.js')
const upload=require('../server_common/function/assist/upload.js')
const interval=require('../server_common/function/security/interval.js')
const supervisor=require('../server_common/function/supervisor/supervisor.js')
const validateFormat=require('../server_common/function/validateInput/validateFormat.js')
const validateHelper=require('../server_common/function/validateInput/validateHelper.js')
const validateSearchFormat=require('../server_common/function/validateInput/validateSearchFormat.js')
const validateValue=require('../server_common/function/validateInput/validateValue.js')
const db_operation_helper=require('../server_common/Test/db_operation_helper.js')
const generateTestData_API=require('../server_common/Test/generateTestData_API.js')
const inputRule_API_tester=require('../server_common/Test/inputRule_API_tester.js')
const misc_helper=require('../server_common/Test/misc_helper.js')
const testData=require('../server_common/Test/testData.js')
const component_function=require('../server_common/Test/component_function.js')
const API_helper=require('../server_common/Test/API_helper.js')
const redis_common_operation=require('../server_common/model/redis/operation/redis_common_operation.js')
const redis_common_script=require('../server_common/model/redis/operation/redis_common_script.js')
const testCaseEnum=require('../server_common/constant/testCaseEnum/testCaseEnum.js')
const common_operation_model=require('../server_common/model/mongo/operation/common_operation_model.js')
const common_operation_helper=require('../server_common/model/mongo/operation/common_operation_helper.js')
const common_operation_document=require('../server_common/model/mongo/operation/common_operation_document.js')
const fkConfig=require('../server_common/model/mongo/fkConfig.js')
const generateMongoEnumKeyValueExchange=require('../server_common/maintain/generateFunction/generateMongoEnumKeyValueExchange.js')
const genLuaSHA=require('../server_common/maintain/genLuaSHA.js')

module.exports={
    globalConfiguration,
    appSetting,
    calcResourceConfig,
    not_used_calcResourceConfig,
    collEnum,
    inputDataRuleType,
    mongoEnum,
    nodeEnum,
    not_used_compoundUniqueField,
    nodeRuntimeEnum,
    helperError,
    mongoError,
    redisError,
    assistError,
    maintainError,
    securityError,
    systemError,
    validateError,
    regex,
    controllerChecker,
    controllerPreCheck,
    dataConvert,
    resourceCheck,
    controllerInputValueLogicCheck,
    controllerHelper,
    array,
    awesomeCaptcha,
    checkRobot,
    crypt,
    file,
    gmImage,
    misc,
    not_used_cookieSession,
    pagination,
    sanityHtml,
    session,
    string,
    system,
    upload,
    interval,
    supervisor,
    validateFormat,
    validateHelper,
    validateSearchFormat,
    validateValue,
    db_operation_helper,
    generateTestData_API,
    inputRule_API_tester,
    misc_helper,
    testData,
    component_function,
    API_helper,
    redis_common_operation,
    redis_common_script,
    testCaseEnum,
    common_operation_model,
    common_operation_helper,
    common_operation_document,
    fkConfig,
    generateMongoEnumKeyValueExchange,
    genLuaSHA,
}