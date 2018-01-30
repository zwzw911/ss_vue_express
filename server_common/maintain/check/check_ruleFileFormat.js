/**
 * Created by zhangwei on 2018/1/9.
 * 读取inputRule下所有rule定义，并进行格式检查
 */
'use strict'
const inputDataRuleType=require('../../constant/enum/inputDataRuleType')
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const ruleFiledName=inputDataRuleType.RuleFiledName
const serverDataType=inputDataRuleType.ServerDataType
const serverRuleType=inputDataRuleType.ServerRuleType
const applyRange=inputDataRuleType.ApplyRange


const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex


const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')


const checkRuleError=require('../../constant/error/maintainError').checkRule


const rightResult={rc:0}
/* 读取指定目录下所有文件/指定文件，读取其中的export，require到一个文件
* @skipFilesArray:需要排除的rule文件
* @rulePath： 可以是目录或者文件。必须是绝对路径
* */
function  readDirOrFileAndCheckFormat({skipFilesArray,rulePath}){
    // let baseDir=inputRuleBaseDir
    // console.log(`baseDir===========>${baseDir}`)
    // let inputRuleFolder=['browserInput/','internalInput/']
    // let matchResult
    let tmpResult
    let isRulePathDir=fs.lstatSync(rulePath).isDirectory()
    let isRulePathFile=fs.lstatSync(rulePath).isFile()
    if(true===isRulePathDir){
        let dirContent=fs.readdirSync(rulePath)
        // ap.print('dirContent',dirContent)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${rulePath}${singleFileDir}`
            // ap.print('tmpFileDir',tmpFileDir)
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            // ap.print('isFile',isFile)
            if(true===isDir){
                tmpFileDir+='/'
                // ap.inf('${rulePath}${singleFileDir}',tmpFileDir)
                readDirOrFileAndCheckFormat({skipFilesArray:skipFilesArray,rulePath:tmpFileDir})
            }
            //读取到coll文件中module.exports中的内容（以便require）
            if(true===isFile){
                // ap.inf('tmpFileDir',tmpFileDir)
                tmpResult=readFileAndCheckFormat({absFilePath:tmpFileDir,skipFilesArray:skipFilesArray})
                if(tmpResult.rc>0){
                    ap.err('tmpResult',tmpResult)
                    return tmpResult
                }
            }
        }
    }
    if(true===isRulePathFile){
        // ap.inf('rulePath',rulePath)
        tmpResult=readFileAndCheckFormat({absFilePath:rulePath,skipFilesArray:skipFilesArray})
        if(tmpResult.rc>0){
            ap.err('tmpResult',tmpResult)
            return tmpResult
        }
    }
    return rightResult
}

/*  读取rule文件内容并调用checkRule函数对rule检查
* @absFilePath：rule文件绝对路径
* @skipFilesArray：需要skip的rule文件
* */
function readFileAndCheckFormat({absFilePath,skipFilesArray}){
    let tmpResult
    // ap.inf('absFilePath',absFilePath)
    if(undefined===skipFilesArray || -1===skipFilesArray.indexOf(path.basename(absFilePath))){
        // let collFileName=singleFileDir.split('.')[0]
        let pattern=regex.moduleExports
        // ap.print('tmpFileDir',tmpFileDir)
        let fileContent=fs.readFileSync(`${absFilePath}`,'utf8')
        // ap.print('fileContent',fileContent)
        // ap.print('absFilePath',absFilePath)
        let matchResult=fileContent.match(pattern)
        // ap.print('matchResult',matchResult)
        if(null===matchResult){
            ap.err(`not find module.exports content`)
        }
        // ap.print('matchResult[1]',matchResult[1])
        let allExportsInFile=matchResult[1].split(',')
        // ap.print('allExportsInFile',allExportsInFile)

        for(let singleExportsItem of allExportsInFile){
            if(''!==singleExportsItem){
                // ap.print('tmpFileDir',tmpFileDir)
                // ap.print('singleExportsItem',singleExportsItem)
                let ruleDefineContent=require(`${absFilePath}`)[singleExportsItem]
                ap.inf(`start check coll==>${singleExportsItem}`)

                tmpResult=checkRule({collName:singleExportsItem,ruleDefinitionOfFile:ruleDefineContent})
                if(tmpResult.rc>0){
                    return tmpResult
                }
                ap.inf(`end check coll==>${singleExportsItem}`)
                // ap.print('ruleDefineContent',ruleDefineContent)
            }
        }
    }

    return rightResult
    // }
}

