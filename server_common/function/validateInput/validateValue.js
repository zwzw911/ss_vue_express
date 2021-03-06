/**
 * Created by wzhan039 on 2017-01-24.
 * 对输入到server端的数据value进行检查（基于inputRule）
 * ×××1. checkSearchValue：对GET方法，通过URL传递search参数进行检测×××
 * 2. validateRecorderInfoValue: 对recorderInfo(可能包含在create/update中)的输入值进行检测（没有拆分，就是一个函数）
 * 3. validateSearchParamsValue：遍历传入的searchParams，然后以字段为单位，调用validateSingleSearchFieldValue进行检测
 * 4. validateSingleSearchFieldValue：以字段为单位检测searchParams输入
 */
// import {dataTypeCheck,genInputError,valueMatchRuleDefineCheck,valueTypeCheck} from './validateHelper'
// import {validateError} from '../../define/error/node/validateError'
// import {e_serverDataType,e_serverRuleType,validatePart as e_validatePart} from '../../define/enum/validEnum'
// import {regex} from '../../define/regex/regex'
// import {coll as e_coll} from '../../define/enum/node'
// import {searchMaxPage} from '../../config/global/globalSettingRule'
"use strict";
const ap=require('awesomeprint')

const validateHelper=require('./validateHelper')
const dataTypeCheck=validateHelper.dataTypeCheck
const genInputError=validateHelper.genInputError
// const genRequireInputError=validateHelper.genRequireInputError
const valueMatchRuleDefineCheck=validateHelper.valueMatchRuleDefineCheck
// const ruleTypeMatchRuleDefineCheck=validateHelper.ruleTypeMatchRuleDefineCheck
const valueTypeCheck=validateHelper.valueTypeCheck

const validateError=require('../../constant/error/validateError')
const validateValueError=validateError.validateValue
// const validateFormatError=validateError.validateFormat

const inputDataRuleType=require('../../constant/enum/inputDataRuleType')
const e_serverDataType=inputDataRuleType.ServerDataType
const e_serverRuleType=inputDataRuleType.ServerRuleType
const e_otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const e_applyRange=inputDataRuleType.ApplyRange
// const e_requireType=inputDataRuleType.RequireType
// const  e_validatePart=require('../../constant/enum/nodeEnum').ValidatePart
const nodeEnum=require('../../constant/enum/nodeEnum')
const e_inputFieldCheckType=nodeEnum.InputFieldCheckType
const e_chooseFriendInfoFieldName=nodeEnum.ChooseFriendInfoFieldName
// const e_method=require('../../constant/enum/nodeEnum').Method

const regex=require('../../constant/regex/regex').regex

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const globalConfiguration=require('../../constant/config/globalConfiguration')
const searchMaxPage=globalConfiguration.searchMaxPage

const profileConfiguration=require('../../constant/config/profileConfiguration').profileConfiguration
const rightResult={rc:0}

const e_eventStatus=require('../../constant/enum/mongoEnum').EventStatus
// const arr_eventField=require('../../constant/define/node').EVENT_FIELD

/**         公共函数            **/
const dataType=require('../../function/assist/dataType')

/*  对传入格式为{field1:value1,field1:value1}的part进行检查；一般是recordInfo
 * @inputValue:{username::xxx,password:yyy} 由调用函数保证输入参数的格式正确
 * @collRules： 可以是browser或者internal；browser的时候，对client输入（recordInfo）进行检查，internal，对internal产生的数据检查
 * @p_applyRange: 当前是哪种操作（applyRange）
 * return:
 * 返回值有2种：一种是严重错误（出错后，字段的值是否符合rule已经无关紧要）使用common：{rc:xxx,msg:yyy}，另外一种是对全部输入的field都进行检查，返回{field1:{rc:xxx,msg,yyy},field2:{rc:zzz,msg:aaa}}
 *
 * step；
 * 1. 字段的require检查
 * 2. 如果字段数据类型是数据，执行ARRAY_MAX/MIN_LENGTH检查
 * 3. 如果字段有值，调用validateSingleRecorderFieldValue，对单个字段的值进行检查
 * */
function validateScalarInputValue({inputValue,collRule,p_applyRange}){
    let rc={}
    //itemName: 字段名称
    // ap.inf('inputValue',inputValue)
    // ap.inf('p_applyRange',p_applyRange)
    // ap.inf('collRule',collRule)
    for (let fieldName in collRule ){


        // ap.inf('fieldName',fieldName)
        let requireRule=collRule[fieldName][e_serverRuleType.REQUIRE]
// ap.inf('requireRule',requireRule)
        //如果require中，没有对对应的applyRange做定义，说明此字段不能在当前applyRange中出现
        // ap.inf('fieldName',fieldName)
        // ap.inf('require rule',requireRule)
        if(undefined===requireRule['define'][p_applyRange]){
            if(true===dataTypeCheck.isSetValue(inputValue[fieldName])  ){
                rc[fieldName]=validateValueError.fieldValueShouldNotExistSinceNoRelateApplyRange({fieldName:fieldName,applyRange:p_applyRange})
                continue
            }
        }
        let requireDefine=requireRule['define'][p_applyRange]


        if(true===requireDefine){
            if(false===dataTypeCheck.isSetValue(inputValue[fieldName])  ){
                rc[fieldName]= genInputError(collRule[fieldName],e_serverRuleType.REQUIRE)  //require错误，返回字段require对应的rc，而不是返回一个common rc（mandatoryFieldMiss）
                // console.log(`validate result of created is ${JSON.stringify(rc)}`)
                // return rc
                continue
            }
        }
        /*if(requireDefine===e_requireType.FORBID){
            if(true===dataTypeCheck.isSetValue(inputValue[fieldName])  ){
                rc[fieldName]= genRequireInputError({requireRule:requireRule,p_applyRange:p_applyRange})  //require错误，返回字段require对应的rc，而不是返回一个common rc（mandatoryFieldMiss）
                // console.log(`validate result of created is ${JSON.stringify(rc)}`)
                // return rc
                continue
            }
        }*/

        //value中对应的字段是有的，才进行检测
        if(undefined!==inputValue[fieldName]){
            //只有输入的字段有对应的值，才预先设置rc:0（防止对rule中所有字段都设置rc:0）
            rc[fieldName]={rc:0}
            // console.log(`inputValue[fieldName]['value'] is ${JSON.stringify(inputValue[fieldName]['value'])}`)
            // console.log(`before validate result of single field is ${JSON.stringify(inputValue[fieldName]['value'])}`)
            // 输入的值默认要去掉头尾空白后在处理
            if(true===dataTypeCheck.isString(inputValue[fieldName])){
                inputValue[fieldName]=inputValue[fieldName].trim()
            }
            let fieldValue=inputValue[fieldName]
            let fieldRule=collRule[fieldName]

            let fieldType=collRule[fieldName][e_otherRuleFiledName.DATA_TYPE]
            // ap.inf('fieldName',fieldName)
            // ap.inf('fieldType',fieldType)
            //数组需要额外检查
            if(true===dataTypeCheck.isArray(fieldType)){
                // console.log(`field ${fieldName} is array`)
                //首先检查数据类型是不是array
                // ap.inf('fieldValue',fieldValue)
                if(false===dataTypeCheck.isArray(fieldValue)){
                    rc[fieldName]=validateValueError.CUDTypeWrong
                    // ap.inf('rc',rc)
                    continue
                }
                // console.log(`1`)
                // console.log(`fieldRule=======>${JSON.stringify(fieldRule)}`)
                // console.log(`${JSON.stringify(fieldRule[e_serverRuleType.ARRAY_MIN_LENGTH])}`)
                //检查array的长度位于ARRAY_MIN_LENGTH和ARRAY_MAX_LENGTH
                if(undefined!==fieldRule[e_serverRuleType.ARRAY_MIN_LENGTH] && undefined!==fieldRule[e_serverRuleType.ARRAY_MIN_LENGTH]['define']){
                    if(fieldValue.length<fieldRule[e_serverRuleType.ARRAY_MIN_LENGTH]['define']){
                        rc[fieldName]=genInputError(fieldRule,e_serverRuleType.ARRAY_MIN_LENGTH)
                        continue
                    }
                }
                // console.log(`2`)
                if(undefined!==fieldRule[e_serverRuleType.ARRAY_MAX_LENGTH] && undefined!==fieldRule[e_serverRuleType.ARRAY_MAX_LENGTH]['define']){
                    if(fieldValue.length>fieldRule[e_serverRuleType.ARRAY_MAX_LENGTH]['define']){
                        rc[fieldName]=genInputError(fieldRule,e_serverRuleType.ARRAY_MAX_LENGTH)
                        continue
                    }
                }
// ap.inf('fieldValue.length',fieldValue.length)
                //预先检查数组中每个元素都是有意义的值，非null或者undefined,然后将单个元素传入函数validateSingleRecorderFieldValue进行检查
                for(let singleFieldValue of fieldValue){
                    // console.log(`singleFieldValue=========>${JSON.stringify(singleFieldValue)}`)
                    // console.log(` dataTypeCheck.isSetValue(singleFieldValue)=========>${JSON.stringify( dataTypeCheck.isSetValue(singleFieldValue))}`)
                    //每个元素不能是null或者undefined
                    if(false===dataTypeCheck.isSetValue(singleFieldValue)){
                        ap.inf('1')
                        rc[fieldName]['rc']=validateValueError.CUDTypeWrong.rc
                        rc[fieldName]['msg']=`${fieldRule['chineseName']}${validateValueError.CUDTypeWrong.msg}`
                        break
                    }
                    // console.log(`typeof singleFieldValue=========>${JSON.stringify(typeof singleFieldValue)}`)
                    let tmpRc=validateSingleRecorderFieldValue({fieldValue:singleFieldValue,fieldRule:fieldRule,applyRange:p_applyRange})
                    // ap.inf('tmprc',tmpRc)
                    if(tmpRc.rc>0){
                        rc[fieldName]=tmpRc
                        break
                    }
                }

            }else{
                // console.log(`2`)
                rc[fieldName]=validateSingleRecorderFieldValue({fieldValue:fieldValue,fieldRule:fieldRule,applyRange:p_applyRange})
                // console.log(`2 result is ${JSON.stringify(rc)}` )
            }
            // console.log(`validate result of single field is ${JSON.stringify(rc)}`)
        }

    }
    // ap.wrn('rc',rc)
    return rc
//    注意，返回的结果是对象，结构和inputValue类似，不是{rc;xxx,msg:xxx}的格式
}


