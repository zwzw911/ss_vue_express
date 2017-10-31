/**
 * Created by wzhan039 on 2017/10/17.
 */
'use strict'
const nodeEnum=require(`../constant/enum/nodeEnum`)

const e_method=nodeEnum.Method
const e_part=nodeEnum.ValidatePart
const e_serverRuleType=require(`../constant/enum/inputDataRuleType`).ServerRuleType
const e_serverDataType=require(`../constant/enum/inputDataRuleType`).ServerDataType

const misc=require(`../function/assist/misc`)

const browserInputRule=require(`../constant/inputRule/browserInputRule`).browserInputRule

//为RECORD_ID产生测试数据(类型测试)
function generateTestDataForRecordIdDataType() {
    // let method=parameter[`method`]
    let recordInfos=[]
    // if(method===e_method.DELETE){
        recordInfos.push(null)
        recordInfos.push(NaN)
        recordInfos.push(1)
        recordInfos.push(1.1)
        recordInfos.push(new Date())
        recordInfos.push([])
        recordInfos.push({})
    // }else{
    //     console.log(`===============>ERR: ONLY DELETE USED`)
    // }
    return recordInfos
}

//为RECORD_ID产生测试数据(数据测试)
function generateTestDataForRecordIdValue() {
    // let method=parameter[`method`]
    let recordInfos=[]
    // if(method===e_method.DELETE){
        recordInfos.push(`1`)
    // }else{
    //     console.log(`===============>ERR: ONLY DELETE USED`)
    // }

    return recordInfos
}


