/**
 * Created by zhang wei on 2018/3/19.
 * 查询参数只需要验证format，但是比较复杂，需要单独文件包含所有函数（功能）
 * Coll1:{
        fieldOp: AND或者OR   enum
        searchValue:{
            Field1:{

                arrayCompOp: [ANY,NOT]  [ANY]   [ALL,NOT] [ALL]
                arrayValue:[
                    {
                    scalarCompOp: include/exclude/exact    or     >/</=/!=........
                    scalarValue: string/date/number
                    }
                ]
            }
        }

    }
 */
'use strict'
/*              函数              */
const ap=require('awesomeprint')
const dataTypeCheck=require('./validateHelper').dataTypeCheck
const valueTypeCheck=require('./validateHelper').valueTypeCheck
const ifArrayHasDuplicate=require('../../function/assist/array').ifArrayHasDuplicate
/*              常量              */
const searchSetting=require('../../constant/config/globalConfiguration').searchSetting
const validateFormatError=require('../../constant/error/validateError').validateFormat
// const e_compOp=require('../../constant/enum/nodeEnum').CompOp
const e_searchRange=require('../../constant/enum/inputDataRuleType').SearchRange

const e_searchFieldName=require('../../constant/enum/inputDataRuleType').SearchFieldName

const inputDataRuleType=require('../../constant/enum/inputDataRuleType')
const e_fieldOp=inputDataRuleType.FieldOp
const e_arrayCompOp=inputDataRuleType.ArrayCompOp
const e_scalarCompOpForDigit=inputDataRuleType.ScalarCompOpForDigit
const e_scalarCompOpForString=inputDataRuleType.ScalarCompOpForString

const e_otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const dataType=inputDataRuleType.ServerDataType

const genInputDataRuleType=require('../../constant/genEnum/inputDataRuleTypeValue')
const e_fieldOpArrayValue=genInputDataRuleType.FieldOp
const e_arrayCompOpValue=genInputDataRuleType.ArrayCompOp
const e_scalarCompOpForDigitValue=genInputDataRuleType.ScalarCompOpForDigit
const e_scalarCompOpForStringValue=genInputDataRuleType.ScalarCompOpForString

const inputRule=require('../../constant/inputRule/inputRule').inputRule

// const searchSetting=require('../../constant/config/globalConfiguration').searchSetting

const rightResult={rc:0}