/*          对一条记录的单个字段的值进行检查（字段必须有对应的rule，且不是equalTo）
 *           因为记录要存储到db，所以field的值必须严格的符合field对应的所有rule
 *           _id/id，以及equalTo要用单独的函数进行判断
 * param：
 * 1. fieldValue; 单个字段的值
 * 2. fieldRule：单个字段对应的rule
 *
 * step:
 * 1. require默认已经检查过，且fieldValue不为空
 * 2. 有值的话，检查值的类型是否和rule中定义的type匹配
 * 2. 如果有objectId或者regexp，首先用此检测
 * 3. 检查maxLength，防止输入过大
 * 4. 检查enum
 * 5. 检查剩余rule
 *
 * */
function validateSingleRecorderFieldValue({fieldValue,fieldRule,applyRange}){
    let rc={rc:0}
    let chineseName=fieldRule['chineseName']

    //update的时候，允许传入null，表明需要删除字段值
    if(e_applyRange.UPDATE_SCALAR===applyRange && null===fieldValue){
        return rightResult
    }
    //2 检查value的类型是否符合type中的定义
    let valueTypeCheckResult
    // console.log(`fieldRule is ${JSON.stringify(fieldRule)}`)
// ap.inf('fieldValue',fieldValue)
//     ap.inf('fieldRule[e_otherRuleFiledName.DATA_TYPE]',fieldRule[e_otherRuleFiledName.DATA_TYPE])
    if(dataTypeCheck.isArray(fieldRule[e_otherRuleFiledName.DATA_TYPE])){
        valueTypeCheckResult= valueTypeCheck(fieldValue,fieldRule[e_otherRuleFiledName.DATA_TYPE][0])
    }else{
        valueTypeCheckResult= valueTypeCheck(fieldValue,fieldRule[e_otherRuleFiledName.DATA_TYPE])
    }
    // ap.inf('valueTypeCheckResult',valueTypeCheckResult)
    // ap.inf('fieldRule[e_otherRuleFiledName.DATA_TYPE]',fieldRule[e_otherRuleFiledName.DATA_TYPE])
    // ap.inf('fieldValue',fieldValue)
    // ap.inf('fieldValue type',typeof fieldValue)
    // ap.inf('valueTypeCheckResult',valueTypeCheckResult)
    // ap.inf('fieldValue',fieldValue)
    // ap.inf('fieldRule',fieldRule)
    if(valueTypeCheckResult.rc && 0<valueTypeCheckResult.rc){
        rc['rc']=valueTypeCheckResult.rc
        rc['msg']=`${chineseName}${valueTypeCheckResult.msg}`
        return rc
    }
    if(false===valueTypeCheckResult){
        // ap.inf('in')
        rc['rc']=validateValueError.CUDTypeWrong.rc
        rc['msg']=`${chineseName}${validateValueError.CUDTypeWrong.msg}`
        return rc
    }

    //3 如果有format，直接使用format,如果正确，还要继续其他的检测，例如：数字的格式检查完后，还要判断min和max.
    if(fieldRule[e_serverRuleType.FORMAT] && fieldRule[e_serverRuleType.FORMAT]['define']){
        let formatDefine=fieldRule[e_serverRuleType.FORMAT]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.FORMAT,fieldValue:fieldValue,ruleDefine:formatDefine})){
            return genInputError(fieldRule,e_serverRuleType.FORMAT)
        }else{
            //如果是objectId，通过format check后，后续rule无需检测，直接返回rc:0
            if(regex.objectId===fieldRule[e_serverRuleType.FORMAT]['define']){
                return rightResult
            }
        }
    }

    //4 如果有maxLength属性，首先检查（防止输入的参数过于巨大）
    if(fieldRule[e_serverRuleType.MAX_LENGTH] && fieldRule[e_serverRuleType.MAX_LENGTH]['define']){
        let maxLengthDefine=fieldRule[e_serverRuleType.MAX_LENGTH]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MAX_LENGTH,fieldValue:fieldValue,ruleDefine:maxLengthDefine})){
            return genInputError(fieldRule,e_serverRuleType.MAX_LENGTH)
        }
        //继续往下检查其他rule
    }

    //5 检查enum
    if(fieldRule[e_serverRuleType.ENUM] && fieldRule[e_serverRuleType.ENUM]['define']){
        let enumDefine=fieldRule[e_serverRuleType.ENUM]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ENUM,fieldValue:fieldValue,ruleDefine:enumDefine})){
            return genInputError(fieldRule,e_serverRuleType.ENUM)
        }
    }

    //6 检查除了require/format(objectId)/maxLength/enum之外的每个rule进行检测
    //已经预检过的rule
    let alreadyCheckedRule=[e_serverRuleType.REQUIRE,e_serverRuleType.FORMAT,e_serverRuleType.MAX_LENGTH,e_serverRuleType.ENUM]
    //非rule的key;value对()
    let nonRuleKey=[e_otherRuleFiledName.DATA_TYPE,e_otherRuleFiledName.CHINESE_NAME,e_otherRuleFiledName.APPLY_RANGE]
    //无需检测的rule
    let ignoreRule=[]
    //合并需要skip的rule或者key
    let skipKey=alreadyCheckedRule.concat(alreadyCheckedRule,nonRuleKey,ignoreRule)
    for(let singleItemRuleName in fieldRule){
        if(-1!==skipKey.indexOf(singleItemRuleName)){
            continue
        }
        // console.log(`allow check rule is ${singleItemRuleName}`)
        // if('chineseName'!==singleItemRuleName && 'default'!==singleItemRuleName && 'type'!==singleItemRuleName && 'unit'!== singleItemRuleName){
        let ruleDefine=fieldRule[singleItemRuleName]['define']
        switch (singleItemRuleName){
            case e_serverRuleType.MIN_LENGTH:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MIN_LENGTH,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.MIN_LENGTH)
                }
                break;
            case e_serverRuleType.EXACT_LENGTH:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.EXACT_LENGTH,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.EXACT_LENGTH)
                }
                break;
            case e_serverRuleType.MAX:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MAX,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.MAX)
                }
                break;
            case e_serverRuleType.MIN:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MIN,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.MIN)
                }
                break;
            default: //未知的rule就不进行任何检测了
                // ap.err('unknown rule',singleItemRuleName)
                // console.log(`unknown ruel ${singleItemRuleName}`)
            //其他的rule，要么已经检测过了，要么是未知的，不用检测。所以default不能返回任何错误rc（前面检测过的rule可能进入default）
            // return validateValueError.unknownRuleType
        }
    }