/*  对传入的ruleDefinition进行检测
* @ruleDefinitionOfFile：object。一个文件的ruleDefinition。
* */
function checkRule({collName,ruleDefinitionOfFile}){
    let tmpResult

    for(let singleFieldName in ruleDefinitionOfFile){
        tmpResult=checkMandatoryFieldExists({collName:collName,fieldName:singleFieldName,fieldRuleDefinition:ruleDefinitionOfFile[singleFieldName]})
        if(tmpResult.rc>0){
            // ap.err('tmpResult',tmpResult)
            return tmpResult
        }

        tmpResult=checkMandatoryFieldFormat({collName:collName,fieldName:singleFieldName,fieldRuleDefinition:ruleDefinitionOfFile[singleFieldName]})
        // ap.err('tmpResult',tmpResult)
        if(tmpResult.rc>0){
            return tmpResult
        }

        tmpResult=checkEnumValue({collName:collName,fieldName:singleFieldName,fieldRuleDefinition:ruleDefinitionOfFile[singleFieldName]})
        if(tmpResult.rc>0){
            // ap.err('tmpResult',tmpResult)
            return tmpResult
        }

        tmpResult=checkApplyRangeMatchRequireKey({collName:collName,fieldName:singleFieldName,fieldRuleDefinition:ruleDefinitionOfFile[singleFieldName]})
        if(tmpResult.rc>0){
            // ap.err('tmpResult',tmpResult)
            return tmpResult
        }

        tmpResult=checkApplyRange({collName:collName,fieldName:singleFieldName,fieldRuleDefinition:ruleDefinitionOfFile[singleFieldName]})
        if(tmpResult.rc>0){
            // ap.err('tmpResult',tmpResult)
            return tmpResult
        }

        tmpResult=checkDataTypeRelateRule({collName:collName,fieldName:singleFieldName,fieldRuleDefinition:ruleDefinitionOfFile[singleFieldName]})
        if(tmpResult.rc>0){
            // ap.err('tmpResult',tmpResult)
            return tmpResult
        }

    }

    return rightResult
}
/*****************************************************************************/
/*****************************************************************************/
/*******************         format check            ************************/
/*****************************************************************************/
/*****************************************************************************/
/*检查单个字段中，某个rule中，必须字段是否存在。
* @collName,fieldName:用来打印信息
* @fieldRuleDefinition：object。单个字段的rule定义
* */
function checkMandatoryFieldExists({collName,fieldName,fieldRuleDefinition}){
    let mandatoryFields=[otherRuleFiledName.APPLY_RANGE,otherRuleFiledName.CHINESE_NAME,otherRuleFiledName.DATA_TYPE]
    // for(let singleRule in fieldRuleDefinition){
        // ap.print('singleField',singleField)
        for(let singleMandatoryField of mandatoryFields){
            // ap.print('singleMandatoryField',singleMandatoryField)
            if(undefined===fieldRuleDefinition[singleMandatoryField]){
                // ap.err(`coll-field-rule:${collName}-${fieldName}-${singleMandatoryField} not exist`)
                return checkRuleError.missMandatoryField({collName:collName,fieldName:fieldName,ruleField:singleMandatoryField})
            }
        }
        return rightResult
    // }
}
/*检查单个字段中，某个rule中，必须字段是的格式必须正确：APPLY_RANGE：array且不为空，CHINESE_NAME：字符且不为空，DATA_TYPE：必须是serverDataType中
 * @collName,fieldName:用来打印信息
 * @fieldRuleDefinition：object。单个字段的rule定义
 * */
