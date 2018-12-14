/*    gene by D:\U\ss_vue_express\server_common\function\assist\file.js     */ 
 
"use strict"

const appSetting=require('../server_common/constant/config/appSetting.js')
const globalConfiguration=require('../server_common/constant/config/globalConfiguration.js')
const profileConfiguration=require('../server_common/constant/config/profileConfiguration.js')
const collEnum=require('../server_common/constant/enum/collEnum.js')
const inputDataRuleType=require('../server_common/constant/enum/inputDataRuleType.js')
const mongoEnum=require('../server_common/constant/enum/mongoEnum.js')
const nodeEnum=require('../server_common/constant/enum/nodeEnum.js')
const nodeRuntimeEnum=require('../server_common/constant/enum/nodeRuntimeEnum.js')
const assistError=require('../server_common/constant/error/assistError.js')
const helperError=require('../server_common/constant/error/controller/helperError.js')
const maintainError=require('../server_common/constant/error/maintainError.js')
const mongoError=require('../server_common/constant/error/mongo/mongoError.js')
const redisError=require('../server_common/constant/error/redis/redisError.js')
const validateError=require('../server_common/constant/error/validateError.js')
const regex=require('../server_common/constant/regex/regex.js')
const controllerChecker=require('../server_common/controller/controllerChecker.js')
const controllerHelper=require('../server_common/controller/controllerHelper.js')
const controllerInputValueLogicCheck=require('../server_common/controller/controllerInputValueLogicCheck.js')
const controllerPreCheck=require('../server_common/controller/controllerPreCheck.js')
const dataConvert=require('../server_common/controller/dataConvert.js')
const fileResourceCalc=require('../server_common/controller/fileResourceCalc.js')
const numOnlyResourceCalc=require('../server_common/controller/numOnlyResourceCalc.js')
const resourceCheck=require('../server_common/controller/resourceCheck.js')
const array=require('../server_common/function/assist/array.js')
const awesomeCaptcha=require('../server_common/function/assist/awesomeCaptcha.js')
const checkRobot=require('../server_common/function/assist/checkRobot.js')
const crypt=require('../server_common/function/assist/crypt.js')
const dataType=require('../server_common/function/assist/dataType.js')
const file=require('../server_common/function/assist/file.js')
const gmImage=require('../server_common/function/assist/gmImage.js')
const misc=require('../server_common/function/assist/misc.js')
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
const validatePartObjectIdEncrypted=require('../server_common/function/validateInput/validatePartObjectIdEncrypted.js')
const validateSearchFormat=require('../server_common/function/validateInput/validateSearchFormat.js')
const validateValue=require('../server_common/function/validateInput/validateValue.js')
const common_API=require('../server_common/Test/API/common_API.js')
const add_friend_API=require('../server_common/Test/API/express/add_friend_API.js')
const article_API=require('../server_common/Test/API/express/article_API.js')
const folder_API=require('../server_common/Test/API/express/folder_API.js')
const friend_group_API=require('../server_common/Test/API/express/friend_group_API.js')
const impeachAction_API=require('../server_common/Test/API/express/impeachAction_API.js')
const impeachComment_API=require('../server_common/Test/API/express/impeachComment_API.js')
const impeach_and_comment_API_backup=require('../server_common/Test/API/express/impeach_and_comment_API_backup.js')
const impeach_API=require('../server_common/Test/API/express/impeach_API.js')
const joinPublicGroupRequest_API=require('../server_common/Test/API/express/joinPublicGroupRequest_API.js')
const penalize_API=require('../server_common/Test/API/express/penalize_API.js')
const publicGroup_API=require('../server_common/Test/API/express/publicGroup_API.js')
const recommend_API=require('../server_common/Test/API/express/recommend_API.js')
const user_API=require('../server_common/Test/API/express/user_API.js')
const admin_user_API=require('../server_common/Test/API/express_admin/admin_user_API.js')
const API_helper=require('../server_common/Test/API_helper.js')
const class_user=require('../server_common/Test/class/class_user.js')
const article_component_function=require('../server_common/Test/component_function/express/article_component_function.js')
const user_component_function=require('../server_common/Test/component_function/express/user_component_function.js')
const admin_user_component_function=require('../server_common/Test/component_function/express_admin/admin_user_component_function.js')
const component_function=require('../server_common/Test/component_function.js')
const db_operation_helper=require('../server_common/Test/db_operation_helper.js')
const generateTestData=require('../server_common/Test/generateTestData.js')
const generateTestData_API=require('../server_common/Test/generateTestData_API.js')
const inputRule_API_tester=require('../server_common/Test/inputRule_API_tester.js')
const misc_helper=require('../server_common/Test/misc_helper.js')
const testData=require('../server_common/Test/testData.js')
const redis_common_operation=require('../server_common/model/redis/operation/redis_common_operation.js')
const redis_common_script=require('../server_common/model/redis/operation/redis_common_script.js')
const testCaseEnum=require('../server_common/constant/testCaseEnum/testCaseEnum.js')
const common_operation_model=require('../server_common/model/mongo/operation/common_operation_model.js')
const common_operation_document=require('../server_common/model/mongo/operation/common_operation_document.js')
const compound_unique_field_config=require('../server_common/model/mongo/compound_unique_field_config.js')
const fkConfig=require('../server_common/model/mongo/fkConfig.js')
const generateMongoEnumKeyValueExchange=require('../server_common/maintain/generateFunction/generateMongoEnumKeyValueExchange.js')
const genLuaSHA=require('../server_common/maintain/genLuaSHA.js')

module.exports={
    appSetting,
    globalConfiguration,
    profileConfiguration,
    collEnum,
    inputDataRuleType,
    mongoEnum,
    nodeEnum,
    nodeRuntimeEnum,
    assistError,
    helperError,
    maintainError,
    mongoError,
    redisError,
    validateError,
    regex,
    controllerChecker,
    controllerHelper,
    controllerInputValueLogicCheck,
    controllerPreCheck,
    dataConvert,
    fileResourceCalc,
    numOnlyResourceCalc,
    resourceCheck,
    array,
    awesomeCaptcha,
    checkRobot,
    crypt,
    dataType,
    file,
    gmImage,
    misc,
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
    validatePartObjectIdEncrypted,
    validateSearchFormat,
    validateValue,
    common_API,
    add_friend_API,
    article_API,
    folder_API,
    friend_group_API,
    impeachAction_API,
    impeachComment_API,
    impeach_and_comment_API_backup,
    impeach_API,
    joinPublicGroupRequest_API,
    penalize_API,
    publicGroup_API,
    recommend_API,
    user_API,
    admin_user_API,
    API_helper,
    class_user,
    article_component_function,
    user_component_function,
    admin_user_component_function,
    component_function,
    db_operation_helper,
    generateTestData,
    generateTestData_API,
    inputRule_API_tester,
    misc_helper,
    testData,
    redis_common_operation,
    redis_common_script,
    testCaseEnum,
    common_operation_model,
    common_operation_document,
    compound_unique_field_config,
    fkConfig,
    generateMongoEnumKeyValueExchange,
    genLuaSHA,
}