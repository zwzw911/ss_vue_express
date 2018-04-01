/**
 * Created by Ada on 2017/1/23.
 * 对输入到server端的数据格式进行检查（而不检查其中的值）
 * 1. validateCUInputFormat：总体检查createUpdateDelete输入参数（是否为对象，是否包含recordInfo/currentPage的key，且为对象或者整数）
 * 2. validateCURecordInfoFormat： 检查recordInfo（记录的输入值）是否符合inputRule的规定
 * 3. validateSearchInputFormat： 总体检查search（read）的输入参数，是否包含searchParams和currentPage
 * 4. validateSearchParamsFormat: 对search操作中的searchParams进行检查
 * 5. validateSingleSearchParamsFormat： 对searchParams中的单个字段的比较符值进行检测
 */
'use strict'
// require("babel-polyfill");
// require("babel-core/register")
const ap=require('awesomeprint')

const dataTypeCheck=require('./validateHelper').dataTypeCheck
const searchSetting=require('../../constant/config/globalConfiguration').searchSetting
const validateFormatError=require('../../constant/error/validateError').validateFormat
const e_compOp=require('../../constant/enum/nodeEnum').CompOp
const dataType=require('../../constant/enum/inputDataRuleType').ServerDataType
const rightResult={rc:0}
const e_validatePart=require('../../constant/enum/nodeEnum').ValidatePart
const e_keyForSearchParams=require('../../constant/enum/nodeEnum').KeyForSearchParams
const e_method=require('../../constant/enum/nodeEnum').Method
const e_manipulateOperator=require('../../constant/enum/nodeEnum').ManipulateOperator
const arr_editSubField=require('../../constant/genEnum/nodeEnumValue').SubField
const arr_manipulateOperator=require('../../constant/genEnum/nodeEnumValue').ManipulateOperator
const arr_eventField=require('../../constant/genEnum/nodeEnumValue').EventField
const regex=require(`../../constant/regex/regex`).regex
//检测req.body.values是否存在且为object
function validateReqBody(reqBody){
    //reqBody未定义
    if(false===dataTypeCheck.isSetValue(reqBody)){
        // console.log(`!reqBody==>${JSON.stringify(reqBody)}`)
        return validateFormatError.valuesUndefined
    }
    if(false===dataTypeCheck.isObject(reqBody)){
        return validateFormatError.reqBodyMustBeObject
    }
    if(false==='values' in reqBody || false===dataTypeCheck.isSetValue(reqBody['values'])){
        return validateFormatError.valuesUndefined
    }
    //0 如果需要检查inputValue，则inputValue必须为object
    if(false===dataTypeCheck.isObject(reqBody['values'])){
        return validateFormatError.valueMustBeObject
    }
    return rightResult
}
// import {validatePart} from '../../define/enum/validEnum'
/* 检测输入的部分是否存在，且只有这几部分
 * params:
 * 1. inputValue:（post）传入的对象，post的输入的参数
 * 2. expectedParts: 数组 期望参数里包含哪些部分
 *
 * step
 * 1. 遍历expectedParts，确定其中定义是否为预定义（在validatePart中）
 * 2. inputValuekey的数量是否等于expectedParts的key的数量；
 * 3. 遍历inputValue，key是否都在expectedParts中， 且inputValue中每个part对应的值的类型：
 *      searchParams:object
 *      recordInfo:object
 *      currentColl: string
 *      currentPage; int
 *      recoderId:string(objectId)
 */
function  validatePartFormat (inputValue,expectedParts){

    //expectedPart和inputValue中的part必须一一对应
    //1  inputValue的数量是否等于expectedParts的数量
    let inputValueKeyNum=Object.keys(inputValue).length
    let expectedPartsNum=expectedParts.length
    if(inputValueKeyNum!==expectedPartsNum){
        return validateFormatError.inputValuePartNumNotExpected
    }

    //2. 遍历expectedParts，确保所有item都在validatePart中定义
    for(let part of expectedParts){
        if(-1=== Object.values(e_validatePart).indexOf(part)){
            return validateFormatError.inputValueExceptedPartNotValid
        }
    }

    //3  遍历inputValue，
    for(let partKey in inputValue){
        // 3.1 key是否都在expectedParts中
        if(-1===expectedParts.indexOf(partKey)){
            // ap.err('unknown part',partKey)
            return validateFormatError.inputValuePartNotMatch
        }
    }
    // ap.print('start part value format check')
    for(let partKey in inputValue){
        //3.2 每个part的value的类型
        let partFormatCheckResult=validatePartValueFormat({part:partKey,partValue:inputValue[partKey]})
        // ap.print('partFormatCheckResult',partFormatCheckResult)
        if(partFormatCheckResult.rc>0){return partFormatCheckResult}
    }
    return rightResult
}

