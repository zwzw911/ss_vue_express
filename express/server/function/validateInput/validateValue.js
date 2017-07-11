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
const validateHelper=require('./validateHelper')
const dataTypeCheck=validateHelper.dataTypeCheck
const genInputError=validateHelper.genInputError
const valueMatchRuleDefineCheck=validateHelper.valueMatchRuleDefineCheck
const valueTypeCheck=validateHelper.valueTypeCheck

const validateError=require('../../constant/error/validateError').validateError
const validateValueError=validateError.validateValue
const validateFormatError=validateError.validateFormat

const validEnum=require('../../constant/enum/inputDataRuleType')
const e_serverDataType=validEnum.ServerDataType
const e_serverRuleType=validEnum.ServerRuleType
const  e_validatePart=require('../../constant/enum/node').ValidatePart

const regex=require('../../constant/regex/regex').regex

const e_coll=require('../../constant/enum/node').Coll

const searchMaxPage=require('../../constant/config/globalConfiguration').searchMaxPage

const rightResult={rc:0}

//const e_eventStatus=require('../../constant/enum/node_runtime').EventStatus
// const arr_eventField=require('../../constant/define/node').EVENT_FIELD

/*********************************************/
/*         检测create/update 输入值并返回结果        */
/*********************************************/
/* params:
 * inputValue:{username:{value:xxx},password:{value:yyy}} 由调用函数保证输入参数的格式正确
 * collRules： ruleDefine(以coll为单位)adminLogin。每个页面有不同的定义
 *
 * return:
 * 返回值有2种：一种是严重错误（出错后，字段的值是否符合rule已经无关紧要）使用common：{rc:xxx,msg:yyy}，另外一种是对全部输入的field都进行检查，返回{field1:{rc:xxx,msg,yyy},field2:{rc:zzz,msg:aaa}}
 *
 * step；
 * xxxxxxx1. 判断输入的值的字段数是否超过对应rule中的字段数（防止client输入过多字段，导致开销过大）===>放入validateFormat
 * xxxxxxx2. 判断输入值中的字段是否在inputRule中有定义（防止用户输入随便定义的字段）===>放入validateFormat
 * 1. 遍历所有rule字段，如果是require=true，检查inputValue是有值，有（即使为{value:null}），交给validateSingleRecorderFieldValue处理
 * */
