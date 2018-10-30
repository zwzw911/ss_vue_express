/*    gene by H:\ss_vue_express\server_common\function\assist\file.js     */ 
 
"use strict"

const globalConfiguration=require('../server_common/constant/config/globalConfiguration.js')
const appSetting=require('../server_common/constant/config/appSetting.js')
const collEnum=require('../server_common/constant/enum/collEnum.js')
const inputDataRuleType=require('../server_common/constant/enum/inputDataRuleType.js')
const nodeRuntimeEnum=require('../server_common/constant/enum/nodeRuntimeEnum.js')
const nodeEnum=require('../server_common/constant/enum/nodeEnum.js')
const mongoEnum=require('../server_common/constant/enum/mongoEnum.js')
const helperError=require('../server_common/constant/error/controller/helperError.js')
const mongoError=require('../server_common/constant/error/mongo/mongoError.js')
const redisError=require('../server_common/constant/error/redis/redisError.js')
const assistError=require('../server_common/constant/error/assistError.js')
const maintainError=require('../server_common/constant/error/maintainError.js')
const securityError=require('../server_common/constant/error/securityError.js')
const validateError=require('../server_common/constant/error/validateError.js')
const systemError=require('../server_common/constant/error/systemError.js')
const regex=require('../server_common/constant/regex/regex.js')
const controllerChecker=require('../server_common/controller/controllerChecker.js')
const controllerHelper=require('../server_common/controller/controllerHelper.js')
const controllerInputValueLogicCheck=require('../server_common/controller/controllerInputValueLogicCheck.js')
const controllerPreCheck=require('../server_common/controller/controllerPreCheck.js')
const resourceCheck=require('../server_common/controller/resourceCheck.js')
const dataConvert=require('../server_common/controller/dataConvert.js')
const fileResourceCalc=require('../server_common/controller/fileResourceCalc.js')
const numOnlyResourceCalc=require('../server_common/controller/numOnlyResourceCalc.js')
const array=require('../server_common/function/assist/array.js')
const awesomeCaptcha=require('../server_common/function/assist/awesomeCaptcha.js')
const file=require('../server_common/function/assist/file.js')
const gmImage=require('../server_common/function/assist/gmImage.js')
const pagination=require('../server_common/function/assist/pagination.js')
const sanityHtml=require('../server_common/function/assist/sanityHtml.js')
const session=require('../server_common/function/assist/session.js')
const string=require('../server_common/function/assist/string.js')
const system=require('../server_common/function/assist/system.js')
const upload=require('../server_common/function/assist/upload.js')
const checkRobot=require('../server_common/function/assist/checkRobot.js')
const crypt=require('../server_common/function/assist/crypt.js')
const misc=require('../server_common/function/assist/misc.js')
const interval=require('../server_common/function/security/interval.js')
const supervisor=require('../server_common/function/supervisor/supervisor.js')
const validateSearchFormat=require('../server_common/function/validateInput/validateSearchFormat.js')
const validateHelper=require('../server_common/function/validateInput/validateHelper.js')
const validateValue=require('../server_common/function/validateInput/validateValue.js')
const validateFormat=require('../server_common/function/validateInput/validateFormat.js')
const db_operation_helper=require('../server_common/Test/db_operation_helper.js')
const testData=require('../server_common/Test/testData.js')
const generateTestData=require('../server_common/Test/generateTestData.js')
const misc_helper=require('../server_common/Test/misc_helper.js')
const friend_group_API=require('../server_common/Test/API/express/friend_group_API.js')
const user_API=require('../server_common/Test/API/express/user_API.js')
const penalize_API=require('../server_common/Test/API/express/penalize_API.js')
const folder_API=require('../server_common/Test/API/express/folder_API.js')
const add_friend_API=require('../server_common/Test/API/express/add_friend_API.js')
const article_API=require('../server_common/Test/API/express/article_API.js')
const impeachComment_API=require('../server_common/Test/API/express/impeachComment_API.js')
const impeach_API=require('../server_common/Test/API/express/impeach_API.js')
const impeach_and_comment_API_backup=require('../server_common/Test/API/express/impeach_and_comment_API_backup.js')
const impeachAction_API=require('../server_common/Test/API/express/impeachAction_API.js')
const admin_user_API=require('../server_common/Test/API/express_admin/admin_user_API.js')
const common_API=require('../server_common/Test/API/common_API.js')
const article_component_function=require('../server_common/Test/component_function/express/article_component_function.js')
const user_component_function=require('../server_common/Test/component_function/express/user_component_function.js')
const admin_user_component_function=require('../server_common/Test/component_function/express_admin/admin_user_component_function.js')
const redis_common_script=require('../server_common/model/redis/operation/redis_common_script.js')
const redis_common_operation=require('../server_common/model/redis/operation/redis_common_operation.js')
const testCaseEnum=require('../server_common/constant/testCaseEnum/testCaseEnum.js')
const common_operation_model=require('../server_common/model/mongo/operation/common_operation_model.js')
const common_operation_helper=require('../server_common/model/mongo/operation/not_used_common_operation_helper.js')
const common_operation_document=require('../server_common/model/mongo/operation/common_operation_document.js')
const compound_unique_field_config=require('../server_common/model/mongo/compound_unique_field_config.js')
const fkConfig=require('../server_common/model/mongo/fkConfig.js')
const generateMongoEnumKeyValueExchange=require('../server_common/maintain/generateFunction/generateMongoEnumKeyValueExchange.js')
const genLuaSHA=require('../server_common/maintain/genLuaSHA.js')

module.exports={
    globalConfiguration,
    appSetting,
    collEnum,
    inputDataRuleType,
    nodeRuntimeEnum,
    nodeEnum,
    mongoEnum,
    helperError,
    mongoError,
    redisError,
    assistError,
    maintainError,
    securityError,
    validateError,
    systemError,
    regex,
    controllerChecker,
    controllerHelper,
    controllerInputValueLogicCheck,
    controllerPreCheck,
    resourceCheck,
    dataConvert,
    fileResourceCalc,
    numOnlyResourceCalc,
    array,
    awesomeCaptcha,
    file,
    gmImage,
    pagination,
    sanityHtml,
    session,
    string,
    system,
    upload,
    checkRobot,
    crypt,
    misc,
    interval,
    supervisor,
    validateSearchFormat,
    validateHelper,
    validateValue,
    validateFormat,
    db_operation_helper,
    testData,
    generateTestData,
    misc_helper,
    friend_group_API,
    user_API,
    penalize_API,
    folder_API,
    add_friend_API,
    article_API,
    impeachComment_API,
    impeach_API,
    impeach_and_comment_API_backup,
    impeachAction_API,
    admin_user_API,
    common_API,
    article_component_function,
    user_component_function,
    admin_user_component_function,
    redis_common_script,
    redis_common_operation,
    testCaseEnum,
    common_operation_model,
    common_operation_helper,
    common_operation_document,
    compound_unique_field_config,
    fkConfig,
    generateMongoEnumKeyValueExchange,
    genLuaSHA,
}