/*  对每个part的value进行整体format的验证
*
* */
function validatePartValueFormat({part,partValue}){
    switch (part){
        case e_validatePart.CURRENT_PAGE:
            // console.log(`current page  =========>${JSON.stringify(partValue)}`)
            // console.log(`current page type =========>${JSON.stringify(typeof partValue)}`)
            if(false===dataTypeCheck.isStrictInt(partValue)){
                return validateFormatError.inputValuePartCurrentPageValueFormatWrong
            }
            break
        case e_validatePart.RECORD_ID:
            if(false===dataTypeCheck.isString(partValue) || false===regex.objectId.test(partValue)) {
                return validateFormatError.inputValuePartRecordIdValueFormatWrong
            }
            break
        case e_validatePart.RECORD_ID_ARRAY:
            if(false===dataTypeCheck.isArray(partValue) ){
                return validateFormatError.inputValuePartRecIdArrValueFormatWrong
            }
            break
        case e_validatePart.RECORD_INFO:
            if(false===dataTypeCheck.isObject(partValue)){
                return validateFormatError.inputValuePartRecordInfoValueFormatWrong
            }
            break;
        case e_validatePart.SINGLE_FIELD:
            if(false===dataTypeCheck.isObject(partValue)){
                return validateFormatError.inputValuePartSingleFieldValueFormatWrong
            }
            break;
/*        case e_validatePart.SEARCH_PARAMS:
            if(false===dataTypeCheck.isObject(partValue)){
                // console.log(`searchparam errir in`)
                return validateFormatError.inputValuePartSearchParamsValueFormatWrong
            }
            break;*/
        case e_validatePart.FILTER_FIELD_VALUE:
            if(false===dataTypeCheck.isObject(partValue)){
                // console.log(`searchparam errir in`)
                return validateFormatError.inputValuePartFilterFieldValueFormatWrong
            }
            break;
        case e_validatePart.EVENT:
            if(false===dataTypeCheck.isObject(partValue)){
                // console.log(`searchparam errir in`)
                return validateFormatError.inputValuePartEventValueFormatWrong
            }
            break;
        case e_validatePart.EDIT_SUB_FIELD:
            // ap.print('e_validatePart.EDIT_SUB_FIELD in')
            if(false===dataTypeCheck.isObject(partValue)){
                // console.log(`searchparam errir in`)
                return validateFormatError.inputValuePartEditSubFieldValueFormatWrong
            }
            break;
        case e_validatePart.METHOD:
            //所有枚举值都是字符
            // if(-1===Object.values(e_method).indexOf(inputValue[partKey].toString())){
            if(false===dataTypeCheck.isString(partValue)){
                return validateFormatError.inputValuePartMethodValueFormatWrong
            }
            break;
        case e_validatePart.MANIPULATE_ARRAY:
            if(false===dataTypeCheck.isObject(partValue)){
                return validateFormatError.inputValuePartManipulateArrayValueFormatWrong
            }
            break;
        case e_validatePart.CAPTCHA:
            //captcha格式简单，无需format，直接value检查
            break;
        case e_validatePart.SMS:
        //SMS格式简单，无需format，直接value检查
            break;
/*        case e_validatePart.DATA_URL:
            if(false===dataTypeCheck.isString(partValue)){
                return validateFormatError.inputValuePartDataUrlValueFormatWrong
            }
            break;*/
        case e_validatePart.SEARCH_PARAMS:
            if(false===dataTypeCheck.isObject(partValue)){
                return validateFormatError.searchParams.partValueFormatWrong
            }
            break;
        default:
            //理论上不会出现，因为在之前的检查就会被过滤。放在此处只是为了格式完整
            return validateFormatError.inputValuePartUndefinedPart
    }
    return rightResult
}



/*
 * validateCURecordInfoFormat:当为create/update/delete的时候，检测client输入的记录格式是否正确》例如 {parentBillType:{value:'val1'}}
 * eColl: 当前使用的coll
 * values: 传入的数据，所有rules（考虑到外键的情况）
 * rules：数据对应的rule define，以coll为基本单位
 * fkConfig: 外键的配置，以coll为单位
 * ******************  1/2 在validateCUInputFormat已经做过     ***************************
 * 1.
 * 2. 必须是Object(隐含不能为undefined/null)
 * *************************************************************************************************
 * 1. 必须有值，不能为''/[]/{}
 * 2. 检查key数量是否合适（不能超过rule中field的数量）
 * 3. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
 * 4. 是否包含rule中未定义字段（防止用户随便输入字段名）.。xxxx如果是外键，要查找外键对应的rule是否存在,xxxxxx(create/update只有objectId)
 * 5.  每个key的value必须是object，且有key为value的key-value对
 *
 * xxxxxx5. 某些即使放在inputRule中，但也不能作为输入字段（比如，cDate复用作为查询 创建日期）xxxxxxx
 *
 * */