// console.log(`test tset`)
    return rightResult
}
/*
* 根据rule，验证单个字段值（不包含require，默认是有值，一般用于url中query string的检查）
* 其中，字符的MIN_LENGTH必须排除（因为即使查询字符长度小于MIN_LENGTH，也是合法的查询字符）
*/
function validateSingleValueForSearch({fieldValue,fieldRule}){
    let rc={rc:0}
    let chineseName=fieldRule['chineseName']


    //2 检查value的类型是否符合type中的定义
    let valueTypeCheckResult

    if(dataTypeCheck.isArray(fieldRule[e_otherRuleFiledName.DATA_TYPE])){
        valueTypeCheckResult= valueTypeCheck(fieldValue,fieldRule[e_otherRuleFiledName.DATA_TYPE][0])
    }else{
        valueTypeCheckResult= valueTypeCheck(fieldValue,fieldRule[e_otherRuleFiledName.DATA_TYPE])
    }

    if(valueTypeCheckResult.rc && 0<valueTypeCheckResult.rc){
        rc['rc']=valueTypeCheckResult.rc
        rc['msg']=`${chineseName}${valueTypeCheckResult.msg}`
        return rc
    }
    if(false===valueTypeCheckResult){
        // ap.inf('in')
        rc['rc']=validateValueError.CUDTypeWrong.rc
        rc['msg']=`${chineseName}${validateValueError.CUDTypeWrong.msg}`
        return rc
    }

    //3 如果有format，直接使用format,如果正确，还要继续其他的检测，例如：数字的格式检查完后，还要判断min和max.
    if(fieldRule[e_serverRuleType.FORMAT] && fieldRule[e_serverRuleType.FORMAT]['define']){
        let formatDefine=fieldRule[e_serverRuleType.FORMAT]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.FORMAT,fieldValue:fieldValue,ruleDefine:formatDefine})){
            return genInputError(fieldRule,e_serverRuleType.FORMAT)
        }else{
            //如果是objectId，通过format check后，后续rule无需检测，直接返回rc:0
            if(regex.objectId===fieldRule[e_serverRuleType.FORMAT]['define']){
                return rightResult
            }
        }
    }

    //4 如果有maxLength属性，首先检查（防止输入的参数过于巨大）
    if(fieldRule[e_serverRuleType.MAX_LENGTH] && fieldRule[e_serverRuleType.MAX_LENGTH]['define']){
        let maxLengthDefine=fieldRule[e_serverRuleType.MAX_LENGTH]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MAX_LENGTH,fieldValue:fieldValue,ruleDefine:maxLengthDefine})){
            return genInputError(fieldRule,e_serverRuleType.MAX_LENGTH)
        }
        //继续往下检查其他rule
    }

    //5 检查enum
    if(fieldRule[e_serverRuleType.ENUM] && fieldRule[e_serverRuleType.ENUM]['define']){
        let enumDefine=fieldRule[e_serverRuleType.ENUM]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ENUM,fieldValue:fieldValue,ruleDefine:enumDefine})){
            return genInputError(fieldRule,e_serverRuleType.ENUM)
        }
    }

    //6 检查除了require/format(objectId)/maxLength/enum之外的每个rule进行检测
    //已经预检过的rule
    let alreadyCheckedRule=[e_serverRuleType.REQUIRE,e_serverRuleType.FORMAT,e_serverRuleType.MAX_LENGTH,e_serverRuleType.ENUM]
    //非rule的key;value对()
    let nonRuleKey=[e_otherRuleFiledName.DATA_TYPE,e_otherRuleFiledName.CHINESE_NAME,e_otherRuleFiledName.APPLY_RANGE]
    //无需检测的rule
    let ignoreRule=[]
    //合并需要skip的rule或者key
    let skipKey=alreadyCheckedRule.concat(alreadyCheckedRule,nonRuleKey,ignoreRule)
    for(let singleItemRuleName in fieldRule){
        if(-1!==skipKey.indexOf(singleItemRuleName)){
            continue
        }
        // console.log(`allow check rule is ${singleItemRuleName}`)
        // if('chineseName'!==singleItemRuleName && 'default'!==singleItemRuleName && 'type'!==singleItemRuleName && 'unit'!== singleItemRuleName){
        let ruleDefine=fieldRule[singleItemRuleName]['define']
        switch (singleItemRuleName){
/*            case e_serverRuleType.MIN_LENGTH:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MIN_LENGTH,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.MIN_LENGTH)
                }
                break;*/
            case e_serverRuleType.EXACT_LENGTH:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.EXACT_LENGTH,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.EXACT_LENGTH)
                }
                break;
            case e_serverRuleType.MAX:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MAX,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.MAX)
                }
                break;
            case e_serverRuleType.MIN:
                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MIN,fieldValue:fieldValue,ruleDefine:ruleDefine})){
                    return genInputError(fieldRule,e_serverRuleType.MIN)
                }
                break;
            default: //未知的rule就不进行任何检测了
            // ap.err('unknown rule',singleItemRuleName)
            // console.log(`unknown ruel ${singleItemRuleName}`)
            //其他的rule，要么已经检测过了，要么是未知的，不用检测。所以default不能返回任何错误rc（前面检测过的rule可能进入default）
            // return validateValueError.unknownRuleType
        }
    }

    return rightResult
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */



