/**
 * Created by Ada on 2017/10/7.
 * 通过API测试inputRule
 */
'use strict'

const request=require('supertest')
const assert=require('assert')


const nodeEnum=require(`../constant/enum/nodeEnum`)
const nodeRuntimeEnum=require(`../constant/enum/nodeRuntimeEnum`)
const mongoEnum=require(`../constant/enum/mongoEnum`)

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../constant/genEnum/DB_Coll').Coll
const e_field=require('../constant/genEnum/DB_field').Field

const misc=require(`../function/assist/misc`)


const e_serverRuleType=require(`../constant/enum/inputDataRuleType`).ServerRuleType
const e_serverDataType=require(`../constant/enum/inputDataRuleType`).ServerDataType

const validateValueError=require(`../constant/error/validateError`).validateValue
const validateFormatError=require(`../constant/error/validateError`).validateFormat

//API返回的结果中，在哪个level取得rc
const RC_LEVEL={
    COMMON:'COMMON', //result.rc
    FIELD:'FIELD', //result.msg[fieldName].rc
}
/*  检查input中require的field
* @sess：是否需要sess
* @APIUrl:测试使用的URL
* @normalRecordInfo:一个正常的输入(document)
* @method：测试require的时候，使用哪种method。默认是create
* @fieldName：需要对那个field进行require测试
* @singleRuleName: field下，某个rule的名称
* @collRule: 整个coll的rule
*
* @expectedRuleToBeCheck：数组。那些rule是希望被检查的，如果为空数据，则所有rule都要检查
* */

function ruleCheckAll({parameter,expectedRuleToBeCheck,expectedFieldName}){
    let allValidRuleName=Object.values(e_serverRuleType)
    let collRule=parameter.collRule
    let normalRecordInfo=parameter.normalRecordInfo
    // console.log(`normalRecordInfo===========>${JSON.stringify(normalRecordInfo)}`)
    let generatedTestData
    //coll级别

    it(`misc test `, async function(){
        console.log(`==========================================================================`)
        console.log(`======================     misc test start   =============================`)
        console.log(`==========================================================================`)
        let testDataMisc=generateMiscTestData(parameter)
        await ruleTest_async(parameter,testDataMisc,validateFormatError.recordInfoFiledRuleNotDefine.rc,RC_LEVEL.COMMON)
        console.log(`==========================================================================`)
        console.log(`========================     misc test end   =============================`)
        console.log(`==========================================================================`)
    })

    for(let singleFieldName in collRule){
        // console.log(`singleFieldName=======>${JSON.stringify(singleFieldName)}`)
        if(expectedFieldName.length>0){
            if(-1===expectedFieldName.indexOf(singleFieldName)){
                continue
            }
        }

        //field级别，只检查数据类型
        it(`${[singleFieldName]}: ${`undefined`} `, async function(){
            console.log(`==========================================================================`)
            console.log(`==================     dataType test start   =============================`)
            console.log(`==========================================================================`)
            parameter.fieldName=singleFieldName
            parameter.singleRuleName='undefined'
            generatedTestData=generateTestDataBaseFieldDataType(parameter)
            await ruleTest_async(parameter,generatedTestData,validateValueError.CUDTypeWrong.rc,RC_LEVEL.FIELD)
            console.log(`==========================================================================`)
            console.log(`==================     dataType test end     =============================`)
            console.log(`==========================================================================`)
        });

        //rule级别，检查field中定义的rule
        for(let singleRuleName in collRule[singleFieldName]){
            // console.log(`singleRuleOfField=======>${JSON.stringify(singleRuleOfField)}`)
            // console.log(`for singleRuleOfField========>${singleRuleOfField}`)
            //期望检查的rule不为空，且当前rule不为期望rule，skip
            if(undefined!==expectedRuleToBeCheck && expectedRuleToBeCheck.length>0){
                if(-1===expectedRuleToBeCheck.indexOf(singleRuleName)){
                    continue
                }
            }
            if(-1!==allValidRuleName.indexOf(singleRuleName)){

                it(`${[singleFieldName]}: ${singleRuleName} `, async function(){
                    console.log(`==========================================================================`)
                    console.log(`======================     rule test start   =============================`)
                    console.log(`==========================================================================`)
                    parameter.fieldName=singleFieldName
                    parameter.singleRuleName=singleRuleName
                    // parameter.collRule=collRule
                    // parameter.singleRuleDefine=collRule[singleFieldName][singleRuleName]
                    // parameter.fieldDataType=collRule[singleFieldName]['type']
                    //field中每个rule级别
                    generatedTestData=generateTestDataBaseValidaRule(parameter)
                    await ruleTest_async(parameter,generatedTestData,collRule[singleFieldName][singleRuleName]['error']['rc'],RC_LEVEL.FIELD)
                    console.log(`==========================================================================`)
                    console.log(`======================     rule test end     =============================`)
                    console.log(`==========================================================================`)
                });

            }
        }
    }
}

