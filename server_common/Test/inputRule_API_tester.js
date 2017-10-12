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

function ruleCheckAll({parameter,expectedRuleToBeCheck}){
    let allValidRuleName=Object.values(e_serverRuleType)
    let collRule=parameter.collRule
    for(let singleFieldName in collRule){
        // console.log(`singleFieldName=======>${JSON.stringify(singleFieldName)}`)
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
                    parameter.fieldName=singleFieldName
                    parameter.singleRuleName=singleRuleName
                    // parameter.collRule=collRule
                    // parameter.singleRuleDefine=collRule[singleFieldName][singleRuleName]
                    // parameter.fieldDataType=collRule[singleFieldName]['type']
                    await ruleTest_async(parameter)
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
* */
async function ruleTest_async(parameter){
    let {sess,APIUrl,normalRecordInfo,method=e_method.CREATE,fieldName,singleRuleName,collRule,app}=parameter
    // console.log(`require:fieldName is ========>${JSON.stringify(fieldName)}`)
    // console.log(`collRule is ${JSON.stringify(collRule)}`)
    // console.log(`method is ${JSON.stringify(method)}`)
    // console.log(`normalRecordInfo is ${JSON.stringify(normalRecordInfo)}`)
    // console.log(`requireFieldRule is ${JSON.stringify(requireFieldRule)}`)
    let data={values:{}}
    data.values[e_part.METHOD] = method
    let testDataBaseRule=generateTestDataBaseValidaRule({normalRecordInfo:normalRecordInfo,fieldName:fieldName,ruleName:singleRuleName,collRule:collRule})
    let testDataBaseDataType=generateTestDataBaseFieldDataType({normalRecordInfo:normalRecordInfo,fieldName:fieldName,collRule:collRule})
    let testDataMisc=generateMiscTestData({normalRecordInfo:normalRecordInfo,fieldName:fieldName,collRule:collRule})
    let recordInfos=testDataBaseDataType.concat(testDataBaseRule).concat(testDataMisc)

    // console.log(`recordInfos==========>${JSON.stringify(recordInfos)}`)
    if(recordInfos.length>0){
        for(let singleRecordInfo of recordInfos){
            data.values[e_part.RECORD_INFO] =singleRecordInfo
            // console.log(`data.values==========>${JSON.stringify(data.values)}`)
            await  sendDataToAPI_async({APIUrl:APIUrl,sess:sess,data:data,singleRuleDefine:collRule[fieldName][singleRuleName],fieldName:fieldName,app:app})
        }
    }
}

/*      基于正常document，根据不同rule，产生对应的测试数据
*  @normalRecordInfo:一个正常的输入(document)
*   @ruleDefine: rule中define字段的值  {require:{define:true},error:{}}
*
*  return:嵌入到data.values.recordInfo的数据
* */
function generateTestDataBaseValidaRule({normalRecordInfo,fieldName,ruleName,collRule}){
    // console.log(`collRule=========>${JSON.stringify(collRule)}`)
    let ruleDefine=collRule[fieldName][ruleName]['define']
    let fieldDataType=collRule[fieldName]['type']
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
            if(true===ruleDefine){
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
                        break;
                }
                if(fieldDataType instanceof Array){
                    recordInfos.push(generateTestRecord({fieldValueToBeGenerate:[],originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                }
                // recordInfos.push(dataTypeBasedRecordInfo)
            }

            break;

        case e_serverRuleType.FORMAT:
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:'1(2',originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MIN_LENGTH:
            //minLength采用字符长度为1。如果有rule设置minLenght为1，需要删除此rule，因为和require重复了
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:'1',originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MAX_LENGTH:
            // let maxLengthDefine=ruleDefine['define']
            let maxString=""
            i=0
            while (i<=ruleDefine){
                maxString+='a'
                i++
            }
            // console.log(maxString.length)
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:maxString,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MIN:
            let minValue=ruleDefine-1
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:minValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        case e_serverRuleType.MAX:
            let maxValue=ruleDefine+1
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:maxValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
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
            // console.log("["+`${e_serverDataType.STRING}`+"]")
            // console.log(fieldDataType)
            if(fieldDataType instanceof Array){
                notExistEnumValue=['999']
            }
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:notExistEnumValue,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            break;
        default:
    }

    return recordInfos
}

function generateTestDataBaseFieldDataType({normalRecordInfo,fieldName,collRule}) {
    // console.log(`collRule=========>${JSON.stringify(collRule)}`)
    // let ruleDefine = collRule[fieldName][ruleName]['define']

    let fieldDataType
    if(collRule[fieldName]['type'] instanceof Array){
        fieldDataType='array'
    }else{
        fieldDataType= collRule[fieldName]['type']
    }

    // let fieldRule = collRule[fieldName]
    let recordInfo = misc.objectDeepCopy(normalRecordInfo)

    let i = 0
    //某些rule可能会生成多个测试数据（例如：require，可以是undefined，也可以是0/""/[]/{}等）
    let recordInfos = []

    let allValidDataType=Object.keys(e_serverDataType)
    allValidDataType.push('array')//rule中直接用[]扩起数据类型，所以serverDataType无此类型，需要手工添加


    for(let singleDataType of allValidDataType){
        //产生其他非当前dataType的数据
        let valueMatchDataType
        if(fieldDataType!==singleDataType){
            switch (singleDataType){
                case "array":
                    valueMatchDataType=[]
                    break;
                case e_serverDataType.OBJECT:
                    valueMatchDataType={}
                    break
                case e_serverDataType.STRING:
                    valueMatchDataType=``
                    break
                case e_serverDataType.FOLDER:
                    valueMatchDataType=`C:/Windows/`
                    break
                case e_serverDataType.FILE:
                    valueMatchDataType=`C:/Windows/win.ini`
                    break
                case e_serverDataType.NUMBER:
                    valueMatchDataType=123456789123456789123456789
                    break
                case e_serverDataType.OBJECT_ID:
                    valueMatchDataType="59db1e1e45112c01e472b6d7"
                    break
                case e_serverDataType.DATE:
                    valueMatchDataType=Date.now()
                    break
                case e_serverDataType.BOOLEAN:
                    valueMatchDataType=true
                    break
                case e_serverDataType.FLOAT:
                    valueMatchDataType=1.1
                    break
                case e_serverDataType.INT:
                    valueMatchDataType=1
                    break
                default:
                    valueMatchDataType=null
                    recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                    valueMatchDataType=undefined
                    recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                    valueMatchDataType=NaN
            }
            recordInfos.push(generateTestRecord({fieldValueToBeGenerate:valueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
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
                        eleValueMatchDataType=[{}]
                        break
                    case e_serverDataType.STRING:
                        eleValueMatchDataType=[``]
                        break
                    case e_serverDataType.FOLDER:
                        eleValueMatchDataType=[`C:/Windows/`]
                        break
                    case e_serverDataType.FILE:
                        eleValueMatchDataType=[`C:/Windows/win.ini`]
                        break
                    case e_serverDataType.NUMBER:
                        eleValueMatchDataType=[23456789123456789123456789]
                        break
                    case e_serverDataType.OBJECT_ID:
                        eleValueMatchDataType=["59db1e1e45112c01e472b6d7"]
                        break
                    case e_serverDataType.DATE:
                        eleValueMatchDataType=[Date.now()]
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
                        eleValueMatchDataType=[null]
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:eleValueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        eleValueMatchDataType=[undefined]
                        recordInfos.push(generateTestRecord({fieldValueToBeGenerate:eleValueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
                        eleValueMatchDataType=[NaN]
                }
                recordInfos.push(generateTestRecord({fieldValueToBeGenerate:eleValueMatchDataType,originNormalData:normalRecordInfo,fieldToBeCheck:fieldName}))
            }
        }
    }

    return recordInfos
}

function generateMiscTestData({normalRecordInfo,fieldName,collRule}) {
    let recordInfos=[]

    let copyRecordInfo=misc.objectDeepCopy(normalRecordInfo)
    delete copyRecordInfo[fieldName]
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
async function sendDataToAPI_async({APIUrl,sess,data,singleRuleDefine,fieldName,app}){
    return new Promise(function(resolve,reject){
        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                console.log(`data.values===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes  ===========>${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, singleRuleDefine.error.rc)
                return resolve(true)
            });
    })
}

module.exports={
    // ruleTest_async,
    // ruleFormatTest_async,
    // ruleEnumTest_async,
    ruleCheckAll,
}