// searchParamValue 的check已经由文件validateSearchFormat下的2个函数arrayValueStringLogicCheck/arrayValueDigitLogicCheck 完成

/*/!*
 * 对输入的查询 参数进行 检验，不对输入进行任何修改（即，如果参数的值不符合要求，直接报错，而不是试着更正。如此可以防止恶意输入）
 * 分成3个函数，好处是层次清楚：
 *       主函数负责把输入拆解成field:[{value:xx,compOp:'gt'},{value:yyy,compOp:'lt'}]的格式，
 *       中间函数负责遍历value中的每个元素（value是数组，其中每个元素是object）。
 *       每个元素的值最终通过checkSingleSearchValue进行判别
 * 输入参数：
 *           1.searchParams
 *           name:[{value:'name1'},{value:'name2'}],
 age:[{value:18,compOp:'gt'},{value:20,compOp:'eq'}],
 parentBillType:
 {
 name:[{value:'asdf'},{value:'fda'}],
 age:[{value:12, compOp:'gt'}, {value:24, compOp:'lt'}]
 }
 }
 *           client传入的搜索参数，以coll为单位。因为使用独立的函数进行处理，所以可以和validateInput的输入参数不一致.如此可以简化对格式的检查步骤
 *           2. fkconfig：：{parentBillType:{relatedColl:billtye, forSetValue:['name']}}
 *           搜索参数，如果有外键，从中获得外键对应的coll.field，查询得知对应inputRule。以coll为单位
 *           3. collName
 *           当前对哪一个coll进行搜索
 *           4 inputRules
 *           整个inputRule，因为外键可能对应在其他coll
 * 返回: {field1:{rc:0},field2:{rc:9123.msg:'值不正确'}}
 * *!/
function validateSearchParamsValue(searchParams,fkConfig,collName,inputRules){
    let result={}

    //如果搜索参数是空object，直接返回rc：0
    if(0===Object.keys(searchParams).length){
        return rightResult
    }

    // console.log(`searchParams arams is ${JSON.stringify(searchParams)}`)
    for(let singleFieldName in searchParams){

        // console.log(`singleFieldName  is ${JSON.stringify(searchParams[singleFieldName])}`)

        let fieldRule //如果是外键的话，需要重fkconfig读取对应coll-field，以便重定向对应的rule
        //如果是普通字段
        if (undefined === fkConfig[singleFieldName]) {
            // console.log(  `not fk field `  )
            //普通字段和外加字段的格式不同
            //{name:[{value:xxx}]}
            if(undefined!==searchParams[singleFieldName]){
                // console.log(  `searchParams[singleFieldName] is ${JSON.stringify(searchParams[singleFieldName])} `  )
                let fieldValue=searchParams[singleFieldName]
                fieldRule=inputRules[collName][singleFieldName]
                // console.log(  `bfrowe validateSingleSearchFieldValue `  )
                result[singleFieldName]=validateSingleSearchFieldValue(fieldValue,fieldRule)
                // console.log(  `validateSingleSearchFieldValue is ${JSON.stringify(result[singleFieldName])}`  )
                //经过检测后，如果搜索值为空，则对应的搜索字段可以删除（以便减轻搜索值处理的cost）
                if(fieldValue.length===0){
                    delete searchParams[singleFieldName]
                }
            }

        }
        //如果是外键字段
        if (undefined!==fkConfig[singleFieldName]) {
            let fieldFkConfig=fkConfig[singleFieldName]
            //遍历当前字段岁对应的所有外键字段
            if(undefined!==searchParams[singleFieldName]){
                for(let fkRedundantFieldName in searchParams[singleFieldName]){
                    //普通字段和外加字段的格式不同
                    ////{parentBillType:{name:[{value:xxx}]}}

                    let fieldValue=searchParams[singleFieldName][fkRedundantFieldName]
                    fieldRule=inputRules[fieldFkConfig['relatedColl']][fkRedundantFieldName]
                    result[singleFieldName]={}
                    result[singleFieldName][fkRedundantFieldName]=validateSingleSearchFieldValue(fieldValue,fieldRule)
                    //经过检测后，如果搜索值为空，则对应的搜索字段可以删除（以便减轻搜索值处理的cost）
                    if(fieldValue.length===0){
                        // searchParams[singleFieldName][fkRedundantFieldName]=undefined
                        delete searchParams[singleFieldName][fkRedundantFieldName]
                    }
                }
            }

            // console.log(`after field name ${JSON.stringify(singleFieldName)}`)
            // console.log(`after field value chec ${JSON.stringify(searchParams[singleFieldName])}`)
            // console.log(`after field value chec ${searchParams[singleFieldName].toString()}`)
            // console.log(`after field value  ${JSON.stringify(Object.keys(searchParams[singleFieldName]))}`)
            // console.log(`after field value length ${JSON.stringify(Object.keys(searchParams[singleFieldName]).length)}`)
            if(Object.keys(searchParams[singleFieldName]).length===0){
                // searchParams[singleFieldName]=undefined
                delete searchParams[singleFieldName]
            }
        }

    }
    //检查完所有的field后，才返回
    return result
}


//对单个字段（普通和外键的冗余字段）进行遍历，为其中的每个元素进行检查
//fieldValue：每个字段对应的值，为数组(数组中的每个元素是一个对象，对应此字段一个搜索条件)
//singleFieldRule：此字段的rule
//对单个字段（普通和外键的冗余字段）进行遍历，为其中的每个元素调用checkSingleSearchValue
function validateSingleSearchFieldValue(fieldValue,fieldRule){
    // console.log(`fieldvalue is ${JSON.stringify(fieldValue)}`)
    //采用idx，以便可以删除超出范围的搜索值
    for(let idx in fieldValue){
        let singleSearchElement=fieldValue[idx]
        // let singleElement=singleSearchElement
        let result=_validateSingleSearchElementValue(singleSearchElement,fieldRule)
        //超出maxLength，则直接删除搜索值而不报错（搜索可以继续）
        // console.log(`result tt is ${JSON.stringify(result)}`)
        // console.log(`rule tt is ${JSON.stringify(fieldRule[e_serverRuleType.MAX_LENGTH])}`)
        if( fieldRule[e_serverRuleType.MAX_LENGTH] &&result.rc===fieldRule[e_serverRuleType.MAX_LENGTH]['error']['rc']){
            fieldValue.splice(idx,1)
            continue
/!*            //删除搜索值之后，如果为空数组，则把对应的field也删除
            if(fieldValue.length===0){
                fieldValue=undefined
                break
            }*!/
        }
        //其他错误（例如空值），返回client（搜索不继续）
        if(result.rc>0){
            return result
        }
    }
    return {rc:0}
}


//需要单独定义成一个函数，在提供autoCoplete的时候，需要对单个搜索值（字符串）进行判断，就是用此函数
//searchElement: 要检查的元素，如果是是指或者日期，可能还有比较符号{value:xxx,CompOp:'yy'}（字符/数字/日期，非数组或者对象）
//singleFieldRule： 对应的rule定义
/!*  对单个搜索值进行检测，和validateSingleRecorderInfoValue不同在于：如果不符合enum/min/max/maxLength/format，返回rc，告知删除此搜索值（因为不在范围内，肯定没有对应记录）
*params
* 1. searchValue： 待检测的值
* 2, fieldRule：对应的搜索rule
*
* step：
* 1. 检测是否为undefined或者null或者空字符，是：返回rc，告知删除  validateValueError.SValueEmpty
* 2. 类型是否匹配，不匹配，返回rc，告知错误(2种返回值，不匹配；未知类型)  validateValueError.STypeWrong/validateHelperError.unknownDataType
* 3. objectId/format/maxLength/enum，不符合，返回错误，maxlength返回删除
* 4.  XXXXXXXmaxLength/min/max：不符合，删除XXXXXXXX   数值比较超出范围无所谓
* *!/
function _validateSingleSearchElementValue(searchElement,fieldRule){
    // console.log(`function checkSingleSearchValue called`)
    let searchValue=searchElement['value']
    

    return _validateSingleSearchValue(searchValue,fieldRule)
}

//直接对值进行检查
function _validateSingleSearchValue(searchValue,fieldRule){
    let chineseName=fieldRule['chineseName']
    let rc={rc:0}
// console.log(`searchvalue is ${JSON.stringify(searchValue)}`)
//     console.log(`dataTypeCheck.isSetValue(searchValue) is ${JSON.stringify(dataTypeCheck.isSetValue(searchValue))}`)
//     console.log(`dataTypeCheck.isEmpty(searchValue) is ${JSON.stringify(dataTypeCheck.isEmpty(searchValue))}`)
    //1. 检测是否为undefined或者null或者空字符，是：返回删除
    if(false===dataTypeCheck.isSetValue(searchValue) || true===dataTypeCheck.isEmpty(searchValue)){
        // console.log(`error reutn`)
        return validateValueError.SValueEmpty
    }
    //2 检查value的类型是否符合type中的定义，错误返回
    //  console.log(`data is ${singleSearchString}`)
    //   console.log(`data type is ${singleFieldRule[e_otherRuleFiledName.DATA_TYPE].toString()}`)

    let typeCheckResult = valueTypeCheck(searchValue,fieldRule[e_otherRuleFiledName.DATA_TYPE])
    //console.log(`data type check result is ${JSON.stringify(typeCheckResult)}`)
    if(typeCheckResult.rc && 0<typeCheckResult.rc){
        //当前字段值的类型未知
        rc['rc']=typeCheckResult.rc
        rc['msg']=`${chineseName}${typeCheckResult.msg}`
        return rc
    }
    if(false===typeCheckResult){
        rc['rc']=validateValueError.STypeWrong.rc
        rc['msg']=`${chineseName}${validateValueError.STypeWrong.msg}`
        return rc
    }

    //3 objectId/format/maxLength/enum
    //3 如果类型是objectId(有对应inputRule定义，主要是外键)，直接判断（而无需后续的检测，以便加快速度），错误返回
    if(e_serverDataType.OBJECT_ID===fieldRule[e_otherRuleFiledName.DATA_TYPE] ){
        if(false===fieldRule[e_serverRuleType.FORMAT]['define'].test(searchValue)){
            rc['rc']=fieldRule[e_serverRuleType.FORMAT]['error']['rc']
            rc['msg']=genInputError(fieldRule,e_serverRuleType.FORMAT)
            return rc
        }
    }

    //3.2 如果有format，直接使用format(其后的各种rule不用继续检查),错误返回
    // console.log(`current rule is ${JSON.stringify(currentItemRule)}`)
    if(fieldRule[e_serverRuleType.FORMAT] && fieldRule[e_serverRuleType.FORMAT]['define']){
        let formatDefine=fieldRule[e_serverRuleType.FORMAT]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.FORMAT,fieldValue:searchValue,ruleDefine:formatDefine})){
            rc['rc']=fieldRule[e_serverRuleType.FORMAT]['error']['rc']
            rc['msg']=genInputError(fieldRule,e_serverRuleType.FORMAT)
            return rc
        }
    }

    //3.3 如果有maxLength，先检测maxLength，错误删除
    if(fieldRule[e_serverRuleType.MAX_LENGTH] && fieldRule[e_serverRuleType.MAX_LENGTH]['define']){
        let ruleDefine=fieldRule[e_serverRuleType.MAX_LENGTH]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.MAX_LENGTH,fieldValue:searchValue,ruleDefine:ruleDefine})){
            // console.log(`fieldRule is ${JSON.stringify(fieldRule)}`)
            rc['rc']=fieldRule[e_serverRuleType.MAX_LENGTH]['error']['rc']
            rc['msg']=genInputError(fieldRule,e_serverRuleType.MAX_LENGTH)
            return rc
            // result[singleFieldName]['rc']=currentRule['error']['rc']
            // result[singleFieldName]['msg']=genInputError.maxLength(currentRule['chineseName'],currentRuleDefine,false)
        }
    }


    //3.4 如果是enum，错误返回
    if(fieldRule[e_serverRuleType.ENUM] && fieldRule[e_serverRuleType.ENUM]['define']){
        let enumDefine=fieldRule[e_serverRuleType.ENUM]['define']
        if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ENUM,fieldValue:searchValue,ruleDefine:enumDefine})){
            rc['rc']=fieldRule[e_serverRuleType.ENUM]['error']['rc']
            rc['msg']=genInputError(fieldRule,e_serverRuleType.ENUM)
            return rc
        }
    }

    return rc
}*/

