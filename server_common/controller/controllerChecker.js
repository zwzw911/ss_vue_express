/**
 * Created by ada on 2017/9/22.
 * 所有执行  是否  功能的函数的集合
 */
'use strict'

const helperError=require('../constant/error/controller/helperError').helper

const e_dbModel=require('../constant/genEnum/dbModel')
const common_operation_model=require('../model/mongo/operation/common_operation_model')

const e_uniqueField=require('../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_serverRuleType=require('../constant/enum/inputDataRuleType').ServerRuleType
const e_field=require('../constant/genEnum/DB_field').Field
const e_adminPriorityType=require('../constant/enum/mongoEnum').AdminPriorityType.DB

const allAdminPriorityType=require('../constant/genEnum/enumValue').AdminPriorityType

const checkerError=require('../constant/error/controller/helperError').checker

const misc=require('../function/assist/misc')

async function ifRoot_async({userName:userName}){
    // let condition={[e_fi]}
    let tmpResult=common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user})
}
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
//additionalCheckCondition: {key,value}
async function ifFieldInDocValueUnique_async({collName,docValue,additionalCheckCondition}){
    // if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0){
    //     console.log(`ifFieldInDocValueUnique_async in=========>}`)
    // console.log(`ifFieldInDocValueUnique_async docValue=========>${JSON.stringify(docValue)}`)
    for(let singleFieldName in docValue){
        // console.log(`singleFieldName=========>${JSON.stringify(singleFieldName)}`)
        if(-1!==e_uniqueField[collName].indexOf(singleFieldName)){
            // console.log(`singleFieldName is uhnqieu=========>${JSON.stringify(singleFieldName)}`)
            let condition = {}
            condition[singleFieldName]=docValue[singleFieldName]
            //patch(user中，还有额外的字段docStatus用来判断是否unique)

            if(undefined!==additionalCheckCondition){
                Object.assign(condition,additionalCheckCondition)
            }
            let uniqueCheckResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel[collName], condition: condition})
// console.log(`ifFiledInDocValueUnique_asyn uniqueCheckResult=========>: ${JSON.stringify(uniqueCheckResult)}`)
            if(uniqueCheckResult.length>0){
                let chineseName=e_chineseName[collName][singleFieldName]
                // let fieldInputValue=docValue[singleFieldName]
// console.log(`collname ${collName}`)
// console.log(`singleFieldName ${singleFieldName}`)
// console.log(`chineseName ${chineseName}`)
                return Promise.reject(checkerError.fieldValueUniqueCheckError({collName:collName,fieldName:singleFieldName,fieldChineseName:chineseName}))
            }
        }
    }
    // }
    return Promise.resolve({rc:0})
}

/*
 * @docValue；待检测的记录
 * @collFkConfig:当前coll对应的fk配置，用来查找field的fk关系（对应到哪个coll）
 * @collFieldChineseName:如果外键不存在，报错是需要指明的字段的chineseName
 *
 * return：存在: {rc:0}   不存在：helperError.fkValueNotExist
 * */
async function ifFkValueExist_async({docValue,collFkConfig,collFieldChineseName}){
    //console.log(`collFkConfig fields========>${JSON.stringify(Object.keys(collFkConfig))}`)
    if(undefined!==collFkConfig){
        //console.log(`collFkConfig fields========>${JSON.stringify(Object.keys(collFkConfig))}`)
        //console.log(`docValue ========>${JSON.stringify(docValue)}`)
        for(let singleFkFieldName in collFkConfig){
            // console.log(`singleFkFieldName=======>${singleFkFieldName}`)
            // console.log(`docValue[singleFkFieldName]===============>${JSON.stringify(docValue[singleFkFieldName])}`)
            if(undefined!==docValue[singleFkFieldName]){
                let fkFieldValueInObjectId=docValue[singleFkFieldName]
                let fkFieldRelatedColl=collFkConfig[singleFkFieldName]['relatedColl']
// console.log(`ifFkValueExist_async===>fkFieldRelatedColl===>${fkFieldRelatedColl}, id=====>${fkFieldValueInObjectId}`)
                let tmpResult=await  common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[fkFieldRelatedColl],id:fkFieldValueInObjectId})
                // console.log(`fk value exit check =========>${JSON.stringify(tmpResult)}`)
                if(null===tmpResult){
                    let chineseName=collFieldChineseName[singleFkFieldName]
                    let fieldInputValue=docValue[singleFkFieldName]
                    return Promise.reject(helperError.fkValueNotExist(chineseName,fieldInputValue))
                    // return Promise.resolve({rc:0,msg:false})
                }
                /*            else{
                 return Promise.resolve({rc:0,msg:true})
                 }*/

            }
        }
    }

    return Promise.resolve({rc:0,msg:true})
}