function _validateRecorderValue(inputValue,collRules,ifCreate){
    let rc={}

    //itemName: 字段名称
    for (let fieldName in collRules ){
/*        rc[fieldName]={}
        rc[fieldName]['rc']=0*/
        // console.log(`itemName ${JSON.stringify(fieldName)}`)
        // console.log(`field vbalue is ${JSON.stringify(inputValue[fieldName])}`)
        //console.log(`start to check fiekd ${itemName}`)

//id/_id通过validateObjectId单独验证（主要用在delete中）
/*        //如果是id或者_id，无需rule，则直接判断(因为_id/id只可能出现在inputValue，所以此处是base隐式为inputValue)
        if('id'===itemName || '_id'===itemName){
            rc[itemName]=validateObjectId(inputValue[itemName]['value'])
            // console.log(`validateObjectId result is ${JSON.stringify(rc[itemName])}`)
            continue
        }*/
        if(ifCreate){
            //如果rule中为require，但是inputValue中没有，返回据错误。否则后续的赋值会报错
            //require是rule中的必填字段，区别只是false/true
            // console.log(`field is ${fieldName}`)
            // console.log(`require define is ${collRules[fieldName][e_serverRuleType.REQUIRE]['define']}`)
            if(collRules[fieldName][e_serverRuleType.REQUIRE]['define'] ){
                //只检查是否定义，如果定义（即使为{value:undefined}），交给validateSingleRecorderFieldValue处理
                if(false===dataTypeCheck.isSetValue(inputValue[fieldName])  ){
                    // rc[fieldName]=validateValueError.mandatoryFieldMiss(fieldName)
                    rc[fieldName]= genInputError(collRules[fieldName],e_serverRuleType.REQUIRE)  //require错误，返回字段require对应的rc，而不是返回一个common rc（mandatoryFieldMiss）
                    // console.log(`validate result of created is ${JSON.stringify(rc)}`)
                    return rc
                }

            }
        }

/*        let fieldValue
        if(inputValue[itemName] && inputValue[itemName]['value']){
            fieldValue=inputValue[itemName]['value']
        }*/
// console.log(`valie is ${JSON.stringify(inputValue[fieldName])}`)
        //value中对应的字段是有的，才进行检测
        if(inputValue[fieldName]){
            // console.log(`inputValue[fieldName]['value'] is ${JSON.stringify(inputValue[fieldName]['value'])}`)
            // console.log(`before validate result of single field is ${JSON.stringify(inputValue[fieldName]['value'])}`)
            // 输入的值默认要去掉头尾空白后在处理
            if(true===dataTypeCheck.isString(inputValue[fieldName]['value'])){
                inputValue[fieldName]['value']=inputValue[fieldName]['value'].trim()
            }
            let fieldValue=inputValue[fieldName]['value']
            let fieldRule=collRules[fieldName]

            let fieldType=collRules[fieldName]['type']
            if(dataTypeCheck.isArray(fieldType)){
                //首先检查数据类型是不是array
                if(false===dataTypeCheck.isArray(fieldValue)){
                    rc[fieldName]=validateValueError.CUDTypeWrong
                    continue
                }
                //检查array的长度
                if(fieldRule[e_serverRuleType.ARRAY_MIN_LENGTH]['define']){
                    if(fieldValue.length<fieldRule[e_serverRuleType.ARRAY_MIN_LENGTH]['define']){
                        rc[fieldName]=genInputError(fieldRule,e_serverRuleType.ARRAY_MIN_LENGTH)
                        break
                    }
                }
                if(fieldRule[e_serverRuleType.ARRAY_MAX_LENGTH]['define']){
                    if(fieldValue.length>fieldRule[e_serverRuleType.ARRAY_MAX_LENGTH]['define']){
                        rc[fieldName]=genInputError(fieldRule,e_serverRuleType.ARRAY_MAX_LENGTH)
                        break
                    }
                }
                rc[fieldName]={rc:0}
                for(let singleFieldValue of fieldValue){
/*console.log(`singleFieldValue is ${singleFieldValue}`)
                    console.log(`fieldRule is ${JSON.stringify(fieldRule)}`)*/
                    let tmpRc=validateSingleRecorderFieldValue(singleFieldValue,fieldRule)
                    if(tmpRc.rc>0){
                        rc[fieldName]=tmpRc
                        break
                    }
                }

            }else{
                rc[fieldName]=validateSingleRecorderFieldValue(fieldValue,fieldRule)
            }


            // console.log(`validate result of single field is ${JSON.stringify(rc)}`)
        }

    }
    return rc
//    注意，返回的结果是对象，结构和inputValue类似，不是{rc;xxx,msg:xxx}的格式
}

/*      create新纪录的时候，对输入的值进行检查          */
function validateCreateRecorderValue(inputValue,collRules){
    return _validateRecorderValue(inputValue,collRules,true)
}
/*      update纪录的时候，对输入的值进行检查          */
function validateUpdateRecorderValue(inputValue,collRules){
    return _validateRecorderValue(inputValue,collRules,false)
}

/*/!*     delete纪录的时候，对输入的值进行检查          *!/
// 1. 输入直接就是recorderId的值
function validateRecorderIdValue(recorderIdValue){
    // let allInputFields=Object.keys(inputValue)


//不知道是id还是_id
    return _validateObjectId(inputValue[allInputFields[0]]['value'])
}*/
/*          对一条记录的单个字段的值进行检查（字段必须有对应的rule，且不是equalTo）
 *           因为记录要存储到db，所以field的值必须严格的符合field对应的所有rule
 *           _id/id，以及equalTo要用单独的函数进行判断
 * param：
 * 0. chineseName： 用来产生error msg
 * 1. fieldValue; 单个字段的值
 * 2. fieldRule：单个字段对应的rule
 *
 * step:
 * 1. 首先检查require（default不再检查，而是通过db的default自动补全）
 * 2. 有值的话，检查值的类型是否和rule中定义的type匹配
 * 2. 如果有objectId或者regexp，首先用此检测
 * 3. 检查maxLength，防止输入过大
 * 4. 检查enum
 * 5. 检查剩余rule
 *
 * */