/**     暂时不需要       **/
/*              为单个字段（不仅仅是fk的name）提供autoComplete            */
/*  field是否为FK，通过查询fkconfig
* 输入格式如下，xxxx只能接受字符/数字/日期
*       {field:xxxx}
*
* params:
* 1. part: filterFieldValue的值
* 3. collName：当前是对哪个coll操作
* 2. inputRule： 所有的rule（可能有外键）
* step
* 1. 判断是否object
* 2. 是object，再次读取object的value，并读取对应的rule
* 3. 赋值给变量，传递给_validateSingleSearchElementValue判断
* */
function validateFilterFieldValue(filterFieldValue,collFkConfig,collName,inputRule){
    let fieldName=Object.keys(filterFieldValue)[0]
    let result,fieldRule
    let fieldValue

    //普通字段查询
    if(false===fieldName in collFkConfig){
        fieldRule=inputRule[collName][fieldName]
        fieldValue=filterFieldValue[fieldName]

        //如果fieldValue是空，说明要返回所有字段值
        if(''===fieldValue){
            return rightResult
        }
    }
    //外键字段查询
    else{
        //获得fielterFieldValue中传入的对应外键字段值     {fkField:{relatedField:'asdf'}}
        let fkFieldsName=Object.keys(filterFieldValue[fieldName])[0]
        // console.log(`fkFieldsName is ${JSON.stringify(fkFieldsName)}`)
        let fkColl=collFkConfig[fieldName]['relatedColl']
        // let fkValue=value[fkFieldName]
        fieldValue=filterFieldValue[fieldName][fkFieldsName]

        //如果fieldValue是空，说明要返回所有字段值
        if(''===fieldValue){
            return rightResult
        }
        fieldRule=inputRule[fkColl][fkFieldsName]
    }
    // console.log(`value to be check is ${JSON.stringify(fieldValue)}`)
    // console.log(`fieldRule is ${JSON.stringify(fieldRule)}`)
/*    result=_validateSingleSearchValue(fieldValue,fieldRule)
    // console.log(` field value with rule check is ${JSON.stringify(result)}`)

    //maxLength/min/max，则直接返回空数组
    if( (fieldRule[e_serverRuleType.MAX_LENGTH] &&result.rc===fieldRule[e_serverRuleType.MAX_LENGTH]['error']['rc']) ||
        (fieldRule[e_serverRuleType.MAX] &&result.rc===fieldRule[e_serverRuleType.MAX]['error']['rc']) ||
        (fieldRule[e_serverRuleType.MIN] &&result.rc===fieldRule[e_serverRuleType.MIN]['error']['rc'])){
        //返回这个错误，说明无需执行 搜索 操作，直接返回空数组即可（）
        return validateValueError.filterFieldValueOutRange
    }*/

    return result
}

