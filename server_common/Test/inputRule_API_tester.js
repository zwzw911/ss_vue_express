/**
 * Created by Ada on 2017/10/7.
 * 通过API测试inputRule
 */
'use strict'
const ap=require(`awesomeprint`)

const request=require('supertest')
const assert=require('assert')


const nodeEnum=require(`../constant/enum/nodeEnum`)
const nodeRuntimeEnum=require(`../constant/enum/nodeRuntimeEnum`)
const mongoEnum=require(`../constant/enum/mongoEnum`)

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../constant/genEnum/DB_Coll').Coll
const e_field=require('../constant/genEnum/DB_field').Field
const e_dbModel=require('../constant/genEnum/dbModel')
const e_skipPart=require(`../constant/testCaseEnum/testCaseEnum`).SkipPart

const misc=require(`../function/assist/misc`)


const e_serverRuleType=require(`../constant/enum/inputDataRuleType`).ServerRuleType
const e_serverDataType=require(`../constant/enum/inputDataRuleType`).ServerDataType
const e_otherORuleFiledName=require(`../constant/enum/inputDataRuleType`).OtherORuleFiledName
const e_penalizeSubType=require(`../constant/enum/mongoEnum`).PenalizeSubType.DB

const validateValueError=require(`../constant/error/validateError`).validateValue
const validateFormatError=require(`../constant/error/validateError`).validateFormat

const helperError=require(`../constant/error/controller/helperError`).helper

const generateTestData_API=require(`./generateTestData_API`)

const browserInputRule=require(`../constant/inputRule/browserInputRule`).browserInputRule

const API_helper=require(`./API_helper`)
const db_operation_helper=require(`./db_operation_helper`)
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

