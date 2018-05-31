/**
 * Created by ada on 2017/9/22.
 * 所有执行  是否  功能的函数的集合
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const mime=require(`mime`)

/**************  本文件相关常量  ****************/
const helperError=require('../constant/error/controller/helperError').helper
const checkerError=require('../constant/error/controller/helperError').checker

/***************  数据库相关常量以及函数   ****************/
const e_dbModel=require('../constant/genEnum/dbModel')
const common_operation_model=require('../model/mongo/operation/common_operation_model')
const common_operation_helper=require('../model/mongo/operation/common_operation_helper')

const redisClient=require('../model/redis/common/redis_connections').redisClient


/****************  公共常量 ********************/
const e_chineseName=require('../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_serverRuleType=require('../constant/enum/inputDataRuleType').ServerRuleType
const e_otherRuleFiledName=require('../constant/enum/inputDataRuleType').OtherRuleFiledName
const e_field=require('../constant/genEnum/DB_field').Field
const e_adminPriorityType=require('../constant/enum/mongoEnum').AdminPriorityType.DB
const e_allUserType=require('../constant/enum/mongoEnum').AllUserType.DB
const e_penalizeSubType=require('../constant/enum/mongoEnum').PenalizeSubType.DB

const e_userInfoField=require(`../constant/enum/nodeRuntimeEnum`).UserInfoField
const e_subField=require(`../constant/enum/nodeEnum`).SubField
const e_part=require(`../constant/enum/nodeEnum`).ValidatePart

const allAdminPriorityType=require('../constant/genEnum/enumValue').AdminPriorityType

const e_uniqueField=require('../constant/genEnum/DB_uniqueField').UniqueField
const compound_unique_field_config=require(`../model/mongo/compound_unique_field_config`).compound_unique_field_config
const fkConfig=require('../model/mongo/fkConfig').fkConfig

const e_dataType=require('../constant/enum/inputDataRuleType').ServerDataType
/****************  公共函数  ********************/
const misc=require('../function/assist/misc')
const arr=require('../function/assist/array')
const dataTypeCheck=require('../function/validateInput/validateHelper').dataTypeCheck
/*************** 配置信息 *********************/
const appSetting=require('../constant/config/appSetting').currentAppSetting


/****************  其他  ********************/
const inputRule=require('../constant/inputRule/inputRule').inputRule
// const browserInputRule=require('../constant/inputRule/browserInputRule').browserInputRule

const regex=require('../constant/regex/regex').regex
/*************************************************************************/
/**********************    not used         ******************************/
/*************************************************************************/
/*/!*              create或者update传入的docValue，其中是unique的字段，其值是否已经存在Coll（复合字段的unique无法检测，只能通过mongoose检测）
*   @dbModel:对那个coll进行检查
*   @docValue：待检查的值
*   @collUniqueFields：coll中，是unique的字段名集合
*
* *!/
async function ifDocValueContainDuplicateFieldValue_async({dbModel,docValue,collUniqueFields}){
    let condition = {}
    condition[fieldName]=fieldValue
    // console.log(`condition ${JSON.stringify(condition)}`)

    // console.log(`fieldName:${fieldName}----fieldValue ${fieldValue}`)
    let uniqueCheckResult = await common_operation_model.find_returnRecords_async({dbModel: dbModel, condition: condition})

    /!*    if (uniqueCheckResult.rc > 0) {
     return Promise.reject(uniqueCheckResult)
     }*!/

    return Promise.resolve({rc:0,msg:uniqueCheckResult.length>0})
    // }
}*/

/*          对单个字段进行外键值是否存
 *   某些情况下，外键字段需要和其他字段的值组合，才能决定外键对应到哪个coll（而不是使用fkConfig），所以才有此函数
 *
 * */
async function ifSingleFieldFkValueExist_async({fkFieldValue,relatedCollName,fkFieldChineseName}){
    if(undefined!==fkFieldValue && null!==fkFieldValue){
        let tmpResult=await  common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[relatedCollName],id:fkFieldValue})
        if(null===tmpResult){
            // let chineseName=collFieldChineseName[singleFkFieldName]
            // let fieldInputValue=docValue[singleFkFieldName]
            return Promise.reject(helperError.fkValueNotExist(fkFieldChineseName,fkFieldValue))
            // return Promise.resolve({rc:0,msg:false})
        }
    }
    // let fkFieldValueInObjectId=docValue[singleFkFieldName]
    // let fkFieldRelatedColl=collFkConfig[singleFkFieldName]['relatedColl']