/*            检测static的搜索参数的格式          */
//验证是否为日期即可，无需范围
function validateStaticSearchParamsValue(searchParams,rules){
    let rc={}
    if(false===dataTypeCheck.isEmpty(searchParams)){
        for(let fieldName in searchParams){
            rc[fieldName]={}
            rc[fieldName]['rc']=0

            //根据定义的是否需要require，以及传入的值是否为空，进行判断
            let singleFiledRequireFlag=rules[fieldName]['require']
            let fieldValueEmptyFlag=dataTypeCheck.isEmpty(searchParams[fieldName]['value'])
            if(singleFiledRequireFlag && fieldValueEmptyFlag){
                rc[fieldName]['rc']=validateValueError.CUDValueNotDefineWithRequireTrue.rc
                rc[fieldName]['msg']=`${rules[fieldName]['chineseName']}:${validateValueError.CUDValueNotDefineWithRequireTrue.msg}`
                continue
                // return rules[fieldName]['require']['error']
            }
            //值为空，却并非为require，直接删除
            if(false===singleFiledRequireFlag && fieldValueEmptyFlag){
                delete searchParams[fieldName]
            }



            let fieldValue=searchParams[fieldName]['value']
            //判断类型是否符合
            let typeResult=valueTypeCheck(fieldValue,rules[fieldName][e_otherRuleFiledName.DATA_TYPE])
            if(typeResult.rc && 0<typeResult.rc){
                rc[fieldName]['rc']=typeResult.rc
                rc[fieldName]['msg']=`${fieldName}${typeResult.msg}`
                continue
            }
            if(false===typeResult){
                rc[fieldName]['rc']=validateValueError.staticTypeWrong.rc
                rc[fieldName]['msg']=`${fieldName}${validateValueError.staticTypeWrong.msg}`
                continue
            }
        }
    }
    return rc
}

/*function validateCurrentCollValue(collValue){
// console.log(`inputValue[e_validatePart.currentColl] is ${inputValue[e_validatePart.currentColl]}`)
//     console.log(`e_coll is ${JSON.stringify(e_coll)}`)
    if(false===collValue in e_coll){
        return validateValueError.undefinedCurrentColl
    }
    return {rc:0}
}*/

function validateCurrentPageValue(currentPage){
    //传入可能是字符，需要转换成整数
    currentPage=dataTypeCheck.isStrictInt(currentPage)
    // console.log(`after page int is :${currentPage}`)
    if(0>=currentPage || searchMaxPage.readName<currentPage){
        return validateValueError.invalidCurrentPage
    }
    return {rc:0}
}

/*      如果字段名称是id或者_id（没有定义在rule中），直接验证是否mongodb id的格式      */
/*function validateRecorderId(value){
    let rc={rc:0}

/!*    console.log(`value is ${JSON.stringify(value)}`)
    console.log(`value set result  is ${JSON.stringify(dataTypeCheck.isSetValue(value))}`)*!/
    if(false===dataTypeCheck.isSetValue(value) || true===dataTypeCheck.isEmpty(value)){
        return validateValueError.CUDObjectIdEmpty
    }
    if(false===regex.objectId.test(value)){
        return validateValueError.CUDObjectIdWrong
    }

    return rc
}*/

/*
 maxLength: 数组中最大哦包含多少个元素（一般是pagination. pageSize）
 * 1. 判断是否数组为空。空返回错误
 * 2. 判断数组是否超过最大限制（pagination.pageSize）
 * 3. 数组的每个元素是否都为objectId
 */
function validateRecIdArr(value,maxLength){
    let rc={rc:0}

    if(value.length===0){
        return validateValueError.recIdArrValueCantEmpty
    }
    if(value.length>maxLength){
        return validateValueError.recIdArrValueExceedMax
    }
    for(let singleEleValue of value){
        if(false===dataTypeCheck.isString(singleEleValue)){
            return validateValueError.recIdArrValueEleShouldString
        }
        if(false===regex.objectId.test(singleEleValue)){
            return validateValueError.recIdArrValueEleShouldObjectId
        }
    }


    return rc
}

/*/!*        格式固定，所以无需inputRule
* 1. from/to的值为objectId
* 2. eleArray的值类型为array，且其中每个元素的值为object_id
* *!/
function validateEditSubFieldValue(v){

    if(true==='from' in v){
        if(false===dataTypeCheck.isObject(v['from'])){
            return validateValueError.fromMustBeObjectId
        }
    }

    if(true==='to' in v){
        if(false===dataTypeCheck.isObject(v['to'])){
            return validateValueError.toMustBeObjectId
        }
    }

    if(!v['eleArray']){
        return validateValueError.eleArrayNotDefine
    }

    if(false===dataTypeCheck.isArray(v['eleArray'])){
        return validateValueError.eleArrayMustBeArray
    }

    //如果eleArray为空，报错（空数据意味着没有操作对象，那就根本不应该传送editSubField这个part）
    if(0===v['eleArray'].length){
        return validateValueError.eleArrayCantEmpty
    }

    //eleArray中每个元素必须为objectId
    for(let singleEle of v['eleArray']){
        // console.log(`${singleEle}`)
        if(false===regex.objectId.test(singleEle)){
            return validateValueError.eleArrayMustContainObjectId
        }
    }

    return rightResult
}*/

/*        根据rule，对输入的值进行格式检查
 * @inputValue：对象。{fieldName:{from:,to:,eleArrar},fieldName2:{from:,to:,eleArray}}
 * 0. rule中，对应的值类型必须是数组
 * 1. from/to的值类型必须为objectId
 * 2. eleArray的值类型为array，且其中每个元素的值根据field的类型决定，一般为objecId
 * */