function validateCURecordInfoFormat(recordInfo,rule){
// console.log(`recordInfo ===>${JSON.stringify(recordInfo)}`)
//     console.log(`rule ===>${JSON.stringify(rule)}`)
    let inputValueFields=Object.keys(recordInfo)
    let collRulesFields=Object.keys(rule)

    //1. create/update的字段空（未定义）
    if(0===inputValueFields.length){
        return validateFormatError.recordInfoCantEmpty
    }
    //2. 判断输入的值的字段数是否超过对应rule中的字段数
    if(inputValueFields.length>collRulesFields.length){
        return validateFormatError.recordInfoFieldNumExceed

    }


    //3. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
    let tmpValue={}
    for(let key in recordInfo){
        // console.log(`current key is ${key}`)
        tmpValue[key]=1 //随便设个值，因为只需统计最终key数
    }
    // console.log(`converted dup is ${JSON.stringify(tmpValue)}`)
    let tmpKeys=Object.keys(tmpValue)
    let inputKeys=Object.keys(recordInfo)
    // console.log(`tmp key is ${JSON.stringify(tmpValue)}`)
    // console.log(`input key is ${JSON.stringify(value)}`)
    if(tmpKeys.length!==inputKeys.length){
        return validateFormatError.recordInfoHasDuplicateField
    }

// ap.inf('validateCURecordInfoFormat：recordInfo',recordInfo)
    //4. 判断输入值中的字段是否在inputRule中有定义
    for(let singleFieldName in recordInfo){
        //必须忽略id或者_id，因为没有定义在rule中（在创建doc时，这是自动生成的，所以创建上传的value，无需对此检测；如果rule中定义了，就要检测，并fail）
        if(singleFieldName!=='_id' && singleFieldName !=='id'){
            if(undefined===rule[singleFieldName]){
                // ap.inf('single field name',singleFieldName)
                return validateFormatError.recordInfoFiledRuleNotDefine
            }
        }
    }

/*    //5. 每个key的value必须是object，且有key为value的key-value对,且value不能为undefined(可以为null，说明update的时候要清空字段)
    for(let singleField in recordInfo){
        //5.1 field是否为对象
        if(false===dataTypeCheck.isObject(recordInfo[singleField])){
            return validateFormatError.recordInfoValueMustBeObject
        }
        //5.2 此object是否只有一个key
        if(Object.keys(recordInfo[singleField]).length!==1){
            return validateFormatError.recordInfoSubObjectMustHasOnly1Field
        }
        //5.3. 且此key为value
        if(false==='value' in recordInfo[singleField]){
            return validateFormatError.recordInfoSubObjectFiledNameWrong
        }
        //null值表示update的时候，要删除这个field，所以是valid的值
        /!*        if(null===recordInfo[singleField]['value']){
         return validateFormatError.valueNotDefineWithRequireTrue
         }*!/
    }*/

    return rightResult
}

/*  用于e_part.SINGLR_FIELD的格式检查
* 和validateCURecordInfoFormat类似，只是对应的part只有一个字段
* */
function validateSingleFieldFormat(singleField,collRule){
    let inputValueFields=Object.keys(singleField)
    // let collRulesFields=Object.keys(collRule)

    //1. 必须只能包含一个字段
    if(1!==inputValueFields.length){
        return validateFormatError.singleFieldMustOnlyOneField
    }

    let singleFieldName=inputValueFields[0]
    //不能为undefined，可以为null（说明删除字段）
    if(undefined===singleField[singleFieldName]){
        return validateFormatError.singleFieldValueCantUndefined
    }
    //2. 判断输入值中的字段是否在inputRule中有定义
    // for(let singleFieldName in singleField){
        //必须是非id/_id的字段，因为这是db自动生成的
        if(singleFieldName==='_id' || singleFieldName ==='id'){
            return validateFormatError.singleFieldCantContainId
        }
        if(undefined===collRule[singleFieldName]){
            return validateFormatError.singleFiledRuleNotDefine
        }
    // }

    //5. 每个key的value必须是object，且有key为value的key-value对,且value不能为undefined(可以为null，说明update的时候要清空字段)
    // for(let singleField in recordInfo){
/*        //5.1 field是否为对象
        if(false===dataTypeCheck.isObject(singleField[singleFieldName])){
            return validateFormatError.singleFiledRValueMustBeObject
        }
        //5.2 此object是否只有一个key
        if(Object.keys(singleField[singleFieldName]).length!==1){
            return validateFormatError.singleFiledValueMustContainOneKey
        }
        //5.3. 且此key为value
        if(false==='value' in singleField[singleFieldName]){
            return validateFormatError.singleFiledValuesKeyNameWrong
        }*/
        //null值表示update的时候，要删除这个field，所以是valid的值
        /*        if(null===recordInfo[singleField]['value']){
         return validateFormatError.valueNotDefineWithRequireTrue
         }*/
    // }

    return rightResult
}



/* 对POST输入的 查询参数 的格式检查，最终值的格式的检测放在validateSingleSearchParamsFormat执行（所以不会检测最终value的格式）
 1. 如果searchParams空，返回rc：0

 2. searchParams中字段数小于rule的字段数
 3. 每个key（字段）是否有对应的searchRule字段(搜索字段大于等于inputRule字段)。
 4. 字段值的格式，普通：array，如果是外键，object
 4.1. 如果是外键，检测值的key，是否位于fkconfig的relatedFields中（外键对应的field是否在外表中存在）
 5. 普通：字段值不为空；外键：外键field对应的值是否为空
 5. 调用subValidateInputSearchFormat进行值的检测
 *
 *  @1.searchParams: object
 *           {
 currentPage:1,
 searchaParams:{
 name:[{value:'name1'},{value:'name2'}],
 age:[{value:18,compOp:'gt'},{value:20,compOp:'eq'}],
 parentBillType:
 {
 name:[{value:'asdf'},{value:'fda'}],
 age:[{value:12, compOp:'gt'}, {value:24, compOp:'lt'}]
 }
 }
 }
 *           client传入的搜索参数，以coll为单位。因为使用独立的函数进行处理，所以可以和validateInput的输入参数不一致.如此可以简化对格式的检查步骤
 *           父函数validateinputSearchFormat只检查字段是否有值，至于值的格式，由subValidateInputSearchFormat检测（因为普通字段和外键字段格式类似，可以调用同一个函数来简化操作）
 *   @2 collFKConfig: object。    基于coll的fkconfig
 *   @3  collName: string          当前searchparams对应的coll
 *    @  4. inputRules: object      所有的inputRule（因为不能确定外键对应的coll，所以提供全部inputRule，在函数中动态选取）
 *           返回{rc:0,msg:'xxxx}
 * */