// console.log(`ifFkValueExist_async===>fkFieldRelatedColl===>${fkFieldRelatedColl}, id=====>${fkFieldValueInObjectId}`)


    return Promise.resolve({rc:0,msg:true})
}

/*************************************************************************/
/**********************    used         ******************************/
/*************************************************************************/
/*      检测外键是否存在
 * @docValue；待检测的记录
 * @collFkConfig:当前coll对应的fk配置，用来查找field的fk关系（对应到哪个coll）
 * @collFieldChineseName:如果外键不存在，报错是需要指明的字段的chineseName
 *
 * return：存在: {rc:0}   不存在：helperError.fkValueNotExist
 * */
async function ifFkValueExist_async({docValue,collFkConfig,collFieldChineseName}){
    // console.log(`collFkConfig fields========>${JSON.stringify(Object.keys(collFkConfig))}`)
    // if(undefined!==collFkConfig){
    //console.log(`collFkConfig fields========>${JSON.stringify(Object.keys(collFkConfig))}`)
    // console.log(`docValue ========>${JSON.stringify(docValue)}`)
    for(let singleFkFieldName in collFkConfig){
        // console.log(`singleFkFieldName=======>${singleFkFieldName}`)
        // ap.print('docValue',docValue)
        // console.log(`docValue[singleFkFieldName]===============>${JSON.stringify(docValue[singleFkFieldName])}`)
        //外键值不空，才进行是否存在的检测
        if(undefined!==docValue[singleFkFieldName]){
            let fkFieldValueInObjectId=docValue[singleFkFieldName]
            let fkFieldRelatedColl=collFkConfig[singleFkFieldName]['relatedColl']
// console.log(`ifFkValueExist_async===>fkFieldRelatedColl===>${fkFieldRelatedColl}, id=====>${fkFieldValueInObjectId}`)
            let tmpResult
            //如果查询外键是否存在，需要额外的条件，需要使用find
            if(undefined===collFkConfig[singleFkFieldName][`validCriteria`]){
                tmpResult=await  common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[fkFieldRelatedColl],id:fkFieldValueInObjectId})
            }else{
                collFkConfig[singleFkFieldName][`validCriteria`]['_id']=fkFieldValueInObjectId
                tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[fkFieldRelatedColl],condition:collFkConfig[singleFkFieldName][`validCriteria`]})
            }
            // console.log(`collFkConfig =========>${JSON.stringify(collFkConfig)}`)
            // console.log(`collFkConfig[singleFkFieldName]['validCriteria'] =========>${JSON.stringify(collFkConfig[singleFkFieldName]['validCriteria'])}`)
            // console.log(`fk value exit check =========>${JSON.stringify(tmpResult)}`)
            if(null===tmpResult || tmpResult.length===0){
                let chineseName=collFieldChineseName[singleFkFieldName]
                let fieldInputValue=docValue[singleFkFieldName]
                return Promise.reject(helperError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist(chineseName,fieldInputValue))
                // return Promise.resolve({rc:0,msg:false})
            }
            /*            else{
             return Promise.resolve({rc:0,msg:true})
             }*/

        }
    }
    // }

    return Promise.resolve({rc:0,msg:true})
}