function validateSingleRecorderFieldValue(fieldValue,fieldRule){
    // console.log(`field value is ${JSON.stringify(fieldValue)}`)
    // console.log(`field rule is ${JSON.stringify(fieldRule)}`)
    // console.log(`field value isSetValue ${JSON.stringify(dataTypeCheck.isSetValue(fieldValue))}`)
    // console.log(`field value isEmpty ${JSON.stringify(dataTypeCheck.isEmpty(fieldValue))}`)
    let rc={rc:0}
    let chineseName=fieldRule['chineseName']


    //首先检查require
    // 如果require为true
    if(true===fieldRule[e_serverRuleType.REQUIRE]['define']){
        // console.log(`requier = true`)
        if(false===valueMatchRuleDefineCheck.require(fieldValue)){
            return genInputError(fieldRule,e_serverRuleType.REQUIRE)
        }
    }
    //如果require为false
    //如果无值返回rc:0，有值，继续往下走
    if(false===fieldRule[e_serverRuleType.REQUIRE]['define']){
        // console.log(`field value is ${fieldValue}`)
        if(false===dataTypeCheck.isSetValue(fieldValue)){
            return rightResult
        }
    }

    // break;
   /* let fieldValueSetFlag=dataTypeCheck.isSetValue(fieldValue) && !dataTypeCheck.isEmpty(fieldValue) //防止输入空字符/object/array等
    // console.log(`field value fieldValueSetFlag ${JSON.stringify(fieldValueSetFlag)}`)
    let requireFlag=fieldRule[e_serverRuleType.REQUIRE]['define']


    //1. 首先检查require（default不再检查，而是通过db的default自动补全）
    /!*
     * 1. 如果fieldValueSetFlag=false，而require=true，返回错误
     * 2. 如果fieldValueSetFlag=false，而require=false，返回rc：0
     * 3. 如果fieldValueSetFlag=true，继续
     * *!/
    if(false===fieldValueSetFlag){
        if(requireFlag){
            /!*            rc['rc']=validateValueError.CUDValueNotDefineWithRequireTrue.rc
             rc['msg']=`${chineseName}:${validateValueError.CUDValueNotDefineWithRequireTrue.msg}`*!/
            rc['rc']=fieldRule[e_serverRuleType.REQUIRE]['error']['rc']
            rc['msg']=genInputError(fieldRule,e_serverRuleType.REQUIRE)
        }
        //不能放在上面的if块中。
        // 如果错误，返回错误；如果正确，返回{rc:0}
        return rc
    }*/
    //2 检查value的类型是否符合type中的定义
    /*console.log(currentItemValue)
     console.log(currentItemRule['type'])*/
    // let result = valueTypeCheck(fieldValue,fieldRule['type'])

    let valueTypeCheckResult
    // console.log(`fieldRule['type'] is ${JSON.stringify(fieldRule['type'])}`)
    if(dataTypeCheck.isArray(fieldRule['type'])){
        valueTypeCheckResult= valueTypeCheck(fieldValue,fieldRule['type'][0])
    }else{
        valueTypeCheckResult= valueTypeCheck(fieldValue,fieldRule['type'])
    }
    // console.log(`valueTypeCheckResult is ${JSON.stringify(valueTypeCheckResult)}`)
    if(valueTypeCheckResult.rc && 0<valueTypeCheckResult.rc){
        rc['rc']=valueTypeCheckResult.rc
        rc['msg']=`${chineseName}${valueTypeCheckResult.msg}`
        return rc
    }
    if(false===valueTypeCheckResult){
        rc['rc']=validateValueError.CUDTypeWrong.rc
        rc['msg']=`${chineseName}${validateValueError.CUDTypeWrong.msg}`
        return rc
    }

    //3 如果有format，直接使用format(如果正确，还要继续其他的检测，例如：数字的格式检查完后，还要判断min和max)
    if(fieldRule[e_serverRuleType.FORMAT] && fieldRule[e_serverRuleType.FORMAT]['define']){
        let formatDefine=fieldRule[e_serverRuleType.FORMAT]['define']
        // console.log(`formatDefine is ${JSON.stringify(formatDefine)}`)
        if(false===valueMatchRuleDefineCheck.format(fieldValue,formatDefine)){
            // rc['rc']=fieldRule[e_serverRuleType.FORMAT]['error']['rc']
            // rc['msg']=genInputError(fieldRule,e_serverRuleType.FORMAT)
            // return rc
            // console.log(`format check result is false`)
            // console.log(`format check result rc is ${JSON.stringify(genInputError(fieldRule,e_serverRuleType.FORMAT))}`)
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
        // console.log(`maxLength: define ${maxLengthDefine}, value ${currentItemValue}`)
        if(true===valueMatchRuleDefineCheck.exceedMaxLength(fieldValue,maxLengthDefine)){
            // rc['rc']=fieldRule[e_serverRuleType.MAX_LENGTH]['error']['rc']
            // rc['msg']=genInputError(fieldRule,e_serverRuleType.MAX_LENGTH)
            // return rc
            return genInputError(fieldRule,e_serverRuleType.MAX_LENGTH)
        }
        //继续往下检查其他rule
    }

    //5 检查enum
    if(fieldRule[e_serverRuleType.ENUM] && fieldRule[e_serverRuleType.ENUM]['define']){
        // console.log(`enum in`)
        let enumDefine=fieldRule[e_serverRuleType.ENUM]['define']
        if(false===valueMatchRuleDefineCheck.enum(fieldValue,enumDefine)){
            // console.log(`enum check fialed`)
            // rc['rc']=fieldRule[e_serverRuleType.ENUM]['error']['rc']
            // rc['msg']=genInputError(fieldRule,e_serverRuleType.ENUM)
            // return rc
            return genInputError(fieldRule,e_serverRuleType.ENUM)
        }
    }

    //6 检查除了require/format(objectId)/maxLength/enum之外的每个rule进行检测
    //已经预检过的rule
    let alreadyCheckedRule=[e_serverRuleType.REQUIRE,e_serverRuleType.FORMAT,e_serverRuleType.MAX_LENGTH,e_serverRuleType.ENUM]
    //非rule的key;value对()
    let nonRuleKey=['type','default','chineseName']
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
                if(true===valueMatchRuleDefineCheck.exceedMinLength(fieldValue,ruleDefine)){
                    // rc['rc']=fieldRule[singleItemRuleName]['error']['rc']
                    // rc['msg']=genInputError(fieldRule,e_serverRuleType.MIN_LENGTH)
                    // return rc
                    return genInputError(fieldRule,e_serverRuleType.MIN_LENGTH)
                }
                break;
            case e_serverRuleType.EXACT_LENGTH:
                if(false===valueMatchRuleDefineCheck.exactLength(fieldValue,ruleDefine)){
                    // rc['rc']=fieldRule[singleItemRuleName]['error']['rc']
                    // rc['msg']=genInputError(fieldRule,e_serverRuleType.EXACT_LENGTH)
                    // return rc
                    return genInputError(fieldRule,e_serverRuleType.EXACT_LENGTH)
                }
                break;
            case e_serverRuleType.MAX:
                if(true===valueMatchRuleDefineCheck.exceedMax(fieldValue,ruleDefine)){
                    // rc['rc']=fieldRule[singleItemRuleName]['error']['rc']
                    // rc['msg']=genInputError(fieldRule,e_serverRuleType.MAX)
                    return genInputError(fieldRule,e_serverRuleType.MAX)
                }
                break;
            case e_serverRuleType.MIN:
                // console.log(`min fieldvalue is ${fieldValue}, rule defind is ${ruleDefine}`)
                if(true===valueMatchRuleDefineCheck.exceedMin(fieldValue,ruleDefine)){
                    // rc['rc']=fieldRule[singleItemRuleName]['error']['rc']
                    // rc['msg']=genInputError(fieldRule,e_serverRuleType.MIN)
                    return genInputError(fieldRule,e_serverRuleType.MIN)
                }
                break;
            default:
                // console.log(`unknown ruel ${singleItemRuleName}`)
            //其他的rule，要么已经检测过了，要么是未知的，不用检测。所以default不能返回任何错误rc（前面检测过的rule可能进入default）
            // return validateValueError.unknownRuleType
        }
    }
