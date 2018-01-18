/**
 * Created by ada on 2017/12/7.
 */
'use strict'


const dailyError={
    /*          express       */
    //uploadedFileNumSizeMatchCheck_async
    // invalidResourceType:{rc:42000,msg:`错误的资源类型`},
    noRelatedRecordInUserResourceStatic:function({userId,resourceType}){
        return {rc:42000,msg:`用户${userId}在user_resource_static中缺少对应resource:${resourceType}的记录`
    }},
}


/*      检查rule定义是否正确        */
/*      43000-43049                 */
const checkRule={
    missMandatoryField({collName,fieldName,ruleField}){
        return {rc:43000,msg:`coll:${collName}的字段${fieldName}中，缺少必须rule字段${ruleField}`}
    },
    applyRangeMustBeArray({collName,fieldName,ruleField}){
        return {rc:43002,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值必须是数组`}
    },
    applyRangeCantEmpty({collName,fieldName,ruleField}){
        return {rc:43004,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值不能为空数组`}
    },
    chineseNameCantEmpty({collName,fieldName,ruleField}){
        return {rc:43006,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值不能为空数组`}
    },
    dataTypeFormatWrong({collName,fieldName,ruleField}){
        return {rc:43008,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值是数组，必须只包含一个dataType`}
    },
    dataTypeWrong({collName,fieldName,ruleField}){
        return {rc:43010,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值是数组，不是预定义的dataType`}
    },
    /*          checkEnumValue                  */
    applyRangeValueInvalid({collName,fieldName,ruleField}){
        return {rc:43012,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值，不是预定义的applyRange`}
    },
    requireDefinitionKeyInvalid({collName,fieldName,ruleField}){
        return {rc:43014,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值，其中key不是预定义的applyRange`}
    },
    requireDefinitionValueInvalid({collName,fieldName,ruleField}){
        return {rc:43016,msg:`coll:${collName}的字段${fieldName}中，rule字段${ruleField}的值，其中value不是预定义的requireType`}
    },
    /*          checkEnumValue                  */
    requireDefinitionLengthNotEqualApplyRangeValue({collName,fieldName,ruleField}){
        return {rc:43018,msg:`coll:${collName}的字段${fieldName}中，rule字段applyRange和require define的长度不一致`}
    },
    requireDefinitionNotMatchApplyRangeValue({collName,fieldName,ruleField}){
        return {rc:43020,msg:`coll:${collName}的字段${fieldName}中，rule字段applyRange和require define不匹配`}
    },
    /*          checkApplyRange                  */
    applyRangeCantEmpty({collName,fieldName,ruleField}){
        return {rc:43022,msg:`coll:${collName}的字段${fieldName}中，rule字段require不能为空数组`}
    },
    applyRangeCantContainMoreThan1Update({collName,fieldName,ruleField}){
        return {rc:43024,msg:`coll:${collName}的字段${fieldName}中，rule字段require中，update只能有一个`}
    },
}

module.exports={
    dailyError,
    checkRule,
}