/*/!*          当前资源使用量（currentResourceUsage），是否已经超出资源定义（currentResourceProfile），超出返回错误（error）
 * @currentResourceUsage: 获得当前resourceProfileRange（PER_PERSON/IMPEACH/ARTICLE）已经使用的资源信息，size和path
 *               {totalSizeInMb:xxxx, totalFileNum: yyyyy}
 * @currentResourceProfile： 当前需要比较的profile
 * @error;   如果size或者number超出，对应的error
 *               {sizeExceed: size超出对应的error,numberExceed：数量超出的error }
 * *!/
async function ifResourceStillValid_async({currentResourceUsage,currentResourceProfile,error}) {
    //进行比较
    if (currentResourceUsage.totalSizeInMb > currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]) {
        return Promise.reject(error.sizeExceed)
    }
    if (currentResourceUsage.totalFileNum > currentResourceProfile[e_field.RESOURCE_PROFILE.MAX_FILE_NUM]) {
        return Promise.reject(error.numberExceed)
    }

    return Promise.resolve(true)

}

/!*          当前资源使用量（currentResourceUsage）+新文件（fileInfo），是否已经超出资源定义（currentResourceProfile），超出返回错误（error）
 * @currentResourceUsage: 获得当前resourceProfileRange（PER_PERSON/IMPEACH/ARTICLE）已经使用的资源信息，size和path
 *               {totalSizeInMb:xxxx, totalFileNum: yyyyy}
 * @currentResourceProfile： 当前需要比较的profile
 * @fileInfo： {size:, path:}
 * @error;   如果size或者number超出，对应的error
 *               {sizeExceed: size超出对应的error,numberExceed：数量超出的error }
 * *!/
async function ifNewFileLeadExceed_async({currentResourceUsage,currentResourceProfile,fileInfo,error}){
    /!*    let currentResourceProfile //根据resourceProfileRange和userId，选中的资源配置记录
     //查找resource配置文件
     let tmpResult = await chooseLastValidResourceProfile_async({resourceProfileRange: resourceProfileRange, userId: userId})
     // console.log(`chosed profile========>${JSON.stringify(tmpResult.msg)}`)
     //有资源配置文件，才进行检查
     if(undefined!==tmpResult.msg){

     currentResourceProfile=misc.objectDeepCopy(tmpResult.msg)
     }*!/
    // console.log(`currentResourceProfile =====>${JSON.stringify(currentResourceProfile)}`)
    // console.log(`currentResourceUsage =====>${JSON.stringify(currentResourceUsage)}`)
    /!*    currentResourceUsage.totalSizeInMb += tmpResult['totalImageSizeInMb']
     currentResourceUsage.totalFileNum += tmpResult['totalFileNum']*!/

    // console.log(`fileInfo.size=========>${fileInfo.size}`)
    // console.log(`currentResourceUsage.totalSizeInMb=========>${currentResourceUsage.totalSizeInMb}`)
    // console.log(`profile size===========>${currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]}`)
    //进行比较
    if (fileInfo.size + currentResourceUsage.totalSizeInMb > currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]) {

        fs.unlink(fileInfo.path)
        return Promise.reject(error.sizeExceed)
    }
    if (1 + currentResourceUsage.totalFileNum > currentResourceProfile[e_field.RESOURCE_PROFILE.MAX_FILE_NUM]) {
        fs.unlink(fileInfo.path)
        return Promise.reject(error.numberExceed)
    }

    return Promise.resolve(true)
}*/



/*/!*  判断adminUser是否拥有指定权限
*
* @userId: 要检测的adminUser的id
* @arr_expectedPriority: 数组。要检测的权限
* return: boolean
* *!/
async function ifAdminUserHasExpectedPriority({userId,arr_expectedPriority}){
    if(undefined===arr_expectedPriority || 0===arr_expectedPriority.length){
        return Promise.reject(checkerError.adminUserPriorityCantBeEmpty)
    }
    if(undefined===userId){
        return Promise.reject(checkerError.adminUserCantBeEmpty)
    }
    // console.log(`userId==>${JSON.stringify(userId)}`)
    let tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.admin_user,id:userId})
    // console.log(`tmoResult==>${JSON.stringify(tmpResult)}`)
    if(null===tmpResult){
        return Promise.reject(checkerError.adminUserCantBeEmpty)
    }

    let arr_actualPriority=tmpResult[e_field.ADMIN_USER.USER_PRIORITY]
    for(let singleExpectedPriority of arr_expectedPriority){
        if(-1===arr_actualPriority.indexOf(singleExpectedPriority.toString())){
            return Promise.resolve(false)
        }
    }
    return Promise.resolve(true)
}*/


/*  判断adminUser是否拥有指定权限
* @userPriority：存储在session中的权限
* @arr_expectedPriority: 期望的权限
* */
async function ifAdminUserHasExpectedPriority_async({userPriority,arr_expectedPriority}){
    for(let singleExpectedPriority of arr_expectedPriority){
        if(-1===userPriority.indexOf(singleExpectedPriority.toString())){
            return Promise.resolve(false)
        }
    }
    return Promise.resolve(true)
}
//判断当前用户的类型是否为期望的
async function ifExpectedUserType_async({currentUserType,arr_expectedUserType}){
/*    if(undefined===req.session.userInfo || undefined===req.session.userInfo[e_userInfoField.USER_TYPE]){
        return Promise.reject(checkerError.userInfoUndefined)
    }

    let currentUserType=req.session.userInfo[e_userInfoField.USER_TYPE]*/
// ap.inf('currentUserType',currentUserType)
//     ap.inf('arr_expectedUserType',arr_expectedUserType)
    if(-1===arr_expectedUserType.indexOf(currentUserType)){
        return Promise.reject(checkerError.userTypeNotExpected)
    }

    return Promise.resolve(true)
}