/*************************************************************************/
/************************       recordInfo     **************************/
/*************************************************************************/
/*                  根据field的数据类型，产生所有不符合此数据类型的测试数据              */
function generateTestDataForRecordInfoDataType({parameter,fieldName}) {
    // console.log(`collRule=========>${JSON.stringify(collRule)}`)
    // let ruleDefine = collRule[fieldName][ruleName]['define']
    let {sess,sessErrorRc,APIUrl,penalizeRelatedInfo,reqBodyValues,collName,skipParts,app}=parameter
    let collRule=browserInputRule[collName]
    let normalRecordInfo=reqBodyValues[e_part.RECORD_INFO]
    // console.log(`normalRecordInfo======>${JSON.stringify(normalRecordInfo)}`)
    let fieldDataType
    if(collRule[fieldName]['type'] instanceof Array){
        fieldDataType='array'
    }else{
        fieldDataType= collRule[fieldName]['type']
    }

    // let fieldRule = collRule[fieldName]
    // let recordInfo = misc.objectDeepCopy(normalRecordInfo)

    // let i = 0
    //某些rule可能会生成多个测试数据（例如：require，可以是undefined，也可以是0/""/[]/{}等）
    let recordInfos = []

    let allValidDataType=Object.values(e_serverDataType)
    allValidDataType.push('array')//rule中直接用[]扩起数据类型，所以serverDataType无此类型，需要手工添加
    // console.log(`fieldDataType======>${fieldDataType}`)
    // console.log(`allValidDataType======>${JSON.stringify(allValidDataType)}`)
    for(let singleDataType of allValidDataType){
        //产生其他非当前dataType的数据
        let valueMatchDataType
        if(fieldDataType!==singleDataType){
            switch (singleDataType){
                case "array":
                    valueMatchDataType=[1]
                    break;
                case e_serverDataType.OBJECT:
                    // console.log(`in obhecadfadfafa`)
                    valueMatchDataType={a:1}
                    break
                case e_serverDataType.STRING:
                    //如果字段类型是object_id，此时再设置测试字段值为string，可能会产生format的错误，而不是期望的类型错误，所以skip
                    if(fieldDataType===e_serverDataType.OBJECT_ID){
                        continue
                    }
                    valueMatchDataType=`asdf`
                    break
                case e_serverDataType.FOLDER:
                    //如果字段类型是字符，此时再设置测试字段值为目录，可能会产生format的错误，而不是期望的类型错误，所以skip
                    if(fieldDataType===e_serverDataType.STRING || fieldDataType===e_serverDataType.OBJECT_ID){
                        continue
                    }
                    valueMatchDataType=`C:/Windows/`
                    break
                case e_serverDataType.FILE:
                    //如果字段类型是字符，此时再设置测试字段值为目录，可能会产生format的错误，而不是期望的类型错误，所以skip
                    if(fieldDataType===e_serverDataType.STRING || fieldDataType===e_serverDataType.OBJECT_ID){
                        continue
                    }
                    valueMatchDataType=`C:/Windows/win.ini`
                    break
                //number和float一样，可以忽略
                case e_serverDataType.NUMBER:
                    //valueMatchDataType=123456789123456789123456789
                    continue
                // break
                case e_serverDataType.OBJECT_ID:
                    //如果字段类型是字符，此时再设置测试字段值为目录，可能会产生format的错误，而不是期望的类型错误，所以skip
                    if(fieldDataType===e_serverDataType.STRING){
                        continue
                    }
                    valueMatchDataType="59db1e1e45112c01e472b6d7"
                    break
                case e_serverDataType.DATE:
                    // valueMatchDataType=new Date()
                    //Date返回的不是字符（new Date()），就是数字（Date.now()），可以在e_serverDataType.STRING和e_serverDataType.FLOAT中覆盖，所以可以忽略
                    continue
                    break
                case e_serverDataType.BOOLEAN:
                    valueMatchDataType=true
                    break
                case e_serverDataType.FLOAT:
                    valueMatchDataType=1.1
                    break
                case e_serverDataType.INT:
                    //如果待测字段的类型为boolean，那么产生的测试数据为0。以便测试程序是否会将0当成boolean
                    if(fieldDataType===e_serverDataType.BOOLEAN){
                        valueMatchDataType=0
                    }else{
                        valueMatchDataType=1
                    }

                    break
                default:
                    // 只有require为true的时候，传入null/undefined才有意义；false时，直接返回0
                    if(collRule[fieldName][e_serverRuleType.REQUIRE][`define`]===true){
                        valueMatchDataType=null
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        valueMatchDataType=undefined
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        valueMatchDataType=NaN
                    }

                // console.log(`valueMatchDataType============>${JSON.stringify(valueMatchDataType)}`)
            }
            console.log(`valueMatchDataType========${JSON.stringify(valueMatchDataType)}`)
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            // console.log(`recordInfos=======>${JSON.stringify(recordInfos)}`)
        }
    }

    //如果是array，为ele产生不同的类型
    if(fieldDataType==='array'){
        let eleDataType=collRule[fieldName]['type'][0]
        let eleValueMatchDataType
        for(let singleDataType of allValidDataType){
            if(singleDataType!==eleDataType){
                switch (singleDataType){
                    case e_serverDataType.OBJECT:
                        eleValueMatchDataType=[{},{}]
                        break
                    case e_serverDataType.STRING:
                        eleValueMatchDataType=[``,``]
                        break
                    case e_serverDataType.FOLDER:
                        //如果字段类型是数组，且其中元素的类型是字符，此时再设置测试字段值为目录，可能会产生format的错误，而不是期望的类型错误，所以skip
                        if(eleDataType===e_serverDataType.STRING){
                            continue
                        }
                        eleValueMatchDataType=[`C:/Windows/`]
                        break
                    case e_serverDataType.FILE:
                        //如果字段类型是数组，且其中元素的类型是字符，此时再设置测试字段值为目录，可能会产生format的错误，而不是期望的类型错误，所以skip
                        if(eleDataType===e_serverDataType.STRING){
                            continue
                        }
                        eleValueMatchDataType=[`C:/Windows/win.ini`]
                        break
                    case e_serverDataType.NUMBER:
                        eleValueMatchDataType=[923456789123456789123456789,923456789123456789123456789]
                        break
                    case e_serverDataType.OBJECT_ID:
                        //如果字段类型是数组，且其中元素的类型是字符，此时再设置测试字段值为目录，可能会产生format的错误，而不是期望的类型错误，所以skip
                        if(eleDataType===e_serverDataType.STRING){
                            continue
                        }
                        eleValueMatchDataType=["59db1e1e45112c01e472b6d7"]
                        break
                    case e_serverDataType.DATE:
                        //Date返回的不是字符（new Date()），就是数字（Date.now()），可以在e_serverDataType.STRING和e_serverDataType.FLOAT中覆盖，所以可以忽略
                        // eleValueMatchDataType=[Date.now()]
                        continue
                        break
                    case e_serverDataType.BOOLEAN:
                        eleValueMatchDataType=[true]
                        break
                    case e_serverDataType.FLOAT:
                        eleValueMatchDataType=[1.1]
                        break
                    case e_serverDataType.INT:
                        eleValueMatchDataType=[1]
                        break
                    default:
                        // console.log(`====>default in<==========`)
                        //undefined和NaN好像最终会变成null？但是无论如何，还是设置undefined和null再说
                        eleValueMatchDataType=[null]
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:eleValueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        eleValueMatchDataType=[undefined]
                        // console.log(`eleValueMatchDataType       ===========${JSON.stringify(eleValueMatchDataType)}`)
                        // console.log(`gene                        ===========${JSON.stringify(generateTestRecord({fieldValueToBeGenerate:eleValueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))}`)
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:eleValueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        eleValueMatchDataType=[NaN]
                }
                recordInfos.push(generateTestRecord({fieldValueToBeGenerate:eleValueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            }
        }
    }

    return recordInfos
}

/*      基于正常document，根据不同rule，产生对应的测试数据
 *  @normalRecordInfo:一个正常的输入(document)
 *   @ruleDefine: rule中define字段的值  {require:{define:true},error:{}}
 *
 *  return:嵌入到data.values.recordInfo的数据
 * */
function generateTestDataForRecordInfoValue({parameter,fieldName,ruleName}){
    // console.log(`collRule=========>${JSON.stringify(collRule)}`)
    // let {reqBodyValues,collRule,method}=parameter
    let {sess,sessErrorRc,APIUrl,penalizeRelatedInfo,reqBodyValues,collName,skipParts,app}=parameter
    let collRule=browserInputRule[collName]
    let method=reqBodyValues[e_part.METHOD]
    let normalRecordInfo=reqBodyValues[e_part.RECORD_INFO]
    let ruleDefine=collRule[fieldName][ruleName]['define']
    let fieldDataType=collRule[fieldName]['type']

    let fieldDataTypeIsArray=fieldDataType instanceof Array
    let testValue

    let fieldRule=collRule[fieldName]
    let recordInfo = misc.objectDeepCopy(normalRecordInfo)

    let i=0
    //某些rule可能会生成多个测试数据（例如：require，可以是undefined，也可以是0/""/[]/{}等）
    let recordInfos=[]
    // console.log(`recordInfo before=========>${JSON.stringify(recordInfo)}`)
    // console.log(`fieldName=========>${JSON.stringify(fieldName)}`)

    // console.log(`require recordInfo=========>${JSON.stringify(recordInfo)}`)

    switch (ruleName){
        case e_serverRuleType.REQUIRE:
            //
            if(true===ruleDefine ){//&&
                //字段未定义
                //只有CREATE的时候，才能测试删除require字段的测试（update的时候，require字段为undefined，则会忽略此字段的检测）
                if(method===e_method.CREATE){
                    recordInfos.push(generateTestRecord({fieldValueToBeGenerate:undefined,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                }
                recordInfos.push(generateTestRecord({fieldValueToBeGenerate:null,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                // let dataTypeBasedRecordInfo
                switch (fieldDataType){
                    case e_serverDataType.STRING:
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:"",originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:"       ",originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                    case e_serverDataType.INT:
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:NaN,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                    case e_serverDataType.NUMBER:
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:NaN,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                    case e_serverDataType.FLOAT:
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:NaN,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                    case e_serverDataType.FOLDER:
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:"folderNotExist",originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                    case e_serverDataType.FILE:
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:"fileNotExist",originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                    case e_serverDataType.OBJECT:
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:{},originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                    case e_serverDataType.BOOLEAN:
                        break;
                    case e_serverDataType.OBJECT_ID:
                        //object_id是string类型，所以也可以测试空字符串
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:"",originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:"       ",originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        break;
                }
                if(true===fieldDataTypeIsArray){
                    recordInfos.push(generateTestRecord({fieldValueToBeGenerate:[],originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                }
                // recordInfos.push(dataTypeBasedRecordInfo)
            }
            break;
        case e_serverRuleType.FORMAT:
            if(true===fieldDataTypeIsArray){
                testValue=['1(2']
            }else{
                testValue='1(2'
            }
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:testValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MIN_LENGTH:
            //minLength采用字符长度为1。如果有rule设置minLenght为1，需要删除此rule，因为和require重复了
            if(true===fieldDataTypeIsArray){
                testValue=['1']
            }else{
                testValue='1'
            }
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:testValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MAX_LENGTH:
            // let maxLengthDefine=ruleDefine['define']
            let maxString=""
            i=0
            while (i<=ruleDefine){
                maxString+='a'
                i++
            }
            if(true===fieldDataTypeIsArray){
                testValue=[maxString]
            }else{
                testValue=maxString
            }
            // console.log(maxString.length)
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:testValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MIN:
            let minValue=ruleDefine-1
            if(true===fieldDataTypeIsArray){
                testValue=[minValue]
            }else{
                testValue=minValue
            }
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:testValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MAX:
            let maxValue=ruleDefine+1
            if(true===fieldDataTypeIsArray){
                testValue=[maxValue]
            }else{
                testValue=maxValue
            }
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:testValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.ARRAY_MIN_LENGTH:
            let arrayMinLength=[]
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:arrayMinLength,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.ARRAY_MAX_LENGTH:
            let arrayMaxLength=[]
            i=0
            while (i<=ruleDefine){
                arrayMaxLength.push(`999`)
                i++
            }
            // console.log(`arrayMaxLength=====>${JSON.stringify(arrayMaxLength)}`)
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:arrayMaxLength,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.ENUM:
            // console.log(`enum datatype =====>${JSON.stringify(fieldDataType)}`)
            let notExistEnumValue
            if(fieldDataType===e_serverDataType.STRING){
                notExistEnumValue='999'
            }
            if(fieldDataType instanceof Array){
                notExistEnumValue=['999']
            }
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:notExistEnumValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        default:
    }

    return recordInfos
}

function generateMiscTestDataForRecordInfo(parameter) {
    // console.log(`parameter=============.${JSON.stringify(parameter)}`)
    let recordInfos=[]
    let {sess,sessErrorRc,APIUrl,penalizeRelatedInfo,reqBodyValues,collName,skipParts,app}=parameter
    let normalRecordInfo=reqBodyValues[e_part.RECORD_INFO]
    // console.log(`collName==========>${collName}`)
    let collRule=browserInputRule[collName]
    // console.log(`collRule==========>${collRule}`)
    //not exist field
    let copyRecordInfo=misc.objectDeepCopy(normalRecordInfo)
    let fieldNameToBeReplacedByNotExist
    //遍历collRule（browserInputRule），查找是否有require=false的字段，
    for(let singleFieldName in collRule){
        if(collRule[singleFieldName][e_serverRuleType.REQUIRE]===false){
            fieldNameToBeReplacedByNotExist=singleFieldName
            break
        }
    }
    //console.log(`before check: fieldNameToBeReplacedByNotExist>>>>>>>>>${JSON.stringify(fieldNameToBeReplacedByNotExist)}`)

    //如果没有，使用递归一个require=true的字段
    if(undefined===fieldNameToBeReplacedByNotExist){
        fieldNameToBeReplacedByNotExist=Object.keys(collRule)[0]
    }
    //console.log(`after check: fieldNameToBeReplacedByNotExist>>>>>>>>>${JSON.stringify(fieldNameToBeReplacedByNotExist)}`)
    // console.log(`before check: copyRecordInfo>>>>>>>>>${JSON.stringify(copyRecordInfo)}`)
    delete copyRecordInfo[fieldNameToBeReplacedByNotExist]
    copyRecordInfo['notExist']=''

    recordInfos.push(copyRecordInfo)

    return recordInfos
}

function generateTestRecord({fieldValueToBeGenerate,originNormalData,fieldToBeCheck}){
    console.log(`fieldValueToBeGenerate=========>${JSON.stringify(fieldValueToBeGenerate)}`)
    let dataTypeBasedRecordInfo=misc.objectDeepCopy(originNormalData)
    dataTypeBasedRecordInfo[fieldToBeCheck]=fieldValueToBeGenerate
    return dataTypeBasedRecordInfo
}


module.exports={
    /*************  RECORD_ID   *******/
    generateTestDataForRecordIdDataType,
    generateTestDataForRecordIdValue,

    /*************  RECORD_INFO   *******/
    generateTestDataForRecordInfoDataType,
    generateTestDataForRecordInfoValue,

    /*************  misc  *************/
    generateMiscTestDataForRecordInfo,

    /*************  common  *************/
    generateTestRecord,
}