function validateEditSubFieldValue({inputValue,browseInputRule}){

    for(let singleFieldName in inputValue){
        // console.log(`browseCollRule[singleFieldName][e_otherRuleFiledName.DATA_TYPE] +++++${JSON.stringify(browseInputRule[singleFieldName][e_otherRuleFiledName.DATA_TYPE])}`)
        //由format check保证rule必定是存在的
        let singleFieldRule=browseInputRule[singleFieldName]
        if(false===dataTypeCheck.isArray(singleFieldRule[e_otherRuleFiledName.DATA_TYPE])){
            return validateValueError.fieldDataTypeNotArray
        }
        let fieldDataType=singleFieldRule[e_otherRuleFiledName.DATA_TYPE][0]  //type是[ObjectId]这样的格式，如果是其他非数组格式，会返回第一个字符（而不是undefined）

        // console.log(`browseInputRule[singleFieldName]['arrayMaxLength']=========>${JSON.stringify(browseInputRule[singleFieldName][`arrayMaxLength`])}`)
        if(undefined===singleFieldRule[`arrayMaxLength`] || undefined===singleFieldRule[`arrayMaxLength`][`define`]){
            return validateValueError.arrayMaxLengthUndefined
        }
        let fieldArrayMaxLength=singleFieldRule[`arrayMaxLength`][`define`]
        // console.log(`browseInputRule[singleFieldName]['arrayMaxLength']=========>${JSON.stringify(browseInputRule[singleFieldName][`arrayMaxLength`])}`)
        let fieldValue=inputValue[singleFieldName]

        //首先检测from/to，以便出错立刻返回（节省检测eleArray的资源）
        if(true==='from' in fieldValue){
            if(false===dataTypeCheck.isObjectId(fieldValue['from'])){
                return validateValueError.fromMustBeObjectId
            }
        }

        if(true==='to' in fieldValue){
            if(false===dataTypeCheck.isObjectId(fieldValue['to'])){
                return validateValueError.toMustBeObjectId
            }
        }
        //然后检测eleArray
        //1. 必须是数组
        //1. 数量，不能为0或者超过字段arrMaxLength
        //2. 每个元素类型必须正确

        if(false===dataTypeCheck.isArray(fieldValue['eleArray'])){
            return validateValueError.eleArrayMustBeArray
        }

        //如果eleArray为空，报错（空数据意味着没有操作对象，那就根本不应该传送editSubField这个part）
        if(0===fieldValue['eleArray'].length){
            return validateValueError.eleArrayCantEmpty
        }
        // console.log(`fieldArrayMaxLength=====>${fieldArrayMaxLength}`)
        // console.log(`fieldValue['eleArray'].length=====>${fieldValue['eleArray'].length}`)
        if(fieldArrayMaxLength<fieldValue['eleArray'].length){
            return validateValueError.eleArrayEleNumExceed
        }
        //eleArray中每个元素符合rule中数据类型的定义，且要符合rule的定义
        for(let singleEle of fieldValue['eleArray']){
            //数据类型检测
            let valueTypeCheckResult=valueTypeCheck(singleEle,fieldDataType)
            if(false===valueTypeCheckResult){
                return validateValueError.eleArrayDataTypeWrong
            }
/*            if(0<valueTypeCheckResult.rc){
                return valueTypeCheckResult
            }*/
            //数据类型检测通过，且为objectId，则无需继续进行rule的check
            if(fieldDataType===e_serverDataType.OBJECT_ID){
                continue
            }
            //rule check(ARRAY_MAX_LENGTH和ARRAY_MIN_LENGTH在format check中完成)
            let singleRuleDefine,ruleCheckFunc
            //可以检测的rule
            let validRule=[e_serverRuleType.FORMAT,e_serverRuleType.MIN_LENGTH,e_serverRuleType.MAX_LENGTH,e_serverRuleType.MIN,e_serverRuleType.MAX,e_serverRuleType.EXACT_LENGTH,e_serverRuleType.ENUM]
            for(let singleValidRule of validRule){
                if(undefined!==singleFieldRule[singleValidRule]){
                    singleRuleDefine=singleFieldRule[singleValidRule][`define`]
                    if(false===valueMatchRuleDefineCheck({ruleType:singleValidRule,ruleDefine:singleRuleDefine,fieldValue:singleEle})){
                        return genInputError(singleFieldRule,singleValidRule)
                    }
                }
            }
        }
    }

    return rightResult
}


/*        根据rule，对输入的值进行格式检查
 * @inputValue：e_part的值，对象。{fieldName:{remove:[id1],add:[id2]},fieldName2:{remove:[id1],add:[id2]}}
 * 0. rule中，对应的值类型必须是数组
 * 1. remove/add：必须是数组
 * 2. remove/add：不能为空，且不能长度不能超过rule中max_array_length
 * 3. remove/add:每个元素类型必须和rule中定义的一样
 *
 * @直接返回错误，防止继续检测
 * */
function validateManipulateArrayValue({inputValue,browseInputRule}){
// ap.wrn('validateManipulateArrayValue in')
//     ap.wrn('inputValue in',inputValue)
//     ap.wrn('browseInputRule in',browseInputRule)
//     let rc={}
    for(let singleFieldName in inputValue){
        // rc[singleFieldName]=0
        // console.log(`browseCollRule[singleFieldName][e_otherRuleFiledName.DATA_TYPE] +++++${JSON.stringify(browseInputRule[singleFieldName][e_otherRuleFiledName.DATA_TYPE])}`)
        //由format check保证rule必定是存在的
        let singleFieldRule=browseInputRule[singleFieldName]
        //1 dataType必须是数组
        if(false===dataTypeCheck.isArray(singleFieldRule[e_otherRuleFiledName.DATA_TYPE])){
            // return rc[singleFieldName]=validateValueError.manipulateArray.fieldDataTypeNotArray
            return validateValueError.manipulateArray.fieldDataTypeNotArray
        }
        let fieldDataType=singleFieldRule[e_otherRuleFiledName.DATA_TYPE][0]  //type是[ObjectId]这样的格式，如果是其他非数组格式，会返回第一个字符（而不是undefined）

        // console.log(`browseInputRule[singleFieldName]['arrayMaxLength']=========>${JSON.stringify(browseInputRule[singleFieldName][`arrayMaxLength`])}`)
        if(undefined===singleFieldRule[`arrayMaxLength`] || undefined===singleFieldRule[`arrayMaxLength`][`define`]){
            // return rc[singleFieldName]=validateValueError.manipulateArray.arrayMaxLengthUndefined
            return validateValueError.manipulateArray.arrayMaxLengthUndefined
        }
        let fieldArrayMaxLength=singleFieldRule[`arrayMaxLength`][`define`]
        // console.log(`browseInputRule[singleFieldName]['arrayMaxLength']=========>${JSON.stringify(browseInputRule[singleFieldName][`arrayMaxLength`])}`)
        let fieldValue=inputValue[singleFieldName]
// ap.wrn('fieldValue',fieldValue)
        /*
        //首先检测from/to，以便出错立刻返回（节省检测eleArray的资源）
        if(true==='from' in fieldValue){
            if(false===dataTypeCheck.isObjectId(fieldValue['from'])){
                return validateValueError.fromMustBeObjectId
            }
        }

        if(true==='to' in fieldValue){
            if(false===dataTypeCheck.isObjectId(fieldValue['to'])){
                return validateValueError.toMustBeObjectId
            }
        }*/

        //检测field中的每个key
        //1. 必须是数组
        //1. 数量，不能超过字段arrMaxLength
        //2. 每个元素类型必须正确
        for(let singleKey in fieldValue){
            if(false===dataTypeCheck.isArray(fieldValue[singleKey])){
                return validateValueError.manipulateArray.fieldKeyValueMustBeArray
            }

            //如果为空，报错（空数据意味着没有操作对象，那就根本不应该传送add/remove这个key）
            if(0===fieldValue[singleKey].length){
                return validateValueError.manipulateArray.fieldKeyValueCantEmpty
            }

            if(fieldArrayMaxLength<fieldValue[singleKey].length){
                return validateValueError.manipulateArray.fieldKeyValueNumExceed
            }

            //add/remove中每个元素符合rule中数据类型的定义，且要符合rule的定义
            for(let singleEle of fieldValue[singleKey]){
                // ap.wrn('singleEle',singleEle)
                //数据类型检测
                let valueTypeCheckResult=valueTypeCheck(singleEle,fieldDataType)
                if(false===valueTypeCheckResult){
                    return validateValueError.manipulateArray.fieldKeyValueDataTypeWrong
                }

                //objectId只检测是否为字符，regex要放在format中检测
                //数据类型检测通过，且为objectId，则无需继续进行rule的check
/*                if(fieldDataType===e_serverDataType.OBJECT_ID){
                    continue
                }*/
                //rule check(ARRAY_MAX_LENGTH和ARRAY_MIN_LENGTH在format check中完成)
                let singleRuleDefine,ruleCheckFunc
                //可以检测的rule
                let validRule=[e_serverRuleType.FORMAT,e_serverRuleType.MIN_LENGTH,e_serverRuleType.MAX_LENGTH,e_serverRuleType.MIN,e_serverRuleType.MAX,e_serverRuleType.EXACT_LENGTH,e_serverRuleType.ENUM]
                for(let singleValidRule of validRule){
                    if(undefined!==singleFieldRule[singleValidRule]){
                        // ap.wrn('singleFieldRule[singleValidRule]',singleFieldRule[singleValidRule])
                        singleRuleDefine=singleFieldRule[singleValidRule][`define`]
                        if(false===valueMatchRuleDefineCheck({ruleType:singleValidRule,ruleDefine:singleRuleDefine,fieldValue:singleEle})){
                            return genInputError(singleFieldRule,singleValidRule)
                        }
                    }
                }
            }
        }




    }

    return rightResult
}
/*          由server内部生成，所以无需inputRule
* 0. 所有字段必须赋值
* 1. eventId是否在enum的指定范围内
* 2. sourceId和targetId（如果存在）是否为objectId
* 3. status是否位于enum指定范围内
 */