function validateSearchParamsFormat(searchParams,collFKConfig,collName,inputRulesForSearch) {
    let inputValueFields=Object.keys(searchParams)
    if(undefined===inputRulesForSearch[collName]){
        return validateFormatError.searchParamsCollNoRelatedRule
    }
    let collRulesFields=Object.keys(inputRulesForSearch[collName])
// console.log(`inputValueFields is ${JSON.stringify(inputValueFields)}`)
    //1. searchParams的字段空（无任何查询条件，直接返回rc：0）
    if(0===inputValueFields.length){
        // console.log(`empty search params`)
        return rightResult
    }
    //2. 判断输入的值的字段数是否超过对应rule中的字段数
    if(inputValueFields.length>collRulesFields.length){
        return validateFormatError.searchParamsFieldsExceed
        // return result
    }
/*    //2. 判断输入值中的字段是否在inputRule中有定义
    for(let fieldName in searchParams){
        if(undefined===inputRules[collName][fieldName]){
            result=validateValueError.unexceptSearchField(fieldName)
            return result
        }
    }*/
    // if(false===dataTypeCheck.isEmpty(searchParams)){
        for (let singleFieldName in searchParams) {
            let fieldRule
            // console.log(`field`)
            //字段不是外键，则在当前coll中检查
            if(undefined===collFKConfig[singleFieldName]) {
                //3  是否有对应的rule（说明字段在数据库中有定义，而不是notExist的字段）
                if (false === singleFieldName in inputRulesForSearch[collName]) {
                    return validateFormatError.searchParamsFieldNoRelatedRule
                }
/*                //4 普通field的值，是否为array
                if(false===dataTypeCheck.isArray(searchParams[singleFieldName])){
                    return validateFormatError.searchParamsFiledValueMustBeArray
                }*/
                //5 检测是否字段值为空(空的话根本就无需字段了嘛)，无论是否为外键字段，参数格式都是一致的。有server端判断是否为FK，并作出相应的转换
                if(true===dataTypeCheck.isEmpty(searchParams[singleFieldName])){
                    return validateFormatError.searchParamsFiledValueCantEmpty
                }
                fieldRule=inputRulesForSearch[collName][singleFieldName]
                //5 检查searchParams中，单个字段 搜索值的格式
                let singleFiledValueCheckResult=validateSingleSearchParamsFormat(searchParams[singleFieldName],fieldRule)
// console.log(`single search params field result is ${JSON.stringify(singleFiledValueCheckResult)}`)
                if(singleFiledValueCheckResult.rc>0){
                    return singleFiledValueCheckResult
                }
            }else{
                //获得字段的fkconfig，以及其中FK对应的coll和field
                let fieldFKConfig=collFKConfig[singleFieldName]
                let fieldRelatedCollName=fieldFKConfig['relatedColl']
                let fieldRelatedFieldName=fieldFKConfig['relatedFields']
                // console.log(`fieldRelatedCollName: ${fieldRelatedCollName}.  fieldRelatedFieldName:${JSON.stringify(fieldRelatedFieldName)}`)
                //3 外键：检查fkConfig定义了field，但是此field未在inputRule中定义（说明fkConfig的定义有误）
                if(false===singleFieldName in inputRulesForSearch[fieldRelatedCollName]){
                    return validateFormatError.searchParamsFKNoRelatedRule
                }
                //4 fkfield的值，是否为object
                if(false===dataTypeCheck.isObject(searchParams[singleFieldName])){
                    return validateFormatError.searchParamsFKFiledValueMustBeObject
                }
                for(let singleFieldForFK in searchParams[singleFieldName]){
                    //4.1 fk要进一步检查其中对应的fk field是否位于fkConfig的relatedFields中
                    if(-1===collFKConfig[singleFieldName]['relatedFields'].indexOf(singleFieldForFK)){
                        return validateFormatError.searchParamsFKRelatedFieldInvalid
                    }
/*                    //4.2 值必须是array
                    if(false===dataTypeCheck.isArray(searchParams[singleFieldName][singleFieldForFK])){
                        return validateFormatError.searchParamsFKFiledRelatedKeyValueMustBeArray
                    }*/

                    //5 字段值是否为空
                    if(dataTypeCheck.isEmpty(searchParams[singleFieldName][singleFieldForFK])){
                        return validateFormatError.searchParamsFKFiledValueCantEmpty
                    }


                    fieldRule=inputRulesForSearch[fieldRelatedCollName][singleFieldForFK]

                    //5 检查searchParams中，单个字段 搜索值的格式
                    let singleFiledValueCheckResult=validateSingleSearchParamsFormat(searchParams[singleFieldName][singleFieldForFK],fieldRule)
// console.log(`single search params field result is ${JSON.stringify(singleFiledValueCheckResult)}`)
                    if(singleFiledValueCheckResult.rc>0){
                        return singleFiledValueCheckResult
                    }
                }


            }



            /*//普通字段，
            if(!collFKConfig[singleFieldName]){
                //5 调用validateSingleSearchParamsFormat检查冗余字段的值的格式
// console.log(`single search params field is ${JSON.stringify(searchParams[singleFieldName])}`)
                //console.log(`input value rule is ${JSON.stringify(searchParams[singleFieldName])}`)
                let singleFiledValueCheckResult=validateSingleSearchParamsFormat(searchParams[singleFieldName],collInputRules[collName][singleFieldName])
// console.log(`single search params field result is ${JSON.stringify(singleFiledValueCheckResult)}`)
                if(singleFiledValueCheckResult.rc>0){
                    return singleFiledValueCheckResult
                }
            }
            //4.2 是外键，检查是否为对象，且冗余字段是否定义
            if(collFKConfig[singleFieldName]){
/!*                if(false===dataTypeCheck.isObject(searchParams[singleFieldName])){
                    return validateFormatError.searchParamsFKFiledValueNotObject
                }*!/
                let fkConfig=collFKConfig[singleFieldName]
                for(let fkRedundantFieldName in searchParams[singleFieldName]){
                    //4.2.1 外键中的冗余字段是否在inputRule中有对应的rule存在
                    if(false===fkRedundantFieldName in collInputRules[fkConfig['relatedColl']]){
                        return validateFormatError.searchParamsFKNoRelatedRule
                    }
                    //4.2.1 外键中的冗余字段的值是否为空
                    if(true===dataTypeCheck.isEmpty(searchParams[singleFieldName][fkRedundantFieldName])){
                        return validateFormatError.searchParamsFKFiledValueCantEmpty
                    }
                    //5 调用validateSingleSearchParamsFormat检查冗余字段的值的格式
                    let singleFiledValueCheckResult=validateSingleSearchParamsFormat(searchParams[singleFieldName][fkRedundantFieldName],collInputRules[fkConfig['relatedColl']][fkRedundantFieldName])
                    if(singleFiledValueCheckResult.rc>0){
                        return singleFiledValueCheckResult
                    }
                }
            }*/
        }
    // }

    return rightResult
}