async function searchParamsIdCheck_async(){

}
/*  主函数，通过调用其他函数，完成搜索值的格式检查(对非id的searchParams进行检测，如果是通过id进行检测，使用其他函数)
* @arr_allowCollNameForSearch: API 搜索需要用到的coll（而不是所有的coll，防止client构造搜索函数，搜索超出权限的数据）
* @obj_searchParams; client传入的搜索值
* @arr_currentSearchRange: 搜索类型是否符合inputRule中的定义  [ALL]
* @bool_allowSearchAll: 搜索是否运行查询所有记录（不提供查询条件。默认false，只能查询部分记录）
*
* obj_searchParams是否为object，在validateFormat.validatePartValueFormat中实现
* */
function searchParamsNonIdCheck({arr_allowCollNameForSearch,obj_searchParams,arr_currentSearchRange,bool_allowSearchAll=false}){

    //1 检查obj_searchParams是否为空
    if(true===dataTypeCheck.isEmpty(obj_searchParams)){
        return validateFormatError.searchParams.partValueCantEmpty
    }
    //2 检查key是否都为allowColl
    let arr_collNames=Object.keys(obj_searchParams)
    for(let singleCollName of arr_collNames){
        if(-1===arr_allowCollNameForSearch.indexOf(singleCollName)){
            return validateFormatError.searchParams.illegalCollName
        }
    }
    //对每个coll进行检查
    for(let singleCollName of arr_collNames){
        let singleCollSearchParams=obj_searchParams[singleCollName]
        
        let tmpResult
        //值是object；2个key，且为enum
        tmpResult=collValueFormatCheck({collName:singleCollName,obj_collSearchParams:singleCollSearchParams,arr_currentSearchRange:arr_currentSearchRange})
        if(tmpResult.rc>0){return tmpResult}
        //key:fieldOp必须是AND或者OR
        let fieldOpValue=singleCollSearchParams[e_searchFieldName.FIELD_OP]
        tmpResult=fieldOpCheck({fieldOpValue:fieldOpValue})
        if(tmpResult.rc>0){return tmpResult}
        //key:searchValue必须是object
        let searchValue=singleCollSearchParams[e_searchFieldName.SEARCH_VALUE]
        tmpResult=searchValueFormatCheck({searchValue:searchValue})
        if(tmpResult.rc>0){return tmpResult}
        //每个field都是inputRule中存在且允许search
        tmpResult=searchValueValidationCheck({collName:singleCollName,searchValue:searchValue,arr_currentSearchRange:arr_currentSearchRange})
        if(tmpResult.rc>0){return tmpResult}

        // ap.inf('collValueFormatCheck done')
        let arr_fieldNames=Object.keys(singleCollSearchParams[e_searchFieldName.SEARCH_VALUE])
        for(let singleFieldName of arr_fieldNames){
            let fieldValue=singleCollSearchParams[e_searchFieldName.SEARCH_VALUE][singleFieldName]
            tmpResult=fieldValueFormatCheck({obj_fieldValue:fieldValue})
            if(tmpResult.rc>0){return tmpResult}

            let arr_arrayCompOpValue=fieldValue[e_searchFieldName.ARRAY_COMP_OP]
            let arr_arrayValue=fieldValue[e_searchFieldName.ARRAY_VALUE]

            tmpResult=arrayCompOpCheck({arr_arrayCompOpValue:arr_arrayCompOpValue})
            if(tmpResult.rc>0){return tmpResult}

            let fieldRule=inputRule[singleCollName][singleFieldName]
            tmpResult=arrayValueCheck({arr_arrayValue:arr_arrayValue,bool_allowSearchAll:bool_allowSearchAll,fieldRule:fieldRule})
            if(tmpResult.rc>0){return tmpResult}
            /*    let fieldOpNOTFlag=false
                if(-1!==arr_fieldOpValue.indexOf(e_fieldOp.NOT)){
                    fieldOpNOTFlag=true
                }*/

            let fieldDataTypeDefinition=inputRule[singleCollName][singleFieldName][e_otherRuleFiledName.DATA_TYPE]
            let fieldDataType= dataTypeCheck.isArray(fieldDataTypeDefinition) ? fieldDataTypeDefinition[0]:fieldDataTypeDefinition
            if(fieldDataType===dataType.DATE || fieldDataType===dataType.NUMBER || fieldDataType===dataType.INT || fieldDataType===dataType.FLOAT){
                tmpResult=arrayValueDigitLogicCheck({arr_arrayCompOp:arr_arrayCompOpValue,arr_arrayValue:arr_arrayValue,fieldDataType:fieldDataType,fieldRule:undefined})
                if(tmpResult.rc>0){return tmpResult}
            }
            if(fieldDataType===dataType.OBJECT_ID || fieldDataType===dataType.STRING){
                tmpResult=arrayValueStringLogicCheck({arr_arrayCompOp:arr_arrayCompOpValue,arr_arrayValue:arr_arrayValue,fieldDataType:fieldDataType,fieldRule:undefined})
                if(tmpResult.rc>0){return tmpResult}
            }
        }
        // ap.inf('fieldValueFormatCheck done')
    }
    return rightResult
}