/*  检查input中require的field
* @sess：是否需要sess
* @APIUrl:测试使用的URL
* @normalRecordInfo:一个正常的输入(document)
* @method：测试require的时候，使用哪种method。默认是create
* @fieldName：需要对那个field进行require测试
* @singleRuleName: field下，某个rule的名称
* @collRule: 整个coll的rule
*
* @rcLevel:传入的rc是在filed进行比较，还是在common level进行比较
* */
async function ruleTest_async(parameter,generatedTestData,expectedErrorRc,rcLevel=RC_LEVEL.FIELD){
    let {sess,APIUrl,normalRecordInfo,method=e_method.CREATE,fieldName,singleRuleName,collRule,app}=parameter
    let data={values:{}}
    data.values[e_part.METHOD] = method
    //如果是update，还需要额外的redordId字段，以便通过preCheck中expectedParts的测试，所以实际Id是什么无所谓
    if(method===e_method.UPDATE){
        data.values[e_part.RECORD_ID]='59e40d516e27882dc82ce9f6'
    }
    if(generatedTestData.length>0){
        for(let singleRecordInfo of generatedTestData){
            data.values[e_part.RECORD_INFO] =singleRecordInfo
            if(rcLevel===RC_LEVEL.FIELD){
                await  sendDataToAPI_compareFieldRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:fieldName,app:app})
            }
            if(rcLevel===RC_LEVEL.COMMON){
                await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            }

        }
    }
}



/*      基于正常document，根据不同rule，产生对应的测试数据
*  @normalRecordInfo:一个正常的输入(document)
*   @ruleDefine: rule中define字段的值  {require:{define:true},error:{}}
*
*  return:嵌入到data.values.recordInfo的数据
* */
function generateTestDataBaseValidaRule(parameter){
    // console.log(`collRule=========>${JSON.stringify(collRule)}`)
    let {normalRecordInfo,fieldName,singleRuleName:ruleName,collRule,method}=parameter
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
            //cretea才有必要测试require
            if(true===ruleDefine && method===e_method.CREATE){
                //字段未定义
/*                let undefinedRecordInfo=misc.objectDeepCopy(normalRecordInfo)
                delete  undefinedRecordInfo[fieldName]
                recordInfos.push(undefinedRecordInfo)*/
                recordInfos.push(generateTestRecord({fieldValueToBeGenerate:undefined,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
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

/*                  根据field的数据类型，产生所有不符合此数据类型的测试数据              */
function generateTestDataBaseFieldDataType(parameter) {
    // console.log(`collRule=========>${JSON.stringify(collRule)}`)
    // let ruleDefine = collRule[fieldName][ruleName]['define']
    let {normalRecordInfo,fieldName,collRule}=parameter
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
                    // console.log(`====>default in<==========`)
                    valueMatchDataType=null
                    recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                    valueMatchDataType=undefined
                    recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                    valueMatchDataType=NaN
                    // console.log(`valueMatchDataType============>${JSON.stringify(valueMatchDataType)}`)
            }
            // console.log(`valueMatchDataType========${JSON.stringify(valueMatchDataType)}`)
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

function generateMiscTestData(parameter) {
    let recordInfos=[]
    let {normalRecordInfo,fieldName,collRule}=parameter

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

function generateTestRecord({originNormalData,fieldToBeCheck,fieldValueToBeGenerate}){
    let dataTypeBasedRecordInfo=misc.objectDeepCopy(originNormalData)
    dataTypeBasedRecordInfo[fieldToBeCheck]=fieldValueToBeGenerate
    return dataTypeBasedRecordInfo
}
/*  实际调用supertest，将数据发送到对应的API
*
* */
async function sendDataToAPI_compareFieldRc_async({APIUrl,sess,data,expectedErrorRc,fieldName,app}){
    return new Promise(function(resolve,reject){

        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`data.values===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

async function sendDataToAPI_compareCommonRc_async({APIUrl,sess,data,expectedErrorRc,app}){
    return new Promise(function(resolve,reject){

        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

//测试preCHeck中，非rule相关的部分
/*async function dispatchCheckAll_async(parameter){
    let {sess,APIUrl,normalRecordInfo,method,fieldName,singleRuleName,collRule,app}=parameter
    let expectedErrorRc
    let  data={values:{}}
    //根据method，设定除了method之外的其他part
    let expectedParts
    switch (method){
        case e_method.CREATE:
            expectedParts=[e_part.RECORD_INFO]
            break;
        case e_method.UPDATE:
            expectedParts=[e_part.RECORD_INFO,e_part.RECORD_ID]
            break;
        case e_method.DELETE:
            expectedParts=[e_part.RECORD_ID]
            break;
    }
    //1. miss method
    expectedErrorRc=
    await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:undefined,data:data,expectedErrorRc:expectedErrorRc,app:app})
    //2. miss mandatory part
    //3  more part than mandatory

    //

}*/
module.exports={
    // ruleTest_async,
    // ruleFormatTest_async,
    // ruleEnumTest_async,
    ruleCheckAll,
}