async function ruleCheckAll_async({parameter,expectedRuleToBeCheck,expectedFieldName,skipRuleToBeCheck,skipFieldName}){
    let allValidRuleName=Object.values(e_serverRuleType)
    //console.log(`parameter ruleCheckAll_async===>${JSON.stringify(parameter)}`)
    let {sess,sessErrorRc,APIUrl,penalizeRelatedInfo,reqBodyValues,collName,skipParts,app}=parameter
    let collRule=browserInputRule[collName]
    let method=reqBodyValues[e_part.METHOD]
    // let normalRecordInfo=parameter.normalRecordInfo
// console.log(`1st reqBodyValues=========>${JSON.stringify(reqBodyValues)}`)
    let generatedTestData
    //RECORD_ID的测试
    if(method===e_method.DELETE || method===e_method.UPDATE){
        // skipParts中不包含recordId
        if(undefined===skipParts || -1===skipParts.indexOf(e_skipPart.RECORD_ID)){
            console.log(`==========================================================================`)
            console.log(`===================         RECORD_ID dataType       =====================`)
            console.log(`==========================================================================`)
            let testDataFormat=generateTestData_API.generateTestDataForRecordIdDataType()
            await RECORD_ID_TEST_async({parameter:parameter,generatedTestData:testDataFormat,expectedErrorRc:validateFormatError.inputValuePartRecordIdValueFormatWrong.rc})
            // })
            // it(`DELETE: recordId value check`,async function(){
            console.log(`==========================================================================`)
            console.log(`===================        RECORD_ID value        ========================`)
            console.log(`==========================================================================`)
            testDataFormat=generateTestData_API.generateTestDataForRecordIdValue(parameter)
            await RECORD_ID_TEST_async({parameter:parameter,generatedTestData:testDataFormat,expectedErrorRc:validateFormatError.inputValuePartRecordIdValueFormatWrong.rc})
        }

        // })
    }
    // console.log(`2nd reqBodyValues=========>${JSON.stringify(reqBodyValues)}`)
    if(method===e_method.CREATE || method===e_method.UPDATE){

        //coll级别
        // skipParts中不包含recordInfo_misc和recordInfo
        if(undefined===skipParts || (-1===skipParts.indexOf(e_skipPart.RECORD_INFO_MISC) && -1===skipParts.indexOf(e_skipPart.RECORD_INFO))) {
            // console.log(`skipParts=========.${JSON.stringify(skipParts)}`)
            // console.log(`-1===skipParts.indexOf(e_skipPart.RECORD_INFO_MISC) && -1===skipParts.indexOf(e_skipPart.RECORD_INFO)=========.${JSON.stringify(-1===skipParts.indexOf(e_skipPart.RECORD_INFO_MISC) && -1===skipParts.indexOf(e_skipPart.RECORD_INFO))}`)
            console.log(`==========================================================================`)
            console.log(`======================     CU: misc test start   =========================`)
            console.log(`==========================================================================`)
            // console.log(`parameter is create/update===>${JSON.stringify(parameter)}`)
            let testDataMisc = generateTestData_API.generateMiscTestDataForRecordInfo(parameter)
            await RECORD_INFO_TEST_async({parameter:parameter, generatedTestData:testDataMisc, expectedErrorRc:validateFormatError.recordInfoFiledRuleNotDefine.rc, rcLevel:RC_LEVEL.COMMON})
            console.log(`==========================================================================`)
            console.log(`========================   CU:  misc test end   ===========================`)
            console.log(`==========================================================================`)
        }
        // })
        // console.log(`3rd reqBodyValues=========>${JSON.stringify(reqBodyValues)}`)
        for(let singleFieldName in collRule){
            // console.log(`singleFieldName=======>${JSON.stringify(singleFieldName)}`)
            //参数检测，expectd和skip不能共存
            if((undefined!==expectedFieldName && expectedFieldName.length>0) && (undefined!==skipFieldName && skipFieldName.length>0)){
                return Promise.reject({rc:99998,msg:`expected field and skip filed cant coexist`})
            }
            if((undefined!==expectedRuleToBeCheck && expectedRuleToBeCheck.length>0) && (undefined!==skipRuleToBeCheck && skipRuleToBeCheck.length>0)){
                return Promise.reject({rc:99998,msg:`expected rule and skip rule cant coexist`})
            }

            //不是期望的field，直接继续
            if(undefined!==expectedFieldName && expectedFieldName.length>0){
                if(-1===expectedFieldName.indexOf(singleFieldName)){
                    continue
                }
            }

            //是要skip的field，直接继续
            if(undefined!==skipFieldName && skipFieldName.length>0){
                if(-1!==skipFieldName.indexOf(singleFieldName)){
                    continue
                }
            }
            //field级别，只检查数据类型
            // it(`${[singleFieldName]}: ${`undefined`} `, async function(){
                console.log(`==========================================================================`)
                console.log(`======= CU: ${[singleFieldName]}=>${`undefined`} dataType test start   ===`)
                console.log(`==========================================================================`)
/*                parameter.fieldName=singleFieldName
                parameter.singleRuleName='undefined'*/
// console.log( `4th reqBodyValues========${JSON.stringify(reqBodyValues)}`)
                let testDataForDataTypeCheck=generateTestData_API.generateTestDataForRecordInfoDataType({parameter:parameter,fieldName:singleFieldName})
                // console.log(`testDataForDataTypeCheck===========>${JSON.stringify(testDataForDataTypeCheck)}`)
                // console.log(`reqBodyValues===========>${JSON.stringify(reqBodyValues)}`)
                await RECORD_INFO_TEST_async({parameter:parameter,fieldName:singleFieldName,generatedTestData:testDataForDataTypeCheck,expectedErrorRc:validateValueError.CUDTypeWrong.rc,rcLevel:RC_LEVEL.FIELD})
                console.log(`==========================================================================`)
                console.log(`======= CU: ${[singleFieldName]}=>${`undefined`} dataType test end    ====`)
                console.log(`==========================================================================`)
            // });

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
                //skiprule不为空，且当前rule是要skip的rule，直接继续
                if(undefined!==skipRuleToBeCheck && skipRuleToBeCheck.length>0){
                    if(-1!==skipRuleToBeCheck.indexOf(singleRuleName)){
                        continue
                    }
                }

                if(-1!==allValidRuleName.indexOf(singleRuleName)){

                    // it(`${[singleFieldName]}: ${singleRuleName} `, async function(){
                        console.log(`==========================================================================`)
                        console.log(`===== CU: ${[singleFieldName]}=>${singleRuleName} rule test start   =========`)
                        console.log(`==========================================================================`)
/*                        parameter.fieldName=singleFieldName
                        parameter.singleRuleName=singleRuleName*/
                        // parameter.collRule=collRule
                        // parameter.singleRuleDefine=collRule[singleFieldName][singleRuleName]
                        // parameter.fieldDataType=collRule[singleFieldName]['type']
                        //field中每个rule级别
                        generatedTestData=generateTestData_API.generateTestDataForRecordInfoValue({parameter:parameter,fieldName:singleFieldName,ruleName:singleRuleName})
                        await RECORD_INFO_TEST_async({parameter:parameter,fieldName:singleFieldName,generatedTestData:generatedTestData,expectedErrorRc:collRule[singleFieldName][singleRuleName]['error']['rc'],rcLevel:RC_LEVEL.FIELD})
                        console.log(`==========================================================================`)
                        console.log(`====CU: ${[singleFieldName]}=>${singleRuleName} rule test end     =========`)
                        console.log(`==========================================================================`)
                    // });

                }
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
async function RECORD_INFO_TEST_async({parameter,fieldName,generatedTestData,expectedErrorRc,rcLevel=RC_LEVEL.FIELD}){
    let {sess,sessErrorRc,APIUrl,penalizeRelatedInfo,reqBodyValues,collName,skipParts,app}=parameter
    let method=reqBodyValues[e_part.METHOD]
    let normalRecordInfo=reqBodyValues[e_part.RECORD_INFO]

    let data={values:{}}
    data.values=misc.objectDeepCopy(reqBodyValues)

    data.values[e_part.METHOD] = method

    // if(method===e_method.CREATE || method===e_method.UPDATE){
        //如果是update，还需要额外的redordId字段，以便通过preCheck中expectedParts的测试，所以实际Id是什么无所谓
    //USER的recordId从session中获得，无需从client传入
    if(method===e_method.UPDATE && collName!==e_coll.USER){
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
    // }    
}

async function RECORD_ID_TEST_async({parameter,generatedTestData,expectedErrorRc}){
    let {sess,sessErrorRc,APIUrl,penalizeRelatedInfo,reqBodyValues,collName,skipParts,app}=parameter
    let data={values:{}}
    data.values=misc.objectDeepCopy(reqBodyValues)
    let method=reqBodyValues[e_part.METHOD]
    let normalRecordInfo=reqBodyValues[e_part.RECORD_INFO]
// console.log(`reqBodyValues===========>${JSON.stringify(reqBodyValues)}`)
    data.values[e_part.METHOD] = method

    // if(method===e_method.CREATE || method===e_method.UPDATE){
    //如果是update，还需要额外的redordId字段，以便通过preCheck中expectedParts的测试，所以实际Id是什么无所谓
    if(generatedTestData.length>0){
        for(let singleRecordInfo of generatedTestData){
            data.values[e_part.RECORD_ID] =singleRecordInfo
            await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        }
    }
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
                console.log(   `parsedRes.msg============>${JSON.stringify(parsedRes.msg)}`)
                console.log(   `fieldName============>${JSON.stringify(fieldName)}`)
                assert.deepStrictEqual(parsedRes.msg[fieldName].rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

async function sendDataToAPI_compareCommonRc_async({APIUrl,sess,data,expectedErrorRc,app}){
    return new Promise(function(resolve,reject){
// ap.print(`sess`,sess)
        request(app).post(APIUrl).set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res is ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`sess=======>${JSON.stringify(sess)}`)
                console.log(`data.values of common===========>${JSON.stringify(data.values)}`)
                console.log(`parsedRes of common  ===========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc, 99999)
                assert.deepStrictEqual(parsedRes.rc, expectedErrorRc)
                return resolve(true)
            });
    })
}

//测试preCHeck中，非rule相关的部分
async function dispatch_partCheck_async(parameter){
    // let {sess,sessErrorRc,APIUrl,normalRecordInfo,method,fieldName,singleRuleName,collRule,app}=parameter
    let {sess,sessErrorRc,APIUrl,penalizeRelatedInfo,reqBodyValues,collName,skipParts,app}=parameter
    console.log(`parameter=============>${JSON.stringify(parameter)}`)
    console.log(`reqBodyValues=============>${JSON.stringify(reqBodyValues)}`)
    let method=reqBodyValues[e_part.METHOD]
    let normalRecordInfo=reqBodyValues[e_part.RECORD_INFO]
    let recordId=reqBodyValues[e_part.RECORD_ID]

    let expectedErrorRc,copyOfExpectedParts
    let  data={values:{}}
    //根据method，设定除了method之外的其他part
    let expectedParts
    switch (method){
        case e_method.CREATE:
            //对于article来说，CREATE的时候，无需任何part（直接在内部生成field）
            if(collName===e_coll.ARTICLE){
                expectedParts=[]
            }else{
                expectedParts=[e_part.RECORD_INFO]
            }
            break;
        case e_method.UPDATE:
            //USER进行更新的时候，无需recordId，而是直接从sess中获得id
            //上传文件无需RECORD_INFO
            if(collName===e_coll.USER){
                expectedParts=[e_part.RECORD_INFO]
            }else if(APIUrl==='/article/articleImage' || APIUrl==='/article/articleAttachment'){
                expectedParts=[e_part.RECORD_ID]
            }
            else{
                expectedParts=[e_part.RECORD_INFO,e_part.RECORD_ID]
            }

            break;
        case e_method.DELETE:
            //删除penalize的时候，除了提供recordId，还需要recordInfo提供REASON
            if(collName===e_coll.ADMIN_PENALIZE){
                expectedParts=[e_part.RECORD_ID,e_part.RECORD_INFO]
            }else{
                expectedParts=[e_part.RECORD_ID]
            }

            break;
        case e_method.MATCH:
            expectedParts=[e_part.RECORD_INFO]
            break;
    }
    console.log(`expectedParts=============>${JSON.stringify(expectedParts)}`)
    //1. 没有method
    console.log(`==========================================================================`)
    console.log(`====                   1st start: No method                      =========`)
    console.log(`==========================================================================`)
    expectedErrorRc=helperError.methodPartMustExistInDispatcher.rc
    await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,data:data,expectedErrorRc:expectedErrorRc,app:app})
    //2. method必须是字符
    console.log(`==========================================================================`)
    console.log(`====                  2nd start: method must be string           =========`)
    console.log(`==========================================================================`)
    data.values[e_part.METHOD]=1
    expectedErrorRc=validateFormatError.inputValuePartMethodValueFormatWrong.rc
    await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,data:data,expectedErrorRc:expectedErrorRc,app:app})
    //3  method必须是预定义的值
    console.log(`==========================================================================`)
    console.log(`====           3rd start: method value not preDefined            =========`)
    console.log(`==========================================================================`)
    data.values[e_part.METHOD]='999'
    expectedErrorRc=validateValueError.methodValueUndefined.rc
    await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,data:data,expectedErrorRc:expectedErrorRc,app:app})
    //4. 如果需要检测sess
    console.log(`==========================================================================`)
    console.log(`====                          4th start: sess check              =========`)
    console.log(`==========================================================================`)
    console.log(`data============》${JSON.stringify(data)}`)
    if(undefined!==sess){
        data.values[e_part.METHOD]=method
        //故意设置sess为undefined
        await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,data:data,expectedErrorRc:sessErrorRc,app:app})
    }

    console.log(`==========================================================================`)
    console.log(`====                           5th start: miss part              =========`)
    console.log(`==========================================================================`)
    //5. 缺乏method对应的part
    console.log(`expectedParts=============>${JSON.stringify(expectedParts)}`)
    copyOfExpectedParts=misc.objectDeepCopy(expectedParts)
    //有expectedPart，才检测（miss part）的操作
    if(copyOfExpectedParts.length>0){
        //impeach的create中，recordInfo在内部自动产生，所以无法通过client传入一个无recordInfo的data来测试
        // console.log(`collName============》${JSON.stringify(collName)}`)
        // console.log(`method============》${JSON.stringify(method)}`)
        // if(collName===e_coll.IMPEACH && method===e_method.CREATE){
        //
        // }else{
            copyOfExpectedParts.shift() //删除第一个expectedPart
            data.values={}
            data.values[e_part.METHOD]=method
            copyOfExpectedParts.forEach(function(singlePartName){
                data.values[singlePartName]=1
            })
            expectedErrorRc=validateFormatError.inputValuePartNumNotExpected.rc
            // console.log(`data===========>${JSON.stringify(data)}`)
            await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // }

    }
    console.log(`==========================================================================`)
    console.log(`====                      6th start: unexpected part              =========`)
    console.log(`==========================================================================`)
    //6. 非期望的part
    copyOfExpectedParts=misc.objectDeepCopy(expectedParts)
    //遍历expectedParts，替换第一个不是Method的part
    if(copyOfExpectedParts.length>0){
        for(let singlePartName of copyOfExpectedParts){
            if(singlePartName!==e_part.METHOD){
                console.log(`e_part===========>${JSON.stringify(e_part)}`)
                for(let enumPartName in e_part){
                    if(e_part[enumPartName]!==singlePartName){
                        data.values[e_part[enumPartName]]=1
                        break;
                    }
                }
            }
        }

        // console.log(`data===========>${JSON.stringify(data)}`)
        expectedErrorRc=validateFormatError.inputValuePartNotMatch.rc
        await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // }

    }
    console.log(`==========================================================================`)
    console.log(`====                           7th start: additional part        =========`)
    console.log(`==========================================================================`)
    //7. 有多余的part
    copyOfExpectedParts=misc.objectDeepCopy(expectedParts)
    let additionalPartName
    // console.log(`Object.values[e_part]========>${JSON.stringify(Object.values[e_part])}`)
    //const的对象，不能采用of直接取到值
    for(let singlePart in e_part){
        // console.log(`singlePart=======>${JSON.stringify(singlePart)}`)
        let singlePartValue=e_part[singlePart]
        //可用的part中，如果不是method，且不在expectedPart中，则添加，以便测试additional part
        if(singlePartValue!==e_part.METHOD && -1===copyOfExpectedParts.indexOf(singlePartValue)){
            // console.log(`singlePartValue=======>${JSON.stringify(singlePartValue)}`)
            copyOfExpectedParts.push(singlePartValue)
            additionalPartName=singlePartValue
            break
        }
    }
    data.values={}
    data.values[e_part.METHOD]=method
    copyOfExpectedParts.forEach(function(singlePartName){
        data.values[singlePartName]=1
    })
    expectedErrorRc=validateFormatError.inputValuePartNumNotExpected.rc
    await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    //清除添加的额外part，以便后续的case使用
    delete data.values[additionalPartName]

    console.log(`==========================================================================`)
    console.log(`====                        8th start: penalize check            =========`)
    console.log(`==========================================================================`)
    //8. 如果需要检测penalize
    if(undefined!==penalizeRelatedInfo){
        //首先清空所有penalize
        await db_operation_helper.deleteCollRecords_async({arr_dbModel:[e_dbModel.admin_penalize]})
        //且method和penalizeSubType一致（例如，设置了对）
        // if(penalizeRelatedInfo[`penalizeSubType`]=e_penalizeSubType.ALL ||)
        //根据penalizeCheck为当前用户创建penalize
        let penalizeInfo={
            [e_field.ADMIN_PENALIZE.REASON]:'test for test test test',
            [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:penalizeRelatedInfo[`penalizeType`],
            [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:penalizeRelatedInfo[`penalizeSubType`],
            [e_field.ADMIN_PENALIZE.DURATION]:1,
        }
        await API_helper.createPenalize_returnPenalizeId_async({adminUserSess:penalizeRelatedInfo[`rootSess`],penalizeInfo:penalizeInfo,penalizedUserData:penalizeRelatedInfo[`penalizedUserData`],adminApp:penalizeRelatedInfo[`adminApp`]})
        // console.log(`data========>${JSON.stringify()}`)

        if(undefined!==normalRecordInfo){
            data.values[e_part.RECORD_INFO]=normalRecordInfo
        }
        if(undefined!==recordId){
            data.values[e_part.RECORD_ID]=recordId
        }
        // ap.print(`data`,data)
        await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:penalizeRelatedInfo[`penalizedError`][`rc`],app:app})
        await API_helper.deletePenalize_async({adminUserSess:penalizeRelatedInfo[`rootSess`],penalizeInfo:penalizeInfo,penalizedUserData:penalizeRelatedInfo[`penalizedUserData`],adminApp:penalizeRelatedInfo[`adminApp`]})
    }

    console.log(`==========================================================================`)
    console.log(`====                           9th start                         =========`)
    console.log(`==========================================================================`)
    //对expectedPart中，非recordInfo的部分进行测试
    for(let singleExpectedPart of expectedParts){
        switch (singleExpectedPart){
            case e_part.RECORD_ID:
                data.values=reqBodyValues
                // data.values[e_part.METHOD]=method
                //delete penalize的时候，recordInfo只能包含REASON一个field
                if(method===e_method.DELETE && collName===e_coll.ADMIN_PENALIZE){
                    data.values[e_part.RECORD_INFO]={
                        [e_field.ADMIN_PENALIZE.REVOKE_REASON]:'revoke reason is not defined'
                    }
                }


                data.values[e_part.RECORD_ID]=1
                await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:validateFormatError.inputValuePartRecordIdValueFormatWrong.rc,app:app})

                data.values[e_part.RECORD_ID]=[]
                await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:validateFormatError.inputValuePartRecordIdValueFormatWrong.rc,app:app})

                data.values[e_part.RECORD_ID]={}
                await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:validateFormatError.inputValuePartRecordIdValueFormatWrong.rc,app:app})

                data.values[e_part.RECORD_ID]=`{}`
                await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:validateFormatError.inputValuePartRecordIdValueFormatWrong.rc,app:app})

                //上传文件除了record_id，还需要传入文件的信息，太麻烦，不测
                if(APIUrl!=='/article/articleImage' && APIUrl!=='/article/articleAttachment'){
                    data.values[e_part.RECORD_ID]=recordId//`59efe22ad5571f2ee8f72f67`
                    // console.log(`sess=======>${JSON.stringify(sess)}`)
                    await  sendDataToAPI_compareCommonRc_async({APIUrl:APIUrl,sess:sess,data:data,expectedErrorRc:0,app:app})
                    break;
                }


        }
    }
}
module.exports={
    // RECORD_INFO_TEST_async,
    // ruleFormatTest_async,
    // ruleEnumTest_async,
    ruleCheckAll_async,

    dispatch_partCheck_async,
}