/* 检测coll级别的格式
* */
function collValueFormatCheck({collName,obj_collSearchParams,arr_currentSearchRange}){

    //1 Coll的SearchParams必须是对象
    if(false===dataTypeCheck.isObject(obj_collSearchParams)){
        return validateFormatError.searchParams.collValueMustBeObject
    }
    //2 只有2个key
    if(2!==Object.keys(obj_collSearchParams).length){
        return validateFormatError.searchParams.collValueContain2Key
    }
    //3 每个key都是enum
    let validKey=[e_searchFieldName.FIELD_OP,e_searchFieldName.SEARCH_VALUE]
    for(let singleKey of Object.keys(obj_collSearchParams)){
        if(-1===validKey.indexOf(singleKey)){
            return validateFormatError.searchParams.collValueKeyInvalid
        }
    }
    
    //6 coll的searchValue中每个field在inputRule有定义，可以进行搜索
    /*let fieldNames=Object.keys(searchValue)
    for(let singleFieldName of fieldNames){
        let fieldSearchRangeDefinition=collInputRule[singleFieldName][e_otherRuleFiledName.SEARCH_RANGE]
        //如果字段没有定义search_range,说明当前字段无法用作search
        if(undefined===fieldSearchRangeDefinition){
            return validateFormatError.searchParams.fieldForbidForSearch)
        }
        //如果字段定义search_range为ALL，则无需进行判别，直接pass
        if(-1!==fieldSearchRangeDefinition.indexOf(e_searchRange.ALL)){
            break
        }
        //否则，判别arr_currentSearchRange中每个元素，都在rule中被定义
        for(let singleCurrentSearchRange of arr_currentSearchRange){
            if(-1===fieldSearchRangeDefinition.indexOf(singleCurrentSearchRange)){
                return validateFormatError.searchParams.currentSearchRangeForbid)
            }
        }
    }*/
    return rightResult
}

/*  检测field的value中的key：fieldOpCheck
* @arr_fieldOpValue: searchParams->coll->field->fieldOp的值["AND","NOT"]
* */
function fieldOpCheck({fieldOpValue}){
    //3. 第一个key fieldOp
    //3.1 必须存在
    if(false===dataTypeCheck.isSetValue(fieldOpValue)){
        return validateFormatError.searchParams.fieldOpValueUndefined
    }
    /* //3.2 必须为数组
     if(false===dataTypeCheck.isArray(arr_fieldOpValue)){
         return validateFormatError.searchParams.fieldOpValueMustBeArray)
     }
     //3.3 不能为空，且不能大于2
     if(0===arr_fieldOpValue.length || 2<arr_fieldOpValue.length){
         return validateFormatError.searchParams.fieldOpValueEleNumberIncorrect)
     }*/
    //3.4 必须是enum
    // for(let singleEle of arr_fieldOpValue){
    if(-1===e_fieldOpArrayValue.indexOf(fieldOpValue)){
        return validateFormatError.searchParams.fieldOpValueInvalid
    }
    // }
    /*//3.5 如果是2个元素，必定是AND+NOT或者OR+NOT
    if(2===arr_fieldOpValue.length){
        //3.5.1 AND或者OR必须存在
        if(-1===arr_fieldOpValue.indexOf(e_fieldOp.AND) && -1===arr_fieldOpValue.indexOf(e_fieldOp.OR)){
            return validateFormatError.searchParams.fieldOpMissMandatoryOp)
        }
            //3.5.2 NOT必须存在
        if(-1===arr_fieldOpValue.indexOf(e_fieldOp.NOT)){
            return validateFormatError.searchParams.fieldOpMissMandatoryOp)
        }
    }*/
    return rightResult
}

function searchValueFormatCheck({searchValue}){
    // return new Promise(function(resolve, reject){
        //1. 必须是object
        if(false===dataTypeCheck.isObject(searchValue)){
            return validateFormatError.searchParams.searchValueMustBeObject
        }
        //2. 不能为空object，且不能超过最大（5个）field（防止输入过大）
        let fieldNum=Object.keys(searchValue).length
        if(0===fieldNum || fieldNum> searchSetting.normal.maxKeyNum){
            return validateFormatError.searchParams.searchValueFieldNumIncorrect
        }

        return rightResult
    // })

}
/* coll的key：searchValue的检测
*
* */
function searchValueValidationCheck({collName,searchValue,arr_currentSearchRange}){
    let collInputRule=inputRule[collName]
    let fieldNames=Object.keys(searchValue)
    for(let singleFieldName of fieldNames){
        //field未在inputRule中定义
        if(undefined===collInputRule[singleFieldName]){
            return validateFormatError.searchParams.fieldUndefined
        }
        let fieldSearchRangeDefinition=collInputRule[singleFieldName][e_otherRuleFiledName.SEARCH_RANGE]
        //如果字段没有定义search_range,说明当前字段无法用作search
        if(undefined===fieldSearchRangeDefinition){
            return validateFormatError.searchParams.fieldForbidForSearch
        }
        //如果字段定义search_range为ALL，则无需进行判别，直接pass
        if(-1!==fieldSearchRangeDefinition.indexOf(e_searchRange.ALL)){
            break
        }
        //否则，判别arr_currentSearchRange中每个元素，都在rule中被定义
        for(let singleCurrentSearchRange of arr_currentSearchRange){
            if(-1===fieldSearchRangeDefinition.indexOf(singleCurrentSearchRange)){
                return validateFormatError.searchParams.currentSearchRangeForbid
            }
        }
    }

    return rightResult
}