function validateEventValue(v,eventIdEnum){
    //0. 所有字段必须赋值
    for(let singleField in v){
        if(false===dataTypeCheck.isSetValue(v[singleField])){
            return validateValueError.valueNotSet(singleField)
        }
    }

    //1. eventId是否在enum的指定范围内
    if(-1===Object.values(eventIdEnum).indexOf(v['eventId'])){
        return validateValueError.eventIdNotValid
    }

    //2. sourceId和targetId（如果存在）是否为objectId
    if(false===dataTypeCheck.isObject(v['sourceId'])){
        return validateValueError.sourceIdMustBeObjectId
    }
    if(v['targetId'] && false===dataTypeCheck.isObject(v['targetId'])){
        return validateValueError.targetIdMustBeObjectId
    }

    //3. status是否位于enum指定范围内
    if(-1===Object.values(e_eventStatus).indexOf(v['status'])){
        return validateValueError.eventStatusNotValid
    }

    return rightResult
}



function validateMethodValue(methodValue){
    // console.log(`e_method=======>${JSON.stringify(e_method)}`)
    // console.log(`methodValue=======>${JSON.stringify(methodValue)}`)
    if(-1===Object.values(e_method).indexOf(methodValue)){
        return validateValueError.methodValueUndefined
    }
    return {rc:0}
}

/*      验证captcha
*       格式简单，不用验证format，直接验证value
* */
function validateCaptcha(captchaValue){
    // ap.inf('typeof captchaValue',typeof captchaValue)
    if(false===dataTypeCheck.isString(captchaValue)){
        return validateValueError.captcha.valueTypeIncorrect
    }
    if(captchaValue.length!==4){
        return validateValueError.captcha.valueLengthIncorrect
    }
    return rightResult
}

/*      验证短信验证码
*       格式简单，不用验证format，直接验证value
* */
function validateSMS(SMSValue){
    if(false===dataTypeCheck.isString(SMSValue)){
        return validateValueError.SMS.valueTypeIncorrect
    }
    if(SMSValue.length!==6){
        return validateValueError.SMS.valueLengthIncorrect
    }
    if(false===regex.SMS.test(SMSValue)){
        return validateValueError.SMS.valueLengthIncorrect
    }

    return rightResult
}

/*      验证短信验证码
*       格式简单，不用验证format，直接验证value
* */
function validateDataUrl(dataUrlValue){
    if(false===regex.dataUrlThumbnail.test(dataUrlValue)){
        return validateValueError.dataUrl.valueIncorrect
    }
    return rightResult
}

/**     选择好友时，为了减少client输入，输入值采用特殊格式，需要在server端进行检查
 *  对象:{
 *      allFriends:true，//说明了选择了所有好友，此时其他选项都被忽略
 *      friendGroups:[],//只有当allFriends不存在或者为false，才能设置，指定了选择的group；需要通过db查询转换成friends
 *      friends:[], //
 *  }
 *  为了防止恶意尝试，一旦发生错误，直接返回错误，而不是继续处理。
 * **/
function validateChooseFriendValue({inputValue}){
    // 1. 如果key有allFriends，直接返回
    if(undefined!==inputValue[e_chooseFriendInfoFieldName.ALL_FRIENDS]){
        return rightResult
    }
    // 2. 如果有friendGroups或者friends,其中每个元素必须是合格的objectId
    let expectedFieldName=[e_chooseFriendInfoFieldName.FRIENDS,e_chooseFriendInfoFieldName.FRIEND_GROUPS]
    for(let singleExpectedFieldName of expectedFieldName){
        if(undefined!==inputValue[singleExpectedFieldName]){
            // ap.wrn('inputValue[singleExpectedFieldName]',inputValue[singleExpectedFieldName])
            for(let singleEle of inputValue[singleExpectedFieldName]) {
                // ap.wrn('singleEle',singleEle)
                if(false===dataType.ifObjectId({objectId:singleEle})){
                    return validateValueError.validateChooseFriendValue.chooseFriendFieldValueArrayEleInvalidObjectId(singleExpectedFieldName)
                }
            }
        }
    }


    return rightResult
}


module.exports= {
    validateScalarInputValue,
    // validateCreateRecorderValue,    //调用_validateRecorderValue
    // validateUpdateRecorderValue,        //调用_validateRecorderValue
    validateSingleRecorderFieldValue,   //validateRecorderValue=>validateSingleRecorderFieldValue

    validateSingleValueForSearch,//对单个字段值进行除了require之外，其他所有rule的验证
    // searchParamValue 的check已经由文件validateSearchFormat下的2个函数arrayValueStringLogicCheck/arrayValueDigitLogicCheck 完成
/*    validateSearchParamsValue,
    validateSingleSearchFieldValue,//辅助函数，一般不直接使用*/
    //_validateSingleSearchElementValue, //私有函数

    validateFilterFieldValue,//{field:xxxx}  {field:{fk:xxxxx}}    用来给单个字段（不仅仅是外键的name）提供autoComplete值，接受字符/数字。因为都是搜索，所以调用_validateSingleSearchElementValue对值检测

    // validateSingleElementValue,//可在1，autoComplete的时候，使用   2. 被validateSingleSearchFieldValue调用
    //validateDeleteObjectId,//delete比较特殊，使用POST，URL带objectID指明要删除的记录，同时body中带searchParams和currentPage，以便删除后继续定位对应的页数
    validateStaticSearchParamsValue,

    //validateRecorderId,//不在需要，直接在validateFormat->validatePartFormat中完成（简单part，直接测试）
    // validateCurrentCollValue,
    validateCurrentPageValue,
    validateRecIdArr, //对记录进行批量处理（删除/更新），需要传入的part


    validateEditSubFieldValue,
    validateManipulateArrayValue,

    validateEventValue,

    validateMethodValue,
    validateCaptcha,
    validateSMS,
    validateDataUrl,

    validateChooseFriendValue,
}