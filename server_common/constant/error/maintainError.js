/**
 * Created by ada on 2017/12/7.
 */
'use strict'


const dailyError={
    /*          express       */
    //uploadedFileNumSizeMatchCheck_async
    // invalidResourceType:{rc:44000,msg:`错误的资源类型`},
    noRelatedRecordInUserResourceStatic:function({userId,resourceType}){
        return {rc:44000,msg:`用户${userId}在user_resource_static中缺少对应resource:${resourceType}的记录`
    }},
}


/*      检查rule定义是否正确        */
/*      44100-44149                 */
const checkRule={
    missMandatoryField({collName,fieldName,ruleField}){
        return {rc:44100,msg:`coll:${collName}的字段${fieldName}中，缺少必须rule字段${ruleField}`}
    },
    applyRangeMustBeArray({collName,fieldName,ruleField}){
        return {rc:44102,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值必须是数组`}
    },
    applyRangeCantEmpty({collName,fieldName,ruleField}){
        return {rc:44104,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值不能为空数组`}
    },
    chineseNameCantEmpty({collName,fieldName,ruleField}){
        return {rc:44106,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值不能为空数组`}
    },
    dataTypeFormatWrong({collName,fieldName,ruleField}){
        return {rc:44108,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值是数组，必须只包含一个dataType`}
    },
    dataTypeWrong({collName,fieldName,ruleField}){
        return {rc:44110,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值是数组，不是预定义的dataType`}
    },
    /*          checkEnumValue                  */
    applyRangeValueInvalid({collName,fieldName,ruleField}){
        return {rc:44112,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值，不是预定义的applyRange`}
    },
    requireDefinitionKeyInvalid({collName,fieldName,ruleField}){
        return {rc:44114,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值，其中key不是预定义的applyRange`}
    },
    requireDefinitionValueInvalid({collName,fieldName,ruleField}){
        return {rc:44116,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值，其中value不是预定义的requireType`}
    },
    /*          checkEnumValue                  */
    requireDefinitionLengthNotEqualApplyRangeValue({collName,fieldName,ruleField}){
        return {rc:44118,msg:`coll:${collName}的字段${fieldName}中，rule字段applyRange和require define的长度不一致`}
    },
    requireDefinitionNotMatchApplyRangeValue({collName,fieldName,ruleField}){
        return {rc:44120,msg:`coll:${collName}的字段${fieldName}中，rule字段applyRange和require define不匹配`}
    },
    /*          checkApplyRange                  */
    applyRangeCantEmpty({collName,fieldName,ruleField}){
        return {rc:44122,msg:`coll:${collName}的字段${fieldName}中，rule字段require不能为空数组`}
    },
    applyRangeCantContainMoreThan1Update({collName,fieldName,ruleField}){
        return {rc:44124,msg:`coll:${collName}的字段${fieldName}中，rule字段require中，update只能有一个`}
    },
    /*           check relate rule              */
    dataTypeArrayMissMaxength({collName,fieldName,ruleField}) {
        return {rc: 44126, msg: `coll:${collName}的字段${fieldName}中，rule的数据类型为数组，但是没有定义array_max_length属性`}
    },
    /*          checkRequireContainMsgForError          */
    ruleMissErrorMsg({collName,fieldName,ruleField}) {
        return {rc: 44128, msg: `coll:${collName}的字段${fieldName}中，rule：${ruleField}的error中，没有定义msg`}
    },

    /*          check SearchRange         */
    searchRangeTypeIncorrect({collName,fieldName,ruleField}) {
        return {rc: 44130, msg: `coll:${collName}的字段${fieldName}中，searchRange的类型不正确`}
    },
    searchRangeValueIncorrect({collName,fieldName,ruleField}) {
        return {rc: 44132, msg: `coll:${collName}的字段${fieldName}中，searchRange的值不是预定义的`}
    },
    searchRangeRedundant({collName,fieldName,ruleField}) {
        return {rc: 44134, msg: `coll:${collName}的字段${fieldName}中，searchRange已经定义了ALL，但是又定义了其他搜索范围`}
    },

    //checkErrorCodeIsNumber
    errorCodeNotNumber({collName,fieldName,ruleField}){
        return {rc: 44136, msg: `coll:${collName}的字段${fieldName}中，rule ${ruleField}的error code不是整数`}
    },
    mongoErrorCodeNotNumber({collName,fieldName,ruleField}){
        return {rc: 44136, msg: `coll:${collName}的字段${fieldName}中，rule ${ruleField}的mongo error code不是整数`}
    }
}

const convertBrowserRuleError={

}
module.exports={
    dailyError,
    checkRule,

    convertBrowserRuleError,
}