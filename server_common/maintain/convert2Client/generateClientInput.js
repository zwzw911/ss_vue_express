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

const maintainMisc=require('../function/misc')

const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')

const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}
let indent=`    `

function convertRule(){

}




/*  根据server段browser的rule定义，获得对应的client的初始化inputValue
* @originRulePath：需要转换的rule的路径（文件或者目录）
* @absResultPath: 绝对 文件 路径
* */
function generateClientInputValue({originRulePath,absResultPath}){
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    maintainMisc.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,maintainMisc.readFileExportItem({absFilePath:singleAbsFilePath}))

    }


    let allCollResult={'inputValueForCreate':{},'inputValueForUpdate':{}}
    for(let collName in fileExport){
        //对每个coll的rule定义，转换成iview的rule格式（但是require尚未处理）
        let result=generateInitInputValue({collName:collName,collRuleDefinition:fileExport[collName]})

        allCollResult['inputValueForCreate'][collName]=result['inputValueForCreate']
        allCollResult['inputValueForUpdate'][collName]=result['inputValueForUpdate']

        writeClientInitInputValueResult({content:allCollResult,resultPath:absResultPath})
    }


}

/*  根据coll的rule定义，产生coll对应的初始化的inputValue（iview只能使用{fieldName:value}的格式，因此其他属性需要另外一个函数产生）
* 
* */
function generateInitInputValue({collName,collRuleDefinition}){
    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    // relativePath='src/constant/initInputValue/'
    let inputValueForCreate={},inputValueForUpdate={}

    // for(let coll in ruleForCreate){
    //     inputValueForCreate[coll]={}
        for(let field in collRuleDefinition){

            // inputValueForCreate[field]['label']=browserInputRule[coll][field][otherRuleFiledName.CHINESE_NAME]
            // ap.inf('field',field)
            // ap.inf('collRuleDefinition[field][ruleFiledName.REQUIRE]',collRuleDefinition[field][ruleFiledName.REQUIRE])
            if(undefined!==collRuleDefinition[field][ruleFiledName.REQUIRE]['define'][e_applyRange.CREATE]){
                inputValueForCreate[field]=null //设成null，而不是undefined，否则字段会不存在
            }

            if(undefined!==collRuleDefinition[field][ruleFiledName.REQUIRE]['define'][e_applyRange.UPDATE_SCALAR] || undefined!==collRuleDefinition[field][ruleFiledName.REQUIRE]['define'][e_applyRange.UPDATE_ARRAY]){
                inputValueForUpdate[field]=null //设成null，而不是undefined，否则字段会不存在
            }

        }

        return {inputValueForCreate:inputValueForCreate,inputValueForUpdate:inputValueForUpdate}

}
//将rule结果写入指定路径的文件下
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientInitInputValueResult({content,resultPath}){
    // ap.inf('content',content)
    // let relativePath='src/constant/rule/'
    let head=`"use strict"\r\n\r\n`

    let inputValueForCreate=`const inputValueForCreate=\r\n`
    let inputValueForUpdate=`const inputValueForUpdate=\r\n`
    let exportStr=`export {inputValueForCreate,inputValueForUpdate}` //client段采用es6的export写法
    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分

    let initValueForCreate=content['inputValueForCreate']
    let initValueForUpdate=content['inputValueForUpdate']
// ap.inf('ruleForCreate',ruleForCreate)
//     let contentFormatSanityForCreate=maintainMisc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'])})

    // ap.inf('contentFormatSanityForCreate',contentFormatSanityForCreate)
    // let contentFormatSanityForUpdate=maintainMisc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'])})


    let finalStr=`${head}\r\n${inputValueForCreate}${JSON.stringify(initValueForCreate)}\r\n${inputValueForUpdate}${JSON.stringify(initValueForUpdate)}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
    
}



module.exports={
    generateClientInputValue, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientInputValue({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',absResultPath:'D:/ss_vue_view/src/constant/initInputValue/inputValue.js'})