function checkMandatoryFieldFormat({collName,fieldName,fieldRuleDefinition}){
    //APPLY_RANGE
    let currentRuleField=otherRuleFiledName.APPLY_RANGE
    if(false===dataTypeCheck.isArray(fieldRuleDefinition[currentRuleField])){
        return checkRuleError.applyRangeMustBeArray({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
    }
    if(0===fieldRuleDefinition[currentRuleField].length){
        return checkRuleError.applyRangeCantEmpty({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
    }

    //CHINESE_NAME
    currentRuleField=otherRuleFiledName.CHINESE_NAME
    if(0===fieldRuleDefinition[currentRuleField].trim().length){
        return checkRuleError.chineseNameCantEmpty({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
    }

    //DATA_TYPE: 如果是数组，只能有一个元素，且元素是预定义；不是数组，必须是预定义
    currentRuleField=otherRuleFiledName.DATA_TYPE
    let actualDataType
    if(true===dataTypeCheck.isArray(fieldRuleDefinition[currentRuleField])){
        if(1!==fieldRuleDefinition[currentRuleField].length){
            return checkRuleError.dataTypeFormatWrong({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
        }
        actualDataType=fieldRuleDefinition[currentRuleField][0]
    }else{
        actualDataType=fieldRuleDefinition[currentRuleField]
    }
    if(-1===Object.values(serverDataType).indexOf(actualDataType)){
        return checkRuleError.dataTypeWrong({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
    }

    return rightResult
}
/*检查单个字段中，某些rule field，必须字段是enum：APPLY_RANGE/require的key和value
 * @collName,fieldName:用来打印信息
 * @fieldRuleDefinition：object。单个字段的rule定义
 * */
function checkEnumValue({collName,fieldName,fieldRuleDefinition}){
    //APPLY_RANGE enum
    let currentRuleField=otherRuleFiledName.APPLY_RANGE
    for (let singleApplyRange of fieldRuleDefinition[currentRuleField]){
        if(-1===Object.values(applyRange).indexOf(singleApplyRange)){
            return checkRuleError.applyRangeValueInvalid({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
        }
    }

    /*currentRuleField=ruleFiledName.REQUIRE
    let requireRuleDefinition=fieldRuleDefinition[currentRuleField]['define']

    for(let singleKey in requireRuleDefinition){
        //key
        if(-1===Object.values(applyRange).indexOf(singleKey)){
            return checkRuleError.requireDefinitionKeyInvalid({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
        }
        //value
        if(-1===Object.values(requireType).indexOf(requireRuleDefinition[singleKey])){
            return checkRuleError.requireDefinitionValueInvalid({collName:collName,fieldName:fieldName,ruleField:currentRuleField})
        }
    }*/

    return rightResult
}

/*检查单个字段中，applyRange中，每个元素在require中有对应的定义
 * @collName,fieldName:用来打印信息
 * @fieldRuleDefinition：object。单个字段的rule定义
 * */
function checkApplyRangeMatchRequireKey({collName,fieldName,fieldRuleDefinition}){
    //APPLY_RANGE enum
    // let applyRange=otherRuleFiledName.APPLY_RANGE
    let applyRangeValue=fieldRuleDefinition[otherRuleFiledName.APPLY_RANGE]
    let requireRuleDefinition=fieldRuleDefinition[ruleFiledName.REQUIRE]['define']
    // ap.inf('applyRangeValue',applyRangeValue)
    // ap.inf('applyRangeValue.length',applyRangeValue.length)
    // ap.inf('requireRuleDefinition',requireRuleDefinition)
    // ap.inf('Object.keys(requireRuleDefinition)',Object.keys(requireRuleDefinition).length)
    if(applyRangeValue.length!==Object.keys(requireRuleDefinition).length){
        return checkRuleError.requireDefinitionLengthNotEqualApplyRangeValue({collName:collName,fieldName:fieldName,ruleField:undefined})
    }
    for (let singleApplyRange of applyRangeValue){
        if(undefined===requireRuleDefinition[singleApplyRange]){
            return checkRuleError.requireDefinitionNotMatchApplyRangeValue({collName:collName,fieldName:fieldName,ruleField:undefined})
        }
    }
    return rightResult
}

/*检查单个字段中，applyRange
 * @collName,fieldName:用来打印信息
 * @fieldRuleDefinition：object。单个字段的rule定义
 * */
function checkApplyRange({collName,fieldName,fieldRuleDefinition}){
    let applyRangeValue=fieldRuleDefinition[otherRuleFiledName.APPLY_RANGE]

    if(0===applyRange.length){
        return checkRuleError.applyRangeCantEmpty({collName:collName,fieldName:fieldName,ruleField:undefined})
        // applyRangeCantEmpty
    }
    //require中，UPDATE_SCALAR和UPDATE_ARRAY不能共存
    if(-1!==applyRangeValue.indexOf(applyRange.UPDATE_SCALAR) && -1!==applyRangeValue.indexOf(applyRange.UPDATE_ARRAY)){
        return checkRuleError.applyRangeCantContainMoreThan1Update({collName:collName,fieldName:fieldName,ruleField:undefined})
    }

    return rightResult
}

/* 某些特定的dataTye，需要特定的rule（例如，数组，需要max_array_length）
 * @collName,fieldName:用来打印信息
 * @fieldRuleDefinition：object。单个字段的rule定义
 * */
function checkDataTypeRelateRule({collName,fieldName,fieldRuleDefinition}){
    let dataTypeDefinition=fieldRuleDefinition[otherRuleFiledName.DATA_TYPE]
    //数据类型是数组，则需要array_max_length
    if(true===dataTypeCheck.isArray(dataTypeDefinition)){
        if(undefined===fieldRuleDefinition[ruleFiledName.ARRAY_MAX_LENGTH]){
            return checkRuleError.dataTypeArrayMissMaxlength({collName:collName,fieldName:fieldName,ruleField:undefined})
        }
    }



    return rightResult
}




module.exports={
    readDirOrFileAndCheckFormat, //对一个目录或者一个文件，读取内容并进行rule check
    // readFileAndCheckFormat, //对一个文件，读取内容并进行rule check
    checkRule, //对传入的rule（object），直接进行rule check
}


// readDirOrFileAndCheckFormat({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/internalInput/admin/admin_penalize.js'})
// tmpResult=readDirOrFileAndCheckFormat({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/friend/user_friend_group.js'})

readDirOrFileAndCheckFormat({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/'})
readDirOrFileAndCheckFormat({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/internalInput/'})

/*
if(tmpResult.rc>0){
    ap.err('tmpResult',tmpResult)
}*/