/*用户(userId)是否被禁止做某事（penalizeType）
 * 查找admin_penalize中最后一条penalize记录，体重的ifExpire是否为true
 *
 * */
async function ifPenalizeOngoing_async({userId, penalizeType,penalizeSubType}){
    let condition={
        // "$or":[{'dDate':{'$exists':false}},{'isExpire':false}],
        "$or":[{[e_field.ADMIN_PENALIZE.DURATION]:0},{'endDate':{'$gt':Date.now()}}],
        //未被删除，同时也未到期或者duration=0（永久未到期），才能视为valid的penalize
        'dDate':{'$exists':false},
        // [e_field.ADMIN_PENALIZE.END_DATE]:{'$lt':Date.now()},
        [e_field.ADMIN_PENALIZE.PUNISHED_ID]:userId,
        [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:penalizeType,
        [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:{'$in':[penalizeSubType,e_penalizeSubType.ALL]}, //ALL可以覆盖任何
    }//,,
    // ap.print('penalize condition',condition)
    let activePenalizeRecords=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_penalize,condition:condition,selectedFields:'-uDate'})
    // console.log(`activePenalizeRecords===========>${JSON.stringify(activePenalizeRecords)}`)
    // ap.print('activePenalizeRecords',activePenalizeRecords)
    if(activePenalizeRecords.length>0){
        return Promise.resolve(true)
    }else{
        return Promise.resolve(false)
    }

}

/*  指定的用户是否为当前record的拥有者（创建者），被删除的记录不检查。 一般用在delete操作上
* ownerFieldName:判断是否为recordId 拥有者（创建者）的字段
* ownerFieldValue：ownerFieldName对应的值
* additionalCondition: 判断的额外条件。一般是{'dDate':{$exists:false}}
*
* return: 如果recordId对应的记录的拥有者（创建者）当前用户，返回record，以便后续做field value是否变更的比较；否则返回false
* */
async function ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({dbModel,recordId,ownerFieldsName, userId,additionalCondition}){
    // ap.inf('ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async in')
    let tmpResult,condition
    //当前用户必须是impeach的创建人
    condition={
        // [ownerFieldName]:userId,
        '_id':recordId,
        'dDate':{$exists:false},//未被删除的记录
    }
    for(let singleFieldName of ownerFieldsName){
        condition[singleFieldName]=userId
    }
    if(undefined!==additionalCondition){
        Object.assign(condition,additionalCondition)
    }
    // ap.inf('condition',condition)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:dbModel,condition:condition})
    // ap.inf('result',tmpResult)
    if(tmpResult.length===1){
        return Promise.resolve(tmpResult[0])
    }else{
        return Promise.resolve(false)
    }

}

/*                          logic   check                   */
//当前普通用户是否为impeach的创建人
async function ifCurrentUserCreatorOfImpeach_async({userId, impeachId}){
    let tmpResult
    //当前用户必须是impeach的创建人
    tmpResult=await  common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId,selectedFields:`${[e_field.IMPEACH.CREATOR_ID]}`})
//理论上不会出现null，因为之前已经fk check，此处只是为了万一
/*    if(null===tmpResult){
        return Promise.reject(controllerError.impeachNotExistCantCreateComment)
    }*/
    if(tmpResult[e_field.IMPEACH.CREATOR_ID].toString()!==userId){
        return Promise.resolve(false)
    }
    return Promise.resolve(true)
}

