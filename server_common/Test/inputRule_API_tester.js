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
    let recordInfos=generateTestData({normalRecordInfo:normalRecordInfo,fieldName:fieldName,ruleName:singleRuleName,collRule:collRule})
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
function generateTestData({normalRecordInfo,fieldName,ruleName,collRule}){
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
                let undefinedRecordInfo=misc.objectDeepCopy(normalRecordInfo)
                delete  undefinedRecordInfo[fieldName]
                recordInfos.push(undefinedRecordInfo)

                let dataTypeBasedRecordInfo=misc.objectDeepCopy(normalRecordInfo)
                switch (fieldDataType){
                    case e_serverDataType.STRING:
                        dataTypeBasedRecordInfo[fieldName]={value:""}
                        break;
                    case e_serverDataType.INT:
                        dataTypeBasedRecordInfo[fieldName]={value:NaN}
                        break;
                    case e_serverDataType.NUMBER:
                        dataTypeBasedRecordInfo[fieldName]={value:NaN}
                        break;
                    case e_serverDataType.FLOAT:
                        dataTypeBasedRecordInfo[fieldName]={value:NaN}
                        break;
                    case e_serverDataType.FOLDER:
                        dataTypeBasedRecordInfo[fieldName]={value:'folderNotExist'}
                        break;
                    case e_serverDataType.FILE:
                        dataTypeBasedRecordInfo[fieldName]={value:'fileNotExist'}
                        break;
                    case e_serverDataType.OBJECT:
                        dataTypeBasedRecordInfo[fieldName]={value:{}}
                        break;
                    case e_serverDataType.BOOLEAN:
                        dataTypeBasedRecordInfo[fieldName]={value:null}
                        break;
                    case e_serverDataType.OBJECT_ID:
                        dataTypeBasedRecordInfo[fieldName]={value:null}
                        break;
                }
                if(fieldDataType instanceof Array){
                    dataTypeBasedRecordInfo[fieldName]={value:[]}
                }
                recordInfos.push(dataTypeBasedRecordInfo)
            }

            break;

        case e_serverRuleType.FORMAT:
            recordInfo[fieldName] = {value: '1(2'}
            recordInfos.push(recordInfo)
            break;
        case e_serverRuleType.MIN_LENGTH:
            recordInfo[fieldName] = {value: '1'}  //minLength采用字符长度为1。如果有rule设置minLenght为1，需要删除此rule，因为和require重复了
            recordInfos.push(recordInfo)
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
            recordInfo[fieldName] = {value:  maxString}
            recordInfos.push(recordInfo)
            break;
        case e_serverRuleType.MIN:
            let minValue=ruleDefine-1
            recordInfo[fieldName] = {value:  minValue}
            recordInfos.push(recordInfo)
            break;
        case e_serverRuleType.MAX:
            let maxValue=ruleDefine+1
            recordInfo[fieldName] = {value:  maxValue}
            recordInfos.push(recordInfo)
            break;
        case e_serverRuleType.ARRAY_MIN_LENGTH:
            let arrayMinLength=[]
            recordInfo[fieldName] = {value:  arrayMinLength}
            recordInfos.push(recordInfo)
            break;
        case e_serverRuleType.ARRAY_MAX_LENGTH:
            let arrayMaxLength=[]
            i=0
            while (i<=ruleDefine){
                arrayMaxLength.push(`999`)
                i++
            }
            // console.log(`arrayMaxLength=====>${JSON.stringify(arrayMaxLength)}`)
            recordInfo[fieldName] = {value:  arrayMaxLength}
            recordInfos.push(recordInfo)
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
            recordInfo[fieldName] = {value:  notExistEnumValue}
            recordInfos.push(recordInfo)
            break;
        default:
    }

    return recordInfos
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