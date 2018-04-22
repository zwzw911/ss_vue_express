/**
 * Created by zhangwei on 2018/1/9.
 * 读取globalConfiguration, 转换成client
 */
'use strict'

const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex


// const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')


// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}


/*  读取rule文件内容并调用checkRule函数对rule检查
* @absFilePath：rule文件绝对路径
* @skipFilesArray：需要skip的rule文件
* */
function readGlobalConfiguration({absFilePath,skipFilesArray}){
    let tmpResult={}
    // ap.inf('absFilePath',absFilePath)
    if(undefined===skipFilesArray || -1===skipFilesArray.indexOf(path.basename(absFilePath))){
        // 读取rule文件中export的内容
        let pattern=regex.moduleExportsNew
        // ap.print('tmpFileDir',tmpFileDir)
        let fileContent=fs.readFileSync(`${absFilePath}`,'utf8')
        //去掉 注释（首先去掉，因为需要\r\n界定结束位置）/回车换行/空白/，然后正则出module.exports中的内容
        fileContent=fileContent.replace(/\/\/.*\r\n/g,'').replace(/\r\n/g,'').replace(/\s+/g,'')
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
            if(''!==singleExportsItem ){ //&& 'uploadFileDefine'===singleExportsItem
                // ap.print('tmpFileDir',tmpFileDir)
                // ap.print('singleExportsItem',singleExportsItem)
                let ruleDefineContent=require(`${absFilePath}`)[singleExportsItem]
                ap.inf(`start convert coll==>${singleExportsItem}`)
                // ap.inf('tmpResult',tmpResult)
                // ap.inf('singleExportsItem',singleExportsItem)
                tmpResult[singleExportsItem]=ruleDefineContent
                // ap.inf('tmpResult',tmpResult)

                ap.inf(`end convert coll==>${singleExportsItem}`)
                // ap.print('ruleDefineContent',ruleDefineContent)
            }
        }
    }

    return tmpResult
    // }
}



//将结果写入指定路径的文件下
function writeResult({content,resultPath}){
    // ap.inf('content',content)
    let description=`/*    gene by ${__filename}  \r\n`
    description+=`* 一些设置信息，和服务器端的设置保持一致 \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`


    let exportStr=`export {\r\n`  //client段采用es6的export写法
    let contentStr=''
    for(let singleItem in content){
        // ap.inf('singleItem',singleItem)
        contentStr+=`const ${singleItem}={\r\n`
        for(let singleField in content[singleItem]){
            contentStr+=`   ${singleField}:${JSON.stringify(content[singleItem][singleField])},\r\n`
        }
        contentStr+=`}\r\n`
        exportStr+='    '
        exportStr+=singleItem
        exportStr+=`,\r\n`
    }
    exportStr+=`}`

    // ap.inf('contentForCreate',contentForCreate)
    let finalStr=`${description}${head}\r\n${contentStr}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
}

function convertGlobalConfiguration({absFilePath,skipFilesArray,resultPath}){
    let content=readGlobalConfiguration({absFilePath:absFilePath,skipFilesArray:skipFilesArray})
    writeResult({content:content,resultPath:resultPath})
}

module.exports={
    convertGlobalConfiguration, //对一个目录或者一个文件，读取内容并进行rule check
    // convertRuleFile, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



convertGlobalConfiguration({absFilePath:'D:/ss_vue_express/server_common/constant/config/globalConfiguration.js',resultPath:'D:/ss_vue_view/src/constant/globalConfiguration/globalConfiguration.js'})