/*
 * fieldValue:前提，不为空。必须是
 * 1.数组，2. 不能为空（没有元素），3 长度不能超过限制
 * 4.每个元素必须是对象 5 每个元素的key不能超过2个 6 每个元素必须有value这个key，
 * 7.如果是非字符，那么还必须有compOp这个key   7.2  compOp必须在指定范围内
 *
 * 输入参数：
 * 1 @fieldValue：单个搜索字段的输入值（普通字段或者外键的冗余字段）数组
 * 2 @fieldRule：fieldValue对应的rule
 * */
function validateSingleSearchParamsFormat(fieldValue,fieldRule){
    // let expectKey=["value","compOp"]
    // console.log(`input fieldValue ${JSON.stringify(fieldValue)}`)
    //1 是否为数组
    if (false === dataTypeCheck.isArray(fieldValue)) {
        return validateFormatError.singleSearchParamsValueMustBeArray
    }
// console.log(`is array`)
    //2 数组是否为空
    if (true === dataTypeCheck.isEmpty(fieldValue)) {
        return validateFormatError.singleSearchParamsValueCantEmpty
    }
    //3 数组长度是否超过限制
    if (fieldValue.length > searchSetting.maxKeyNum) {
        return validateFormatError.singleSearchParamsValueLengthExceed
    }
//console.log(`fieldValue is ${fieldValue}`)
    for(let singleElement of fieldValue) {
        /*        console.log(`singleElement is ${singleElement}`)
         console.log(`isobject result is ${dataTypeCheck.isObject(singleElement)}`)*/
        //4. 数组中的每个元素必须是对象
        if (false === dataTypeCheck.isObject(singleElement)) {
            //console.log(`not object is ${singleElement}`)
            return validateFormatError.singleSearchParamsElementMustBeObject
        }
        //5. 数组中的每个元素的key数量不能超过2个（value和compOp）
        if (Object.keys(singleElement).length > Object.keys(e_keyForSearchParams).length) {
            return validateFormatError.singleSearchParamsElementKeysLengthExceed
        }
        //6 元素中的key必须是value或者compOp
        for (let eleKey in singleElement) {
            if (-1=== Object.values(e_keyForSearchParams).indexOf(eleKey)) {
                return validateFormatError.singleSearchParamsElementContainUnexpectKey
            }
        }

        //7. 数组中的每个元素必须有value这个key
        if (false === e_keyForSearchParams.VALUE in singleElement) {
            return validateFormatError.singleSearchParamsElementMissKeyValue
        }
        //8 如果字段是非字符的类型，要有compOp；否则，不能有compOP
// console.log(`fieldRule.type is ${JSON.stringify(fieldRule)}`)
        if (dataType.NUMBER === fieldRule.type || dataType.INT === fieldRule.type || dataType.FLOAT === fieldRule.type || dataType.DATE === fieldRule.type) {
            //7.1 检查是否有compOp
            if (false === e_keyForSearchParams.COMP_OP in singleElement) {
                return validateFormatError.singleSearchParamsElementMissKeyCompOp
            }
            //7.2 compOp的值是否为预定义(gt/lt/eq)之一
            // if(false===singleElement[e_keyForSearchParams.COMP_OP] in e_compOp){
            if (-1 === Object.values(e_compOp).indexOf(singleElement[e_keyForSearchParams.COMP_OP])){
                return validateFormatError.singleSearchParamsElementCompOpWrong
            }

            //7.1 检查不能有compOp
            if (true === e_keyForSearchParams in singleElement) {
                return validateFormatError.singleSearchParamsElementCantContainCompOp
            }
        }

    }
    return rightResult
}