// console.log(`test tset`)
    return rightResult
}




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */





/*
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
 * */
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
            if(searchParams[singleFieldName]){
                // console.log(  `searchParams[singleFieldName] exist `  )
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
        if (fkConfig[singleFieldName]) {
            let fieldFkConfig=fkConfig[singleFieldName]
            //遍历当前字段岁对应的所有外键字段
            if(searchParams[singleFieldName]){
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
        //空值或者超出maxLength，则直接删除搜索值而不报错（搜索可以继续）
        // console.log(`result tt is ${JSON.stringify(result)}`)
        // console.log(`rule tt is ${JSON.stringify(fieldRule[e_serverRuleType.MAX_LENGTH])}`)
        if(result.rc===validateValueError.SValueEmpty.rc || (fieldRule[e_serverRuleType.MAX_LENGTH] &&result.rc===fieldRule[e_serverRuleType.MAX_LENGTH]['error']['rc'])){
            fieldValue.splice(idx,1)
            continue
/*            //删除搜索值之后，如果为空数组，则把对应的field也删除
            if(fieldValue.length===0){
                fieldValue=undefined
                break
            }*/
        }
        //其他错误，返回client（搜索不继续）
        if(result.rc>0){
            return result
        }
    }
    return {rc:0}
}


//需要单独定义成一个函数，在提供autoCoplete的时候，需要对单个搜索值（字符串）进行判断，就是用此函数
//searchElement: 要检查的元素，如果是是指或者日期，可能还有比较符号{value:xxx,CompOp:'yy'}（字符/数字/日期，非数组或者对象）
//singleFieldRule： 对应的rule定义
/*  对单个搜索值进行检测，和validateSingleRecorderInfoValue不同在于：如果不符合enum/min/max/maxLength/format，返回rc，告知删除此搜索值（因为不在范围内，肯定没有对应记录）
*params
* 1. searchValue： 待检测的值
* 2, fieldRule：对应的搜索rule
*
* step：
* 1. 检测是否为undefined或者null或者空字符，是：返回rc，告知删除  validateValueError.SValueEmpty
* 2. 类型是否匹配，不匹配，返回rc，告知错误(2种返回值，不匹配；未知类型)  validateValueError.STypeWrong/validateHelperError.unknownDataType
* 3. objectId/format/maxLength/enum，不符合，返回错误，maxlength返回删除
* 4.  XXXXXXXmaxLength/min/max：不符合，删除XXXXXXXX   数值比较超出范围无所谓
* */
function _validateSingleSearchElementValue(searchElement,fieldRule){
    // console.log(`function checkSingleSearchValue called`)
    let searchValue=searchElement['value']
    

    return _validateSingleSearchValue(searchValue,fieldRule)
}

//直接对值进行检查
function _validateSingleSearchValue(searchValue,fieldRule){
    let chineseName=fieldRule['chineseName']
    let rc={rc:0}

    //1. 检测是否为undefined或者null或者空字符，是：返回删除
    if(false===dataTypeCheck.isSetValue(searchValue) || true===dataTypeCheck.isEmpty(searchValue)){
        return validateValueError.SValueEmpty
    }
    //2 检查value的类型是否符合type中的定义，错误返回
    //  console.log(`data is ${singleSearchString}`)
    //   console.log(`data type is ${singleFieldRule['type'].toString()}`)

    let typeCheckResult = valueTypeCheck(searchValue,fieldRule['type'])
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
    if(e_serverDataType.OBJECT_ID===fieldRule['type'] ){
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
        if(false===valueMatchRuleDefineCheck.format(searchValue,formatDefine)){
            rc['rc']=fieldRule[e_serverRuleType.FORMAT]['error']['rc']
            rc['msg']=genInputError(fieldRule,e_serverRuleType.FORMAT)
            return rc
        }
    }

    //3.3 如果有maxLength，先检测maxLength，错误删除
    if(fieldRule[e_serverRuleType.MAX_LENGTH] && fieldRule[e_serverRuleType.MAX_LENGTH]['define']){
        let ruleDefine=fieldRule[e_serverRuleType.MAX_LENGTH]['define']
        if(true===valueMatchRuleDefineCheck.exceedMaxLength(searchValue,ruleDefine)){
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
        if(false===valueMatchRuleDefineCheck.enum(searchValue,enumDefine)){
            rc['rc']=fieldRule[e_serverRuleType.ENUM]['error']['rc']
            rc['msg']=genInputError(fieldRule,e_serverRuleType.ENUM)
            return rc
        }
    }

    return rc
}
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
    result=_validateSingleSearchValue(fieldValue,fieldRule)
    // console.log(` field value with rule check is ${JSON.stringify(result)}`)

    //maxLength/min/max，则直接返回空数组
    if( (fieldRule[e_serverRuleType.MAX_LENGTH] &&result.rc===fieldRule[e_serverRuleType.MAX_LENGTH]['error']['rc']) ||
        (fieldRule[e_serverRuleType.MAX] &&result.rc===fieldRule[e_serverRuleType.MAX]['error']['rc']) ||
        (fieldRule[e_serverRuleType.MIN] &&result.rc===fieldRule[e_serverRuleType.MIN]['error']['rc'])){
        //返回这个错误，说明无需执行 搜索 操作，直接返回空数组即可（）
        return validateValueError.filterFieldValueOutRange
    }

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
            let typeResult=valueTypeCheck(fieldValue,rules[fieldName]['type'])
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
    currentPage=dataTypeCheck.isInt(currentPage)
    // console.log(`after page int is :${currentPage}`)
    if(0>=currentPage || searchMaxPage.readName<currentPage){
        return validateValueError.invalidCurrentPage
    }
    return {rc:0}
}

/*      如果字段名称是id或者_id（没有定义在rule中），直接验证是否mongodb id的格式      */
function validateRecorderId(value){
    let rc={rc:0}

/*    console.log(`value is ${JSON.stringify(value)}`)
    console.log(`value set result  is ${JSON.stringify(dataTypeCheck.isSetValue(value))}`)*/
    if(false===dataTypeCheck.isSetValue(value) || true===dataTypeCheck.isEmpty(value)){
        return validateValueError.CUDObjectIdEmpty
    }
    if(false===regex.objectId.test(value)){
        return validateValueError.CUDObjectIdWrong
    }

    return rc
}

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

/*        格式固定，所以无需inputRule
* 1. from/to的值为objectId
* 2. eleArray的值类型为array，且其中每个元素的值为object_id
* */
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

module.exports= {
    validateCreateRecorderValue,    //调用_validateRecorderValue
    validateUpdateRecorderValue,        //调用_validateRecorderValue
    validateSingleRecorderFieldValue,   //validateCreateRecorderValue=>_validateRecorderValue=>validateSingleRecorderFieldValue

    validateSearchParamsValue,
    validateSingleSearchFieldValue,//辅助函数，一般不直接使用
    //_validateSingleSearchElementValue, //私有函数

    validateFilterFieldValue,//{field:xxxx}  {field:{fk:xxxxx}}    用来给单个字段（不仅仅是外键的name）提供autoComplete值，接受字符/数字。因为都是搜索，所以调用_validateSingleSearchElementValue对值检测

    // validateSingleElementValue,//可在1，autoComplete的时候，使用   2. 被validateSingleSearchFieldValue调用
    //validateDeleteObjectId,//delete比较特殊，使用POST，URL带objectID指明要删除的记录，同时body中带searchParams和currentPage，以便删除后继续定位对应的页数
    validateStaticSearchParamsValue,

    validateRecorderId,//直接验证记录主键的值（而不是外键，虽然都是objectId）
    // validateCurrentCollValue,
    validateCurrentPageValue,
    validateRecIdArr, //对记录进行批量处理（删除/更新），需要传入的part


    validateEditSubFieldValue,
    validateEventValue,
}