/*  检查field的搜索值是否符合格式：1.object 2. 3个key 3.fieldOp为数组，不能为空且不能大于2，
* */
function fieldValueFormatCheck({obj_fieldValue}){
    //1 obj_fieldValue是object
    if(false===dataTypeCheck.isObject(obj_fieldValue)){
        return validateFormatError.searchParams.fieldValueMustBeObject
    }
    //2. obj_fieldValue有2个key
    let fieldSearchParamsKeys=Object.keys(obj_fieldValue)
    if(2!==fieldSearchParamsKeys.length){
        return validateFormatError.searchParams.fieldValueMustContain2Key
    }
    //3. key名为预定义的enum
    let allowKey=[e_searchFieldName.ARRAY_COMP_OP,e_searchFieldName.ARRAY_VALUE]
    for(let singleEle of fieldSearchParamsKeys){
        if(-1===allowKey.indexOf(singleEle)){
            return validateFormatError.searchParams.fieldValueKeyInvalid
        }
    }

    return rightResult
}



/*  检测field的value中的key：arrayCompOp
* @arrayCompOpValue: searchParams->coll->field->arrayCompOp的值     字符，enum值
* */
function arrayCompOpCheck({arr_arrayCompOpValue}){
    //4 第二个key arrayCompOp
    //4.1 不能为空
    if(false===dataTypeCheck.isSetValue(arr_arrayCompOpValue)){
        return validateFormatError.searchParams.arrayCompOpUndefined
    }
     //4.2 必须为数组
     if(false===dataTypeCheck.isArray(arr_arrayCompOpValue)){
         return validateFormatError.searchParams.arrayCompOpValueMustBeArray
     }
     //4.3 不能为空，且不能大于2
     if(0===arr_arrayCompOpValue.length || 2<arr_arrayCompOpValue.length){
         return validateFormatError.searchParams.arrayCompOpValueEleNumberIncorrect
     }
    //3.4 必须是enum
    for(let singleArrayCompOp of arr_arrayCompOpValue){
        if(-1===e_arrayCompOpValue.indexOf(singleArrayCompOp)){
            return validateFormatError.searchParams.arrayCompOpInvalid
        }
    }
    //3.5 如果是1个元素，必定是或者ALL或者ANY
    if(1===arr_arrayCompOpValue.length) {
        //3.5.1 AND或者OR必须存在
        if (-1 === arr_arrayCompOpValue.indexOf(e_arrayCompOp.ALL) && -1 === arr_arrayCompOpValue.indexOf(e_arrayCompOp.ANY)) {
            return validateFormatError.searchParams.arrayCompOp1OpMissMandatoryOp
        }
    }
    //3.6 如果是2个元素，必定是或者ALL+NONE或者ANY+NONE
    if(2===arr_arrayCompOpValue.length){
        //3.6.1 AND或者OR必须存在
        if(-1===arr_arrayCompOpValue.indexOf(e_arrayCompOp.ALL) && -1===arr_arrayCompOpValue.indexOf(e_arrayCompOp.ANY)){
            return validateFormatError.searchParams.arrayCompOp2OpMissMandatoryOp
        }
            //3.6.2 NOT必须存在
        if(-1===arr_arrayCompOpValue.indexOf(e_arrayCompOp.NONE)){
            return validateFormatError.searchParams.arrayCompOp2OpMissMandatoryOp
        }
    }

    return rightResult
}