/*
* @inputRulesForSearch：单独定义的inputRule，和inputRule分离。
* 专门for searchParams/filterFieldRule，因为有些server端生成的字段也可以提供给用户查询，同样，有些用户输入的字段无法进行查询
* 整个search inputRule，以便外键使用（外键对应的外表可能是其他表）
* */
/*      对filterFieldValue（为单个字段提供autoComplete的功能） {field1:keyword}  or {fkField:{relatedField:keyword}}     */
/*  说明，只支持{field1:keyword}的格式，至于field是否为外键，通过fkConfig在server端判断
*   被测试的值filterFieldValue，是part FILTER_FIELD的值
* 1. 必须是object
* 2. 必须只有一个key
* 3. value必须赋值
* 4. key必须位于rule中
* 5. value必须是字符/数字/日期，
* */
function validateFilterFieldValueFormat(filterFieldValue,collFKConfig,collName,inputRulesForSearch){
    //1. 必须是object
    if(false===dataTypeCheck.isObject(filterFieldValue)){
        return validateFormatError.filterFieldValueMustBeObject
    }
    //2. 必须只有一个key
    if(1!==Object.keys(filterFieldValue).length){
        return validateFormatError.filterFieldValueFieldNumMustHasOnly1Field
    }
    //只有一个key，所以可以直接取出
    let fieldName=Object.keys(filterFieldValue)[0]
    let realSearchValue //filterFieldValue中包含的搜索值
    //如果是普通字段
    if(!collFKConfig[fieldName]){
        //3 key对应的value必须赋值
        if(false===dataTypeCheck.isSetValue(filterFieldValue[fieldName])){
            return validateFormatError.filterFieldValueNotSet
        }

        //4. key必须位于rule中
        if(false===fieldName in inputRulesForSearch[collName]){
            return validateFormatError.filterFieldValueFieldNotInRule
        }

        realSearchValue=filterFieldValue[fieldName]
    }else{
    //如果是外键
        let relatedColl=collFKConfig[fieldName]['relatedColl']
        let relatedFields=collFKConfig[fieldName]['relatedFields']
        //3.1 判断值是否为object
        if(false===dataTypeCheck.isObject(filterFieldValue[fieldName])){
            return validateFormatError.filterFieldValueFKFieldMustBeObject
        }
        //3.2 此object的key数量必须为1
        if(1!==Object.keys(filterFieldValue[fieldName]).length){
            return validateFormatError.filterFieldValueFKFieldMustHasOnly1Field
        }

        let fkRelatedFieldName=Object.keys(filterFieldValue[fieldName])[0]
        //3.3 此object的key（外键字段）是否在fkconfig中存在（fkconfig的relatedFields设定了允许被关联到fk的字段）
        if(-1===relatedFields.indexOf(fkRelatedFieldName)){
            return validateFormatError.filterFieldValueFKFieldRealtedFKNotDefine
        }
        //3.2 此object的key（外键字段）是否在inputRule中存在
        // console.log(`fkRelatedFieldName ${fkRelatedFieldName}`)
        // console.log(`inputRulesForSearch[relatedColl] ${JSON.stringify(inputRulesForSearch[relatedColl])}`)
        // console.log(`fkRelatedFieldName in inputRulesForSearch[relatedColl] is ${fkRelatedFieldName in inputRulesForSearch[relatedColl]}`)
        if(false===fkRelatedFieldName in inputRulesForSearch[relatedColl]){
            return validateFormatError.filterFieldValueFKFieldNoRelateField
        }
        //4  此object的key（外键字段）的value是否赋值
        if(false===dataTypeCheck.isSetValue(filterFieldValue[fieldName])){
            return validateFormatError.filterFieldValueNotSet
        }


        realSearchValue=filterFieldValue[fieldName][fkRelatedFieldName]
    }

    //5 value必须是数字/字符/日期
    if( false===dataTypeCheck.isStrictNumber(realSearchValue)  && false===dataTypeCheck.isString(realSearchValue)  && false===dataTypeCheck.isDate(realSearchValue)){
        return validateFormatError.filterFieldValueTypeWrong
    }


/*    //5 如果是对象
    if(true===dataTypeCheck.isObject(filterFieldValue[fieldName])){
        //5.1 只能有一个key
        if(1!==Object.keys(filterFieldValue[fieldName]).length){
            return validateFormatError.filterFieldValueFKFieldNumNot1
        }

        let fkFieldName=Object.keys(filterFieldValue[fieldName])[0]
        // console.log(`fkFieldName is ${fkFieldName}`)
        // console.log(`fieldName is ${fieldName}`)
        // console.log(`collFKConfig is ${JSON.stringify(collFKConfig)}`)

        //5.2 此key必须在fkConfig有定义（授权的外键）
        if(false===fieldName in collFKConfig){
            // console.log(`result is ${fieldName in collFKConfig}`)
            return validateFormatError.filterFieldValueFKFieldNotFK
        }
        //5.3 key必须位于fkConfig的forSetValue中
        if(-1===collFKConfig[fieldName]['forSetValue'].indexOf(fkFieldName)){
            return validateFormatError.filterFieldValueFKFieldNoRelateField
        }
        //5.4 value必须是数字/字符
        if(false===dataTypeCheck.isNumber(filterFieldValue[fieldName][fkFieldName]) && false===dataTypeCheck.isInt(filterFieldValue[fieldName][fkFieldName]) && false===dataTypeCheck.isString(filterFieldValue[fieldName][fkFieldName])){
            return validateFormatError.filterFieldValueTypeWrong
        }
    }*/

    return rightResult

}

