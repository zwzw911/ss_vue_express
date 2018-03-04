/**
 * Created by zhangwei on 2018/1/9.
 * 生成数据结构，用来存储inputValue的一些临时数据
 
 */
'use strict'

const ap=require(`awesomeprint`)
const e_field=require('../../constant/genEnum/DB_field').Field

const fs=require('fs'),path=require('path')
// const regex=require('../../constant/regex/regex').regex
const misc=require('../../function/assist/misc')

const e_inputTempDataFieldName=require('../../constant/clientEnum/clientNonValueEnum').InputTempDataFieldName




/*  根据server段browser的rule定义，获得对应的client的初始化inputValue
* @originRulePath：需要转换的rule的路径（文件或者目录）
* @absResultPath: 绝对 文件 路径
* */
function generateClientInputTempResult({originRulePath,absResultPath}){
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    misc.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,misc.readFileExportItem({absFilePath:singleAbsFilePath}))
    }


    // let allCollResult={'inputValueForCreate':{},'inputValueForUpdate':{}}
    let allCollAttribute={}
    for(let collName in fileExport){
        //对每个coll的rule定义，转换成iview的rule格式（但是require尚未处理）
        let result=generateSingleCollInputTempData({collName:collName,collRuleDefinition:fileExport[collName],absFilesPath:absFilesPath})
        allCollAttribute[collName]=result


        writeClientInitInputValueResult({content:allCollAttribute,resultPath:absResultPath})
    }


}

/*  根据coll的rule定义，产生对应的属性（label，type）
* 
* */
function generateSingleCollInputTempData({collName,collRuleDefinition,absFilesPath}){
    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    // relativePath='src/constant/initInputValue/'
    let collInputTempDta={}

    // for(let coll in ruleForCreate){
    //     inputValueForCreate[coll]={}
        for(let field in collRuleDefinition){

            collInputTempDta[field]={}
            collInputTempDta[field][e_inputTempDataFieldName.VALID_RESULT]=null //null说明为验证过

        }

        return collInputTempDta

}
//将rule结果写入指定路径的文件下
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientInitInputValueResult({content,resultPath}){
    // ap.inf('content',content)
    // let relativePath='src/constant/rule/'
    let head=`"use strict"\r\n\r\n`

    let inputAttribute=`const inputTempData=\r\n`
    // let inputValueForUpdate=`const inputValueForUpdate=\r\n`
    let exportStr=`export {inputTempData}` //client段采用es6的export写法
    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分

// ap.inf('ruleForCreate',ruleForCreate)
//     let contentFormatSanityForCreate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'])})

    // ap.inf('contentFormatSanityForCreate',contentFormatSanityForCreate)
    // let contentFormatSanityForUpdate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'])})


    let finalStr=`${head}\r\n${inputAttribute}${JSON.stringify(content)}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
    
}



module.exports={
    generateClientInputTempResult, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientInputAttribute({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',absResultPath:'D:/ss_vue_view/src/constant/initInputValue/inputAttribute.js'})
