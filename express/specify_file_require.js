/**
 * Created by Ada on 2017/9/3.
 *
 * 统一require server_common中文件的地方（防止每个文件再次单独require）
 */
'use strict'

/*              constant config               */
const calcResourceConfig=require('./server/constant/config/calcResourceConfig')
const globalConfiguration=require('./server/constant/config/globalConfiguration')

/*              constant error               */
const assist_checkRobotError=require('./server/constant/define/assist_checkRobotError')

/*              constant enum               */
const coll=require('./server/constant/genEnum/DB_Coll').Coll
const field=require('./server/constant/genEnum/DB_field').Field
const internalField=require('./server/constant/genEnum/DB_internal_field').Field
const uniqueField=require('./server/constant/genEnum/DB_uniqueField').UniqueField
const dbModel=require('./server/constant/genEnum/dbModel')
const dbModelInArray=require('./server/constant/genEnum/dbModelInArray')
const dbModelInArray=require('./server/constant/genEnum/dbModelInArray')

const enumNodeRuntime=require('../server_common/constant/enum/nodeRuntimeEnum')
const enumMongo=require('../server_common/constant/enum/mongoEnum')

/*              constant error               */
const controllerHelperError=require('../server_common/constant/error/controller/helperError')
const mongoError=require('../server_common/constant/error/mongo/mongoError')
const assistError=require('../server_common/constant/error/assistError')
const redisError=require('../server_common/constant/error/redisError')
const systemError=require('../server_common/constant/error/systemError')
const validateError=require('../server_common/constant/error/validateError')

const regex=require('../server_common/constant/regex/regex')

const dataConvert=require('../server_common/controller/dataConvert')
const controllerHelper=require('../server_common/controller/controllerHelper')

/*              function assist                */
const awesomeCaptcha=require('../server_common/function/assist/awesomeCaptcha')
const checkRobot=require('../server_common/function/assist/checkRobot')
const cookieSession=require('../server_common/function/assist/not_used_cookieSession')
const crypt=require('../server_common/function/assist/crypt')
const gmImage=require('../server_common/function/assist/gmImage')
const misc=require('../server_common/function/assist/misc')
const pagination=require('../server_common/function/assist/pagination')
const sanityHtml=require('../server_common/function/assist/sanityHtml')
const system=require('../server_common/function/assist/system')
const upload=require('../server_common/function/assist/upload')

/*              function validateInput                */
const validateFormat=require('../server_common/function/validateInput/validateFormat')
const validateHelper=require('../server_common/function/validateInput/validateHelper')
const validateValue=require('../server_common/function/validateInput/validateValue')

/*              model                       */
const common_operation_document=require('../server_common/model/mongo/operation/common_operation_document')
const common_operation_model=require('../server_common/model/mongo/operation/common_operation_model')



module.exports={
    calcResourceConfig,
    globalConfiguration,
    assist_checkRobotError,


}