/*       对static输入的查询参数检查(使用validatePart进行检查)           */
/*function validateStaticInputFormat(values){
    //0 values必须是对像
    if(false===dataTypeCheck.isObject(values)){
        return validateFormatError.staticValuesTypeWrong
    }
    //1 必须包含searchParams，且为对象
    if(false==='searchParams' in values){
        return validateFormatError.staticValuesFormatMissSearchParams
    }
    if(false===dataTypeCheck.isObject(values['searchParams'])){
        return validateFormatError.staticValuesSearchParamsMustBeObject
    }

    //2 必须包含currentPage，且为整数
    if(false==='currentPage' in values){
        return validateFormatError.staticFormatMisCurrentPage
    }
    if(false===dataTypeCheck.isInt(values['currentPage'])){
        return validateFormatError.staticCurrentPageMustBeInt
    }
    return rightResult
}*/

/*/!*          对static的searchParams的结构进行检查        *!/
function validateStaticSearchParamsFormat(searchParams,inputRules){
    if(false===dataTypeCheck.isEmpty(searchParams)){
        //let searchParams=searchParams['searchParams']
        for (let singleFieldName in searchParams) {
            //3  是否有对应的rule（说明字段在数据库中有定义，而不是notExist的字段）
            if(false===singleFieldName in inputRules){
                return validateFormatError.staticSearchParamsFieldNoRelatedRule
            }
            //4 对应字段的搜索值不能为空
            if(true===dataTypeCheck.isEmpty(searchParams[singleFieldName])){
                return validateFormatError.staticSearchParamsFiledValueCantEmpty
            }

        }
    }
    return rightResult
}*/

/*               用于对mixed或者array进行操作
 @inputValue：对象。{fieldName:{from:,to:,eleArrar},fieldName2:{from:,to:,eleArray}}
 @browseInputRule: 对应的coll rule
 * 1. value是否为object
 * 2. singleField是否有对应的rule
 * 2. singleField的类型是否为数组或者mix
 * 2. singleField value中键值的数量是否为2～3之间（from/to必须有一个）
 * 3. singleField value中键值的名称是否validate
 * 4. 如果键数量为2，From/to 必须2者有其一
 *
*   v:{
*       from: 从哪条记录
*       to:    到哪条记录
*       eleArray: 一般array都是外键，所以值为objectId
*       }
                    */
function validateEditSubFieldFormat({inputValue,browseInputRule}){
    // const SUB_FIELD=['from','to','eleArray']
// ap.print('inputValue',inputValue)
    //1. 是否为object
    if(false===dataTypeCheck.isObject(inputValue)){
        return validateFormatError.editSubFieldMustBeObject
    }

    for(let singleFieldName in inputValue){
        //每个字段是否有对应的rule
        if(undefined===browseInputRule[singleFieldName]){
            return validateFormatError.editSubFieldNoRelatedRule
        }

        let singleFieldValue=inputValue[singleFieldName]
        //字段值必须是对象{eleArray:,from:,to:,}
        if(false===dataTypeCheck.isObject(singleFieldValue)){
            return validateFormatError.editSubFieldDataTypeIncorrect
        }

        //2 fieldValue中的字段数量是否正常(2~3个)
        let vKeyLength=Object.keys(singleFieldValue).length
        if(2>vKeyLength || 3<vKeyLength){
            return validateFormatError.editSubFieldKeyNumberWrong
        }
        //3 fieldValue中每个字段名是否为预定义
        for(let singleKey in singleFieldValue){
            if(-1===arr_editSubField.indexOf(singleKey)){
                return validateFormatError.editSubFieldKeyNameWrong
            }
        }
        //4 eleArray必须存在
        if(undefined===singleFieldValue['eleArray']){
            return validateFormatError.eleArrayNotDefine
        }
        //5 如果fieldValue中键数量为2，From/to 必须2者有其一
        if(2===vKeyLength){
            if(true==='from' in singleFieldValue && true==='to' in singleFieldValue){
                return validateFormatError.editSubFieldFromOrToExistOne
            }
        }
    }


    return rightResult
}