/*  检测field的value中的key：arrayValue
* */
function arrayValueCheck({arr_arrayValue,bool_allowSearchAll,fieldRule}){
    //5 第三个key  arrayValue
    //5.1 必须存在
    if(undefined===arr_arrayValue){
        return validateFormatError.searchParams.arrayValueUndefined
    }
    //5.2 必须是数组
    if(false===dataTypeCheck.isArray(arr_arrayValue)){
        return validateFormatError.searchParams.arrayValueMustBeArray
    }
    //5.3 如果是空数组。 如果bool_allowSearchAll=false，返回错误；否则，跳过后续检查（查询所有记录是允许的）
    if(0===arr_arrayValue.length ){
        if(false===bool_allowSearchAll){
            return validateFormatError.searchParams.arrayValueCantBeEmpty
        }else{
            return rightResult
        }
    }
    //5.3 如果是非空数组
    //5.3.1 数组中元素个数大于指定数量（例如5）
    if(searchSetting.normal.maxQueryValuePerField<arr_arrayValue.length){
        return validateFormatError.searchParams.arrayValueExceedSetting
    }

    for(let singleEle of arr_arrayValue){
        //5.3.2 数组中每个元素必须是对象
        if(false===dataTypeCheck.isObject(singleEle)){
            return validateFormatError.searchParams.arrayValueEleMustBeObject
        }
        //5.3.2.1 数组中每个元素必须包含2个key
        if(2!==Object.keys(singleEle).length){
            return validateFormatError.searchParams.arrayValueEleKeyNumberIncorrect
        }
        //5.3.2.2 这2个key必须是scalarCompOp和scalarValue
        if(undefined===singleEle['scalarCompOp'] || undefined===singleEle['scalarValue']){
            return validateFormatError.searchParams.arrayValueEleKeyNameInvalid
        }
        //5.3.2.2.1 scalarCompOp必须是enum中的一个（根据field的类型，string：include/exclude/exact,number/date: 大于小于。。。）
        let fieldDataTypeDefinition=fieldRule[e_otherRuleFiledName.DATA_TYPE]
        let fieldDataType= dataTypeCheck.isArray(fieldDataTypeDefinition) ? fieldDataTypeDefinition[0]:fieldDataTypeDefinition
        if(fieldDataType===dataType.DATE || fieldDataType===dataType.NUMBER || fieldDataType===dataType.INT || fieldDataType===dataType.FLOAT){
            if(-1===e_scalarCompOpForDigitValue.indexOf(singleEle['scalarCompOp'])){
                return validateFormatError.searchParams.arrayValueEleScalarCompOpInvalid
            }
        }else if(fieldDataType===dataType.STRING ){
            if(-1===e_scalarCompOpForStringValue.indexOf(singleEle['scalarCompOp'])){
                return validateFormatError.searchParams.arrayValueEleScalarCompOpInvalid
            }
        }else if(fieldDataType===dataType.OBJECT_ID ){
            if(e_scalarCompOpForString.EXACT!==singleEle['scalarCompOp']){
                return validateFormatError.searchParams.arrayValueEleScalarCompOpInvalid
            }
        }else{
            return validateFormatError.searchParams.arrayValueEleScalarCompOpMisMatch
        }
        //5.3.2.2.2 scalarValue必须和inputRule中的dataType一致
        if(false===valueTypeCheck(singleEle['scalarValue'],fieldDataType)){
            return validateFormatError.searchParams.arrayValueEleScalarValueMisMatch
        }
    }

    return rightResult
}