/*      根据文件的后缀名和上传文件的content/type，判断是否一致，为之后的判断文件是否可以上传做准备
        ===============            这种判断方法并不保险，因为header也可能被伪造            ===============
* uploadFileResult: 上传文件后返回的信息，如下
*  {
        "fieldName": "file",
        "originalFilename": "config_rrh.txt",
         "path": "D:\\IBeA1IEaGEgODfxlT7YIQB7I.txt",
         "headers": {
             "content-disposition": "form-data; name=\"file\"; filename=\"config_rrh.txt\"",
            "content-type": "text/plain"
         },
        "size": 325
 }
*
* return : suffix/false
* */
async function ifFileSuffixMatchContentType_returnSuffixOrFalse_async({uploadFileResult}){
    let originalFilename=uploadFileResult[`originalFilename`]
    let contentType=uploadFileResult[`headers`][`content-type`]

    //检查后缀名是否存在
    let tmp=originalFilename.split('.')
    if(tmp.length<2){
        return Promise.reject(helperError.uploadFileHasNoSuffix)
    }
    let suffix=tmp.pop()

    //根据content-type获得对应的后缀
    let matchedSuffix=mime.extension(contentType)
    if(-1===matchedSuffix.indexOf(suffix)){
        return Promise.resolve(false)
    }else{
        return Promise.resolve(suffix)
    }
}

/*//解密后的objectId（一般在get/delete/update中的recordId）是否合格
async function ifDecryptedObjectIdValid({objectId}){
    if()
}*/

/*  检查用户req是否合格（防止DoS）。默认使用复杂方式检测
* @reqTypePrefix:用于生成key的前缀，格式为sessionId.reqTypePrefix;keyname。为constant/config/globalConfiguration下intervalCheckConfiguration的一个键值
* */
/*async function checkInterval_async({req,reqTypePrefix}){
    let configuration=intervalCheckConfiguration[reqTypePrefix]
    let userIdentity=await misc.getIdentify_async({req})
    for (let singlePrefix of userIdentity){
        let prefix=`${singlePrefix}.${reqTypePrefix}`
        //redisClient无所谓使用哪个，lua脚本中会自动选择db1
        // ap.inf('checkInterval_async start')
        // ap.inf('prefix',prefix)
        let result=await complicatedCheckInterval_async({rejectFlagName:`${prefix}:rejectFlag`,rejectTimesName:`${prefix}:rejectTimes`,keyNameToStoreReqList:`${prefix}:reqList`,intervalCheckConfiguration:configuration['simpleCheckParams'],argv_configuration:configuration['rejectCheckParams'],redisClient:redisClient})
        // ap.inf('checkInterval_async done')
        if(0!==result){
            return Promise.reject(checkerError.rejectReq(result))
        }
    }

    return Promise.resolve({rc:0})
}*/