/*               用于对array进行操作
 @inputValue：对象。{fieldName:{add:[id1],remove:[id2]:,},fieldName2:{add:[id1],remove:[id2]:,}}
 @browseInputRule: 对应的coll rule
 * 1. value是否为object
 * 2. singleField的name是否有对应的rule
 * 3. singleField的value的类型是否为对象
 * 4. singleField value中键值的数量是否为1～2之间（add/remove必须有一个）
 * 5. singleField value中键值的名称是否validate
*/
function validateManipulateArrayFormat({inputValue,browseInputRule}){
// ap.print('inputValue',inputValue)
    //1. 是否为object
    if(false===dataTypeCheck.isObject(inputValue)){
        return validateFormatError.manipulateArray.manipulateArrayMustBeObject
    }
// ap.inf('inputValue',inputValue)
    for(let singleFieldName in inputValue){
        //2. 每个字段是否有对应的rule
        // ap.inf('singleFieldName',singleFieldName)
        // ap.inf('browseInputRule[singleFieldName]',browseInputRule[singleFieldName])
        if(undefined===browseInputRule[singleFieldName]){
            return validateFormatError.manipulateArray.manipulateArrayNoRelatedRule
        }

        let singleFieldValue=inputValue[singleFieldName]
        //3. 字段值必须是对象{remove:[],add:[]}
        if(false===dataTypeCheck.isObject(singleFieldValue)){
            return validateFormatError.manipulateArray.manipulateArrayFieldValueMustBeObject
        }

        //4 fieldValue中的字段数量是否正常(2~3个)
        let vKeyLength=Object.keys(singleFieldValue).length
        if(1>vKeyLength || 2<vKeyLength){
            return validateFormatError.manipulateArray.manipulateArrayFieldKeyNumberWrong
        }
        //5 fieldValue中每个key（remove/add）名是否为预定义
        for(let singleKey in singleFieldValue){
            if(-1===arr_manipulateOperator.indexOf(singleKey)){
                return validateFormatError.manipulateArray.manipulateArrayFieldKeyNameWrong
            }
        }

    }


    return rightResult
}
/*
* 由于event是server内部处理，所以无需inputRule，只需要（内部产生的）值
*
* 1. eventValue是否为object
* 2. eventValue中键值的数量是否为4～5之间（targetId是optional）
* 3. eventValue中键值的数量是否为4，则targetId不能存在
* 4. eventValue中键值的名称是否validate
*
* @. ev:
* { eventId:enum(int): 			必须。具体的事件，记录在js中，方便查找
* . sourceId: user_ object_id		必须。事件发起人
* . targetId: user_ object_id		可选。受事件影响的人
* . status:  enum				必须。当前事件的状态
* . cDate: 创建时间			必须
* }

 * */
function validateEventFormat(ev){
    //event可能有的field
    // const EVENT_FIELD=['eventId','sourceId','targetId','status','cDate']

    //1. ev是否为object
    if(false===dataTypeCheck.isObject(ev)){
        return validateFormatError.eventMustBeObject
    }
    //2 ev中的字段数量是否正常
    let evKeyLength=Object.keys(ev).length
    if(4>evKeyLength || 5<evKeyLength){
        return validateFormatError.eventKeyNumberWrong
    }
    //3 eventValue中键值的数量是否为4，则targetId不能存在
    if(4===evKeyLength){
        if(true==='targetId' in ev){
            return validateFormatError.eventMandatoryKeyNotExist
        }
    }
    //4 ev中每个字段名是否为预定义
    for(let singleKey in ev){
        if(-1===arr_eventField.indexOf(singleKey)){
            return validateFormatError.eventFieldKeyNameWrong
        }
    }

    return rightResult
}


/*function validateMethodFormat(){

}*/

module.exports={
    validateReqBody,//检查req.body.values是否存在

    validatePartFormat, //检测整个输入是否为object，此输入中的part的value格式是否正确
    validatePartValueFormat,//供validatePartFormat调用

    // validateCUInputFormat,//调用validatePartFormat，检测create/update 输入值的格式
    
    validateCURecordInfoFormat,//对create/update操作的recordInfo进行检查（需要rule配合）
    //validateDelrecordInfoFormat,//对cdelete操作的recordInfo进行检查（只含id，所以无需rule配合） //暂时不需要了，通过单独的part：recorderId来提供id/_id
    validateSingleFieldFormat,//对单个字段进行检查，格式和RecordInfo类似，只是只有一个字段

    // validateSearchInputFormat, //检查总体格式，调用validatePartFormat
    validateSearchParamsFormat,
    validateSingleSearchParamsFormat,

    validateFilterFieldValueFormat, //对ilterFieldValue（为单个字段提供autoComplete的功能） {field1:{value:keyword}} or {billType:{name:{value:keyword}}}
    // validateStaticInputFormat,
    // validateStaticSearchParamsFormat,
    validateEditSubFieldFormat,
    validateEventFormat,

    validateManipulateArrayFormat,
}