/*      array(digit)的logic检查
* @fieldOpNOTFlag；当[NOT]存在的时候，只能对应一个express，否则只会处理最后一个，所以当NOT存在的时候，只能有一个比较符号(scalarCompOP)
* */
function arrayValueDigitLogicCheck({arr_arrayCompOp,arr_arrayValue,fieldDataType,fieldRule}){
   /* let fieldDataTypeDefinition=fieldRule[e_otherRuleFiledName.DATA_TYPE]
    let fieldDataType= dataTypeCheck.isArray(fieldDataTypeDefinition) ? fieldDataTypeDefinition[0]:fieldDataTypeDefinition*/
    //如果字段类型是数据，
    // 如果arrayCompOp是ALL(and),那么只能有一个>和<，或者一个=
    //[{>},{<}] [{=}]  [{>=},{<=}]
    // if(fieldDataType===dataType.DATE || fieldDataType===dataType.NUMBER){
        let gtNum=0,ltNum=0,eqNum=0,unEqNum=0,gteNum=0,lteNum=0
        let gtValue,ltValue,eqValue
        for(let singleEle of arr_arrayValue){
            switch (singleEle['scalarCompOp']){
                case e_scalarCompOpForDigit.EQUAL:
                    eqNum++;
                    eqValue=singleEle['scalarValue']
                    break;
                case e_scalarCompOpForDigit.GREATER:
                    gtNum++;
                    gtValue=singleEle['scalarValue']
                    break;
                case e_scalarCompOpForDigit.LESS:
                    ltValue=singleEle['scalarValue']
                    ltNum++;
                    break;
                case e_scalarCompOpForDigit.GREATER_EQUAL:
                    gteNum++;
                    gtValue=singleEle['scalarValue']
                    break;
                case e_scalarCompOpForDigit.LESS_EQUAL:
                    lteNum++;
                    ltValue=singleEle['scalarValue']
                    break;
                case e_scalarCompOpForDigit.UNEQUAL: //  !=可以和任何其他比较符组合，所以无需check
/*                    lteNum++
                    ltValue=singleEle['scalarValue']*/
                    break;
                default:
                    ap.err('未知比较符')
            }
        }

        /*//如果fieldOp含有NOT，那么只能支持一种scalarCompOp（$not的限制）
        if(true===fieldOpNOTFlag){
            let differentComp=0
            let tmp=[gtNum,gteNum,eqNum,unEqNum,ltNum,lteNum]
            for(let single of tmp){
                if(single>0){
                    differentComp++
                }
            }
            if(differentComp>1){
                return validateFormatError.searchParams.scalarCompCanOnlyOneWhenNOT)
            }
        }*/
        //每种符号只能有一个（2个>无意义）
        if(gtNum>1 || ltNum>1 || gteNum>1 || lteNum>1 ){
            return validateFormatError.searchParams.scalarCompGteLteMaxOne
        }
        // gt不能和gte共存，lt不能和lte共存（无论AND OR，都无意义）
        if( (gtNum>0 && gteNum>0) || (ltNum>0 && lteNum>0) ){
            return validateFormatError.searchParams.scalarCompGtGteLtLteCantCoexist
        }

        for(let singleArrayCompOp of arr_arrayCompOp){
            switch (singleArrayCompOp) {
                //arrayCompOp为AND的时候，
                case e_arrayCompOp.ALL:
                    //ALL中，= 只能有一个
                    if(eqNum>1){
                        return validateFormatError.searchParams.scalarCompEqAtMostOneWhenScalarCompOpALL
                    }
                    // =不能和其他混用（=匹配单一(for数字)，而其他（不包括!=）匹配多个）
                    if(1===eqNum){
                        if(gtNum>0 || ltNum>0 || gteNum>0 || lteNum>0 ){
                            return validateFormatError.searchParams.scalarCompEqCantCoexistWithGteLte
                        }
                    }
                    //gt的value不能小于lt/lte的value，否则无匹配记录 ( >10 && <=10)
                    if(undefined!==gtValue && undefined!==ltValue){
                        if(gtValue>=ltValue){
                            return validateFormatError.searchParams.scalarValueGteValueCantGreaterThanLteValue
                        }
                    }
                    break
                case e_arrayCompOp.ANY:
                    break;
                case e_arrayCompOp.NONE:
                    break;
                default:
                    ap.wrn('未知arrayCompOp')
            }
        }

        return rightResult
}


