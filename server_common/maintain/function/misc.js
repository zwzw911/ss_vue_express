/**
 * Created by ada on 2018/2/7.
 */
'use strict'
const fs=require('fs')
const ap=require('awesomeprint')

const regex=require('../../constant/regex/regex').regex
/*   递归 读取指定目录下文件的 绝对路径
* @fileOrDirPath：要读取的文件或者目录的绝对路径
* @skipFilesArray： 需要排除的文件名（非绝对路径）
* @absFilesPathResult：保存读取到文件路径的变量
* */
function  recursiveReadFileAbsPath({fileOrDirPath,skipFilesArray,absFilesPathResult}){
    // let baseDir=inputRuleBaseDir
    // console.log(`baseDir===========>${baseDir}`)
    // let inputRuleFolder=['browserInput/','internalInput/']
    // let matchResult
    // let tmpResult={}
    let isRulePathDir=fs.lstatSync(fileOrDirPath).isDirectory()
    let isRulePathFile=fs.lstatSync(fileOrDirPath).isFile()
    if(true===isRulePathDir){
        let dirContent=fs.readdirSync(fileOrDirPath)
        // ap.print('dirContent',dirContent)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${fileOrDirPath}${singleFileDir}`
            // ap.print('tmpFileDir',tmpFileDir)
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            // ap.print('isFile',isFile)
            if(true===isDir){
                tmpFileDir+='/'
                // ap.inf('${rulePath}${singleFileDir}',tmpFileDir)
                recursiveReadFileAbsPath({skipFilesArray:skipFilesArray,fileOrDirPath:tmpFileDir})
            }
            //读取到coll文件中module.exports中的内容（以便require）
            if(true===isFile){
                // ap.inf('tmpFileDir',tmpFileDir)
                // tmpResult=Object.assign(tmpResult,readRuleAndConvert({absFilePath:tmpFileDir,skipFilesArray:skipFilesArray,}))
                // if(tmpResult.rc>0){
                //     ap.err('tmpResult',tmpResult)
                //     return tmpResult
                // }
                absFilesPathResult.push(tmpFileDir)
            }
        }
    }
    if(true===isRulePathFile){
        // ap.inf('rulePath',rulePath)
        // tmpResult=readRuleAndConvert({absFilePath:rulePath,skipFilesArray:skipFilesArray,})
        // if(tmpResult.rc>0){
        //     ap.err('tmpResult',tmpResult)
        //     return tmpResult
        // }
        absFilesPathResult.push(fileOrDirPath)
    }

    // writeResult_iview({content:tmpResult,resultProjectPath:resultProjectPath})


    // return rightResult
}

/*  读取文件内容并返回export的内容
* @absFilePath：rule文件绝对路径
* @specificItem: 数组。指定文件中部分需要export的内容
* */
function readFileExportItem({absFilePath,specificItem}){
    let exportResult={}
    // ap.inf('absFilePath',absFilePath)

        // 读取文件中export的内容
        let pattern=regex.moduleExportsNew
        // ap.print('tmpFileDir',tmpFileDir)
        let fileContent=fs.readFileSync(`${absFilePath}`,'utf8')
        fileContent=deleteCommentSpaceReturn({string:fileContent})
        // ap.print('fileContent',fileContent)
        // ap.print('absFilePath',absFilePath)
        let matchResult=fileContent.match(pattern)
        // ap.print('matchResult',matchResult)
        if(null===matchResult){
            ap.err(`not find module.exports content`)
        }
        // ap.print('matchResult[1]',matchResult[1])
        let allExportsInFile=matchResult[1].split(',')
        // ap.print('specificItem',specificItem)

        for(let singleExportsItem of allExportsInFile){
            if(''!==singleExportsItem){
                // ap.print('tmpFileDir',tmpFileDir)
                // ap.print('singleExportsItem',singleExportsItem)
                // ap.inf('specificItem',specificItem)
                let ruleDefineContent
                if(undefined!==specificItem){
                    if(-1!==specificItem.indexOf(singleExportsItem)){
                        // ap.wrn('allow item',singleExportsItem)
                        ruleDefineContent=require(`${absFilePath}`)[singleExportsItem]
                        exportResult[singleExportsItem]=ruleDefineContent  //重复，防止未定义的item也被当作undefined加入到exportResult
                    }
                }else{
                    // ap.inf('singleExportsItem',singleExportsItem)
                    ruleDefineContent=require(`${absFilePath}`)[singleExportsItem]
                    exportResult[singleExportsItem]=ruleDefineContent
                }

                // ap.inf(`start convert coll==>${singleExportsItem}`)
                // ap.inf('tmpResult',tmpResult)
                // ap.inf('singleExportsItem',singleExportsItem)

                // ap.inf('tmpResult',tmpResult)

                // ap.inf(`end convert coll==>${singleExportsItem}`)
                // ap.print('ruleDefineContent',ruleDefineContent)
            }
        }


    return exportResult
    // }
}

//字符中，如果包含了正则（iview是patter），需要进行格式化（去除双引号）
function sanityClientPatternInString({string}){
    return string.replace(regex.clientRemoveDoubleQuotes, '$1/$3/,"').replace(regex.removeDoubleSlash,'\\')
}

//删除字符中注释，空白和换行
function deleteCommentSpaceReturn({string}){
    //单行注释；空白；换行符；多行注释
    return string.replace(/\/\/.*\r?\n/g,'').replace(/\s+/g,'').replace(/(\r?\n)*/g,'').replace(/(\/\*+).*?(\*+\/)/g,'')
}
module.exports={
    recursiveReadFileAbsPath,
    readFileExportItem,
    sanityClientPatternInString,
    deleteCommentSpaceReturn,
}

// let result=[]
// recursiveReadFileAbsPath({fileOrDirPath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/',absFilesPathResult:result})
//
// ap.inf('result',result)
// let result
// result=readFileExportItem({absFilePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js'})
// ap.inf('result',result)