/*          当前资源使用量（currentResourceUsage），是否已经超出资源定义（currentResourceProfile），超出返回错误（error）
 * @currentResourceUsage: 获得当前resourceProfileRange（PER_PERSON/IMPEACH/ARTICLE）已经使用的资源信息，size和path
 *               {totalSizeInMb:xxxx, totalFileNum: yyyyy}
 * @currentResourceProfile： 当前需要比较的profile
 * @error;   如果size或者number超出，对应的error
 *               {sizeExceed: size超出对应的error,numberExceed：数量超出的error }
 * */
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

/*          当前资源使用量（currentResourceUsage）+新文件（fileInfo），是否已经超出资源定义（currentResourceProfile），超出返回错误（error）
 * @currentResourceUsage: 获得当前resourceProfileRange（PER_PERSON/IMPEACH/ARTICLE）已经使用的资源信息，size和path
 *               {totalSizeInMb:xxxx, totalFileNum: yyyyy}
 * @currentResourceProfile： 当前需要比较的profile
 * @fileInfo： {size:, path:}
 * @error;   如果size或者number超出，对应的error
 *               {sizeExceed: size超出对应的error,numberExceed：数量超出的error }
 * */
async function ifNewFileLeadExceed_async({currentResourceUsage,currentResourceProfile,fileInfo,error}){
    /*    let currentResourceProfile //根据resourceProfileRange和userId，选中的资源配置记录
     //查找resource配置文件
     let tmpResult = await chooseLastValidResourceProfile_async({resourceProfileRange: resourceProfileRange, userId: userId})
     // console.log(`chosed profile========>${JSON.stringify(tmpResult.msg)}`)
     //有资源配置文件，才进行检查
     if(undefined!==tmpResult.msg){

     currentResourceProfile=misc.objectDeepCopy(tmpResult.msg)
     }*/
    // console.log(`currentResourceProfile =====>${JSON.stringify(currentResourceProfile)}`)
    // console.log(`currentResourceUsage =====>${JSON.stringify(currentResourceUsage)}`)
    /*    currentResourceUsage.totalSizeInMb += tmpResult['totalImageSizeInMb']
     currentResourceUsage.totalFileNum += tmpResult['totalFileNum']*/

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
}

/*      如果某个字段是enum，且type为数组（单纯为数组可以重复），那么检查字段值是否有重复（例如，分配给admin_user的priority，其中权限就不能重复）
*
* @collValue：一个记录的值(格式为field：value,即，如果是browse输入，需要转换)。可以是browse的，也可以是internal的，或者是混合的
* @collRule: 根据rule查找那个字段为enum+数组，如果对应的字段值存在，进行重复性检测
*
* return: {rc:0}: 任意一个enum+array的字段有重复；{rc!==0}：所有enum+array的字段值皆无重复
*
* */
function ifEnumHasDuplicateValue({collValue,collRule}){
    // console.log(`in`)
    if(undefined===collRule){
        return checkerError.collRuleNotDefinedCantCheckEnumArray
    }
    //无记录，直接返回正确结果（无需检查）
    if(undefined===collValue){
        return {rc:0}
    }
    // console.log(`1`)
    for(let singleFieldName in collRule){
        //字段有type和enum定义，且type值为数组
        let singleFieldRule=collRule[singleFieldName]
        if(undefined!==singleFieldRule[e_serverRuleType.ENUM] && undefined!==singleFieldRule['type'] && singleFieldRule['type'] instanceof Array){
            //字段rule满足条件的情况下，字段值存在，则进行检查
            if(undefined!==collValue[singleFieldName]){
                let fieldResult=misc.ifArrayHasDuplicate(collValue[singleFieldName])
                if(true===fieldResult){
                    return checkerError.containDuplicateValue({fieldName:singleFieldName})
                }
            }
        }
    }
    // console.log(`2`)
    return {rc:0}
}

/*  判断adminUser是否拥有指定权限
*
* @userId: 要检测的adminUser的id
* @arr_expectedPriority: 数组。要检测的权限
* return: boolean
* */
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
}

/*/!*  检测当前用户是否可以CRUD ROOT用户
*
* *!/
function if(){

}*/


module.exports={
    // ifFieldValueExistInColl_async,// 检测字段值是否已经在db中存在
    ifSingleFieldFkValueExist_async,

    ifFieldInDocValueUnique_async,//未使用ifFieldValueExistInColl_async，直接使用find方法对整个输入的字段进行unique检测
    ifFkValueExist_async,
    ifResourceStillValid_async, //直接计算（db）中已有的resource是否超出profile的定义
    ifNewFileLeadExceed_async,  //db中已有resource+上传文件，是否超出profile定义
    ifEnumHasDuplicateValue,//数组是否可以包含重复值

    ifAdminUserHasExpectedPriority,
}