function ifObjectIdCrypted({objectId}){
    return regex.cryptedObjectId.test(objectId)
}
/********************************************************************/
/**      使用在dispatch中，检查加密的objectId的格式是否正确       ****/
/********************************************************************/
async function ifObjectIdInPartCrypted_async({req,expectedPart,browserCollRule}){
    //目前只需要检测recordId/RecordInfo/singleField中的objectId
    for(let singlePart of expectedPart){
        //非空，才进行格式检查，否则扔给后续代码处理
        // ap.inf('singlePart',singlePart)
        // ap.inf('req.body.values[singlePart]',req.body.values[singlePart])
        if(true===dataTypeCheck.isSetValue(req.body.values[singlePart])){
            let partValue=req.body.values[singlePart]
            switch (singlePart){
                case e_part.RECORD_ID:

                        if(false===ifObjectIdCrypted({objectId:partValue})){
                            return Promise.reject(checkerError.ifObjectIdCrypted.recordIdFormatWrong)
                        }

                    break;
                case e_part.SINGLE_FIELD:
                    //获得field的名称
                    // ap.inf('partValue',partValue)
                    let fieldName=Object.keys(partValue)[0]
                    // ap.inf('fieldName',fieldName)
                    // ap.inf('dataTypeCheck.isSetValue(fieldName)',dataTypeCheck.isSetValue(fieldName))

                    //fieldName是有效的（在rule中有定义）
                    if(true===dataTypeCheck.isSetValue(partValue[fieldName]) && undefined!==browserCollRule[fieldName]){
                        // let singleFieldValue=req.body.values[singlePart]
                        //获得field的类型
                        let fieldDataTypeInRule=browserCollRule[fieldName][e_otherRuleFiledName.DATA_TYPE]
                        let dataTypeArrayFlag=dataTypeCheck.isArray(fieldDataTypeInRule)
                        let dataType= dataTypeArrayFlag ? fieldDataTypeInRule[0]:fieldDataTypeInRule
                        //字段类型是objectId
                        if(e_dataType.OBJECT_ID===dataType){
                            //数组，对每个元素进行判别
                            if(true===dataTypeArrayFlag){
                                if(true===dataTypeCheck.isArray(partValue[fieldName]) && partValue[fieldName].length>0){
                                    for(let singleEle of partValue[fieldName]){
                                        if(false===ifObjectIdCrypted({objectId:singleEle})){
                                            return Promise.reject(checkerError.ifObjectIdCrypted.singleFieldValueContainInvalidObjectId)
                                        }
                                    }
                                }
                            }else{
                                if(false===ifObjectIdCrypted({objectId:partValue[fieldName]})){
                                    return Promise.reject(checkerError.ifObjectIdCrypted.singleFieldValueContainInvalidObjectId)
                                }
                            }
                        }
                    }

                    break;
                case e_part.RECORD_INFO:
                    //非空，才进行格式检查，否则扔给后续代码处理

                    //对每个字段进行判别，类型是否为objectId，是的话，格式判断
                    // let recordInfoValue=req.body.values[singlePart]
                    for(let singleFieldName in partValue){
                        // ap.inf('singleFieldName',singleFieldName)
                        // ap.inf('partValue',partValue)
                        // ap.inf('partValue[singleFieldName]',partValue[singleFieldName])
                        //字段有对应的rule
                        if(undefined!==browserCollRule[singleFieldName] ){
                            //字段值不为空（空值交给后续代码处理，而不在解密代码中处理）
                            // ap.inf('partValue[singleFieldName]',partValue[singleFieldName])
                            if(true===dataTypeCheck.isSetValue(partValue[singleFieldName])){
                                // ap.inf('partValue[singleFieldName]',partValue[singleFieldName])
                                let singleFieldDataTypeInRule=browserCollRule[singleFieldName][e_otherRuleFiledName.DATA_TYPE]
                                let dataTypeArrayFlag=dataTypeCheck.isArray(singleFieldDataTypeInRule)
                                let dataType= dataTypeArrayFlag ? singleFieldDataTypeInRule[0]:singleFieldDataTypeInRule
                                // ap.inf('dataType',dataType)
                                //字段类型是objectId
                                if(e_dataType.OBJECT_ID===dataType){
                                    //数组，对每个元素进行判别
                                    if(true===dataTypeArrayFlag){
                                        if(true===dataTypeCheck.isArray(partValue[singleFieldName]) &&  partValue[singleFieldName].length>0){
                                            for(let singleEle of partValue[singleFieldName]){
                                                if(false===ifObjectIdCrypted({objectId:singleEle})){
                                                    return Promise.reject(checkerError.ifObjectIdCrypted.recordInfoContainInvalidObjectId)
                                                }
                                            }
                                        }
                                    }else{
                                        if(false===ifObjectIdCrypted({objectId:partValue[singleFieldName]})){
                                            return Promise.reject(checkerError.ifObjectIdCrypted.recordInfoContainInvalidObjectId)
                                        }
                                    }
                                }
                            }

                        }

                    }

                    break
                default:
                    break
            }
        }

    }
    return Promise.resolve(true)
}

/**     对get中的id 进行检测（是否加密）   ***/
function ifObjectIdInGetCrypted({objectId}){
    if(false===ifObjectIdCrypted({objectId:objectId})){
        return Promise.reject(checkerError.ifObjectIdInGetCrypted.cryptedObjectIdInvalid)
    }
}




module.exports= {
    // ifFieldValueExistInColl_async,// 检测字段值是否已经在db中存在
    ifSingleFieldFkValueExist_async, //根据coll中的2个字段（外键和外键对应coll），动态确定外键是否在指定的coll中存在
    ifFkValueExist_async,//外键定义固定（外键在那个coll中固定）


    // ifResourceStillValid_async, //直接计算（db）中已有的resource是否超出profile的定义
    // ifNewFileLeadExceed_async,  //db中已有resource+上传文件，是否超出profile定义


    ifAdminUserHasExpectedPriority_async,

    ifExpectedUserType_async,//判断当前用户的类型是否为期望的

    ifPenalizeOngoing_async,



    ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async,

    /*              logic check         */
    ifCurrentUserCreatorOfImpeach_async,

    ifFileSuffixMatchContentType_returnSuffixOrFalse_async,

    ifObjectIdCrypted,
    ifObjectIdInPartCrypted_async,
    ifObjectIdInGetCrypted,
    // checkInterval_async,
}