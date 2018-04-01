/**
 * Created by zhangwei on 2018/1/9.
 * 产生client的input相关数据（空inputValue，input对应其他属性（label，type））
 
 */
'use strict'
const inputDataRuleType=require('../../constant/enum/inputDataRuleType')
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const ruleFiledName=inputDataRuleType.RuleFiledName
const serverDataType=inputDataRuleType.ServerDataType
const serverRuleType=inputDataRuleType.ServerRuleType
const e_clientDataType=inputDataRuleType.ClientDataType
const e_clientRuleType=inputDataRuleType.ClientRuleType

const e_field=require('../../constant/genEnum/DB_field').Field
// ServerRuleMatchClientRule
// const applyRange=inputDataRuleType.ApplyRange
const e_serverRuleMatchClientRule=inputDataRuleType.ServerRuleMatchClientRule
const e_serverDataTypeMatchClientDataType=inputDataRuleType.ServerDataTypeMatchClientDataType

const e_applyRange=inputDataRuleType.ApplyRange

const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex

const misc=require('../../function/assist/misc')


const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')

const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}
let indent=`    `


/*  根据server段browser的rule定义，获得对应的client的初始化inputValue
* @originProjectPath：D:/ss_vue_express/server_common/
* @resultPath: D:/ss_vue_view/src/constant/enum/nonValueEnum.js
* */
function generateClientNonValueEnum({originProjectPath,resultPath}){
    let filesToBeRead=[
        {path:`${originProjectPath}constant/clientEnum/clientNonValueEnum.js`, exportItem:'all'},
        {path:`${originProjectPath}constant/enum/nodeEnum.js`, exportItem:['ValidatePart']},
    ]


    let fileExport={}
    for(let singleFileEle of filesToBeRead) {
        let absFilesPath=[]
        //1. 读取originRulePath下所有文件
        // ap.inf("singleFileEle", singleFileEle)
        misc.recursiveReadFileAbsPath({
            fileOrDirPath: `${singleFileEle['path']}`,
            absFilesPathResult: absFilesPath
        })
        // ap.inf('absFilesPath', absFilesPath)

        //2. 对每个文件，读取export定义
        for(let singleAbsFilePath of absFilesPath){
            let specificItem
            if(singleFileEle['exportItem']==='all'){
                // ap.inf('before fileExport for all',fileExport)
                Object.assign(fileExport,misc.readFileExportItem({absFilePath:singleAbsFilePath}))
                // ap.inf('after fileExport for all',fileExport)
            }else{
                // ap.inf('before fileExport',fileExport)
                specificItem=singleFileEle['exportItem']
                // ap.wrn('specificItem',specificItem)
                Object.assign(fileExport,misc.readFileExportItem({absFilePath:singleAbsFilePath,specificItem:specificItem }))
                // ap.inf('after fileExport',fileExport)
            }
        }

    }
    // ap.inf('final fileExport',fileExport)

    writeClientInitInputValueResult({content:fileExport,resultPath:`${resultPath}`})
}


//将rule结果写入指定路径的文件下
// content: 读取到的enum，Object
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientInitInputValueResult({content,resultPath}){

    // let relativePath='src/constant/rule/'
    let description=`/*    gene by ${__filename}  \r\n`
    description+=`* 一些常用的enum值，写代码方便，例如ValidatePart \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`
    let indent=`    `

    let contentStr=``
    let exportStr=`export {\r\n` //client段采用es6的export写法
    // ap.inf('content',content)
    for(let singleItemKey in content ){
        // ap.inf('singleItemKey',singleItemKey)
        // ap.inf('content.singleItemKey',content[singleItemKey])
        contentStr+=`const ${singleItemKey}=\r\n`
        contentStr+=JSON.stringify(content[singleItemKey])
        contentStr+=`\r\n`

        exportStr+=`${indent}${singleItemKey},\r\n`
    }
    exportStr+=`}\r\n`

// ap.inf('resultPath',resultPath)
//     ap.inf('contentStr',contentStr)
    let finalStr=`${description}${head}\r\n${contentStr}\r\n${exportStr}`
    // ap.inf('finalStr',finalStr)
    fs.writeFileSync(`${resultPath}`,finalStr)
    
}



module.exports={
    generateClientNonValueEnum, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientNonValueEnum({originProjectPath:'D:/ss_vue_express/server_common/',resultPath:'D:/ss_vue_view/src/constant/enum/nonValueEnum.js'})