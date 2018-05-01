/**
 * Created by wzhan039 on 2017-07-13.
 * 读取constant/enum/inputRule下所有rule定义，放入一个文件
 */
"use strict";
const fs=require('fs'),path=require('path')
const ap=require('awesomeprint')
const regex=require('../../constant/regex/regex').regex
const file=require('../../function/assist/file')
const e_ruleFieldName=require('../../constant/enum/inputDataRuleType').RuleFiledName

const RuleType={
    BROWSER:0,
    INTERNAL:1,
    BOTH:2
}

/*      递归读取目录下的coll定义文件名称，根据coll name来require对应的inpuRule文件
*
* @inputRuleBaseDir：rule文件所在的总目录。 获得目录下所有rule文件
* @ruleType： 枚举。 对internal/browse/all进行操作
* @skipFilesArray：对structure目录下，哪些文件需要排除
* */
function combineRuleIntoOneFile({inputRuleBaseDir,ruleType,skipFilesArray,resultAbsPath}){
    let content=readRuleFileContent({inputRuleBaseDir:inputRuleBaseDir,ruleType:ruleType,skipFilesArray:skipFilesArray})
    writeResult({content:content,resultPath:resultAbsPath,ruleType:ruleType})
}

function getFileName(filePath){
    let fileName=path.basename(filePath)
    return fileName.split('.')[0]
}

function  readRuleFileContent({inputRuleBaseDir,ruleType,skipFilesArray}){
    let inputRuleFolder=['browserInput/','internalInput/']
    //根据ruleType，读取对应rule目录下所有文件
    let ruleFileAbsPath=[]
    if(RuleType.BROWSER===ruleType || RuleType.BOTH===ruleType){
        file.recursiveReadFileAbsPath({fileOrDirPath:inputRuleBaseDir+inputRuleFolder[0],absFilesPathResult:ruleFileAbsPath,skipFilesArray:skipFilesArray})
    }
    if(RuleType.INTERNAL===ruleType || RuleType.BOTH===ruleType){
        file.recursiveReadFileAbsPath({fileOrDirPath:inputRuleBaseDir+inputRuleFolder[1],absFilesPathResult:ruleFileAbsPath,skipFilesArray:skipFilesArray})
    }
// ap.inf('ruleFileAbsPath',ruleFileAbsPath)
    //读取rule文件的内容后，存入一个object中，以后后续处理（写入文件）
    let readResult={}
    if(ruleFileAbsPath.length>0){
        for(let singleRuleFileAbsPath of ruleFileAbsPath){
            let collName=getFileName(singleRuleFileAbsPath)
            // ap.inf('collName',collName)
            // ap.inf('require(singleRuleFileAbsPath)[collName]',require(singleRuleFileAbsPath)[collName])
            if(undefined===readResult[collName]){
                readResult[collName]=require(singleRuleFileAbsPath)[collName]
            }else{
                Object.assign(readResult[collName],require(singleRuleFileAbsPath)[collName])
            }
        }
    }
    return readResult
}



function writeResult({content,resultPath,ruleType}){
    let description=`/*    gene by ${__filename}  at ${new Date().toLocaleDateString()}   */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    let exportStr=``

    switch (ruleType){
        case RuleType.BOTH:
            convertedEnum='const inputRule={\r\n'
            exportStr+='module.exports={\r\n'
            exportStr+=`${indent}inputRule,\r\n`
            exportStr+=`}\r\n`
            break;
        case RuleType.INTERNAL:
            convertedEnum='const internalInputRule={\r\n'
            exportStr+='module.exports={\r\n'
            exportStr+=`${indent}internalInputRule,\r\n`
            exportStr+=`}\r\n`
            break;
        case RuleType.BROWSER:
            convertedEnum='const browserInputRule={\r\n'
            exportStr+='module.exports={\r\n'
            exportStr+=`${indent}browserInputRule,\r\n`
            exportStr+=`}\r\n`
            break;
    }

    // convertedEnum+=`${description}${indent}${useStrict}\r\nconst ${exportObjectName}=`
    for(let collName in content){
        convertedEnum+=`${indent}${collName}:{\r\n`
        for(let fieldName in content[collName]){
            convertedEnum+=`${indent}${indent}${fieldName}:{\r\n`
            for(let ruleName in content[collName][fieldName]){
                let ruleContent=``
                if(ruleName===e_ruleFieldName.FORMAT){
                    content[collName][fieldName][ruleName]['define']=content[collName][fieldName][ruleName]['define'].toString()//.replace(regex.removeDoubleSlash,'\\')
                    // if(fieldName==='photoDataUrl'){
                    //     ap.inf('before',content[collName][fieldName][ruleName])
                    // }
                    //去除双引号，双斜杠变单斜杠，以便恢复成正则
                    ruleContent=JSON.stringify(content[collName][fieldName][ruleName]).replace(regex.removeDoubleQuoteForRegExp, '$1/$3/,"').replace(regex.removeDoubleSlash,'/').replace(regex.removeEscapedSlash,'\\')
                    // if(fieldName==='photoDataUrl'){
                    //     ap.inf('after',ruleContent)
                    // }
                }else{
                    ruleContent=JSON.stringify(content[collName][fieldName][ruleName])

                }
                convertedEnum+=`${indent}${indent}${indent}${ruleName}:${ruleContent},\r\n`
            }
            convertedEnum+=`${indent}${indent}},\r\n`
        }
        convertedEnum+=`${indent}},\r\n`
    }
    convertedEnum+="}\r\n"
    let finalResult=`${description}${useStrict}${convertedEnum}${exportStr}`
    // ap.inf('resultpath',resultPath)
    fs.writeFileSync(resultPath,finalResult)
}




module.exports={
    combineRuleIntoOneFile,
    RuleType,
}

//ap.inf(combineRuleIntoOneFile({inputRuleBaseDir:'D:/ss_vue_express/server_common/constant/inputRule/',ruleType:RuleType.BOTH,resultAbsPath:'D:/ss_vue_express/inputRule.js'}))