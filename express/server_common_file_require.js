/*    gene by H:\ss_vue_express\server_common\function\assist\misc.js     */ 
 
"use strict"

const appSetting=require('../server_common/constant/config/appSetting.js')
const globalConfiguration=require('../server_common/constant/config/globalConfiguration.js')
const nodeDefine=require('../server_common/constant/define/nodeDefine.js')
const collEnum=require('../server_common/constant/enum/collEnum.js')
const inputDataRuleType=require('../server_common/constant/enum/inputDataRuleType.js')
const mongoEnum=require('../server_common/constant/enum/mongoEnum.js')
const nodeEnum=require('../server_common/constant/enum/nodeEnum.js')
const nodeRuntimeEnum=require('../server_common/constant/enum/nodeRuntimeEnum.js')
const assistError=require('../server_common/constant/error/assistError.js')
const helperError=require('../server_common/constant/error/controller/helperError.js')
const mongoError=require('../server_common/constant/error/mongo/mongoError.js')
const redisError=require('../server_common/constant/error/redisError.js')
const systemError=require('../server_common/constant/error/systemError.js')
const validateError=require('../server_common/constant/error/validateError.js')
const regex=require('../server_common/constant/regex/regex.js')
const controllerHelper=require('../server_common/controller/controllerHelper.js')
const dataConvert=require('../server_common/controller/dataConvert.js')
const priorityCHeck=require('../server_common/controller/priorityCHeck.js')
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
const common_operation_model=require('../server_common/model/mongo/operation/common_operation_model.js')
const common_operation_document=require('../server_common/model/mongo/operation/common_operation_document.js')
const fkConfig=require('../server_common/model/mongo/fkConfig.js')
const generateMongoEnumKeyValueExchange=require('../server_common/maintain/generateFunction/generateMongoEnumKeyValueExchange.js')

module.exports={
    appSetting,
    globalConfiguration,
    nodeDefine,
    collEnum,
    inputDataRuleType,
    mongoEnum,
    nodeEnum,
    nodeRuntimeEnum,
    assistError,
    helperError,
    mongoError,
    redisError,
    systemError,
    validateError,
    regex,
    controllerHelper,
    dataConvert,
    priorityCHeck,
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
    common_operation_model,
    common_operation_document,
    fkConfig,
    generateMongoEnumKeyValueExchange,
}