/*      array(string)的logic检查
* */
function arrayValueStringLogicCheck({arr_arrayCompOp,arr_arrayValue,fieldDataType,fieldRule}){
    /*let fieldDataTypeDefinition=fieldRule[e_otherRuleFiledName.DATA_TYPE]
    let fieldDataType= dataTypeCheck.isArray(fieldDataTypeDefinition) ? fieldDataTypeDefinition[0]:fieldDataTypeDefinition*/

    //收集数据
    let includeNum=0,excludeNum=0,exactNum=0
    let includeValue=[],excludeValue=[],exactValue=[]
    for(let singleEle of arr_arrayValue){
        let scalarValueInSingleEle=singleEle['scalarValue']
        let scalarCompOpInSingleEle=singleEle['scalarCompOp']
        switch (scalarCompOpInSingleEle){
            case e_scalarCompOpForString.EXACT:
                exactNum++
                exactValue.push(scalarValueInSingleEle)
                break;
            case e_scalarCompOpForString.INCLUDE:
                includeNum++
                includeValue.push(scalarValueInSingleEle)
                break;
            case e_scalarCompOpForString.EXCLUDE:
                excludeNum++
                excludeValue.push(scalarValueInSingleEle)
                break
            default:
                ap.err('未知的非数字scalarComp')
        }
    }

    //scalar value 不能有重复 字符
    if(exactValue.length>1 && true===ifArrayHasDuplicate(exactValue)){
        return validateFormatError.searchParams.scalarValueForExactDuplicate
    }
    if(includeValue.length>1 && true===ifArrayHasDuplicate(includeValue)){
        return validateFormatError.searchParams.scalarValueForIncludeDuplicate
    }
    if(excludeValue.length>1 && true===ifArrayHasDuplicate(excludeValue)){
        return validateFormatError.searchParams.scalarValueForExcludeDuplicate
    }

    for(let singleArrayCompOp of arr_arrayCompOp){
        switch (singleArrayCompOp){
            case e_arrayCompOp.ALL: //and
                // ap.inf('exactNum')
                if(exactNum>0){
                    return validateFormatError.searchParams.scalarValueExactCantCoexist
                }
                break
            case e_arrayCompOp.ANY:
                break;
            case e_arrayCompOp.NONE:
                break
        }
    }

    //所有的scalarValue不能重复。例如，exclude='zw' and/or include='zw'，这样的查询条件毫无意义
    let allScalarValue=includeValue.concat(excludeValue).concat(exactValue)
    if(allScalarValue.length>0){
        if(true===ifArrayHasDuplicate(allScalarValue)){
            return validateFormatError.searchParams.arrayValuesScalarValueHasDuplicateEle
        }
    }
    return rightResult
}

module.exports={
    searchParamsNonIdCheck,
}

let clientSql={
    user:
        {
            [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
            [e_searchFieldName.SEARCH_VALUE]:{
                name:{

                    [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ANY],
                    [e_searchFieldName.ARRAY_VALUE]:[
                        {
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SCALAR_VALUE]:'zw',
                        },
                        {
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.EXCLUDE,
                            [e_searchFieldName.SCALAR_VALUE]:'wzhan039',
                        },
                    ]
                },
                /*            nickname:{
                                [e_searchFieldName.FIELD_OP]:[e_fieldOp.AND,e_fieldOp.NOT],
                                [e_searchFieldName.ARRAY_COMP_OP]:e_arrayCompOp.ANY,
                                [e_searchFieldName.ARRAY_VALUE]:[
                                    {
                                        [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.EXACT,
                                        [e_searchFieldName.SCALAR_VALUE]:'zhangwei',
                                    },
                                ]
                            },*/
                lastSignInDate:{

                    [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ANY],
                    [e_searchFieldName.ARRAY_VALUE]:[
                        {
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.GREATER,
                            [e_searchFieldName.SCALAR_VALUE]:18,
                        },
                        {
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.LESS_EQUAL,
                            [e_searchFieldName.SCALAR_VALUE]:65,
                        },
                    ]
                },
            }
            },

}

/*
searchParamsNonIdCheck({arr_allowCollNameForSearch:['user'],obj_searchParams:clientSql,arr_currentSearchRange:e_searchRange.ALL,bool_allowSearchAll:false}).then(function(r){
    ap.inf('result',r)
},function(e){
    ap.err('err',e)
})*/
