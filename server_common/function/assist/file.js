/**
 * Created by zhang wei on 2018/4/11.
 */
'use strict'
const fs=require('fs')
const path=require('path')
const ap=require('awesomeprint')
const regex=require('../../constant/regex/regex').regex
const str=require('./string')
/*   递归 读取指定目录下文件的 绝对路径
* @fileOrDirPath：要读取的文件或者目录的绝对路径
* @skipFilesArray： 需要排除的文件名（非绝对路径）
* @skipDirArray: 需要排除的目录名（非绝对路径）
* @absFilesPathResult：保存读取到文件路径的变量，数组
* */
function  recursiveReadFileAbsPath({fileOrDirPath,skipFilesArray,skipDirArray,absFilesPathResult}){
// ap.inf('recursiveReadFileAbsPath in')
//     ap.inf('fileOrDirPath',fileOrDirPath)
    let isRulePathDir=fs.lstatSync(fileOrDirPath).isDirectory()
    let isRulePathFile=fs.lstatSync(fileOrDirPath).isFile()
    // ap.inf('isRulePathDir',isRulePathDir)
    if(true===isRulePathDir){
        let dirContent=fs.readdirSync(fileOrDirPath)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${fileOrDirPath}${singleFileDir}`
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()

            if(true===isDir){
                tmpFileDir+='/'
                // ap.inf('before no skip dir')
                if(undefined!==skipDirArray && skipDirArray.length>0 ){
                    if( -1!==skipDirArray.indexOf(path.basename(tmpFileDir))){
                        continue
                    }
                }
                // ap.inf('no skip dir')
                recursiveReadFileAbsPath({fileOrDirPath:tmpFileDir,skipFilesArray:skipFilesArray,skipDirArray:skipDirArray,absFilesPathResult:absFilesPathResult})
            }
            //读取到coll文件中module.exports中的内容（以便require）
            if(true===isFile){
                //定义了skipFilesArray，且文件在里面，继续
                // ap.inf('skipFilesArray',skipFilesArray)
                if(undefined!==skipFilesArray && skipFilesArray.length>0 ){
                    if( -1!==skipFilesArray.indexOf(path.basename(tmpFileDir))){
                        // ap.inf('skipFilesArra in',tmpFileDir)
                        continue
                    }
                }
                absFilesPathResult.push(tmpFileDir)
            }
        }
    }
    if(true===isRulePathFile){
        if(undefined!==skipFilesArray && skipFilesArray.length>0 ){
            if(-1!==skipFilesArray.indexOf(path.basename(fileOrDirPath))){
                absFilesPathResult.push(fileOrDirPath)
            }
        }else{
            //无需检测是否需要skip，所以直接push
            absFilesPathResult.push(fileOrDirPath)
        }
    }
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
    fileContent=str.deleteCommentSpaceReturn({string:fileContent})
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
        }
    }
    return exportResult
}

function recursiveRequireAllFileInDir(filesArray,absoluteDestFilePath) {
    /*    let filesArray=[]
        recursiveReadFileIntoArray(absoluteRequireDir,filesArray,skipFilesArray)*/

    let description=`/*    gene by ${__filename}     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=`${description}${useStrict}\r\n`
    let exp=`\r\nmodule.exports={\r\n`
    if(filesArray.length>0){
        for(let singleFilePath of filesArray){
            // console.log(   `singleFilePath:${singleFilePath}`)
            let baseName=path.basename(singleFilePath).split('.')[0] //不包含扩展名的文件名
            // console.log(   `baseName:${baseName}`)
            convertedEnum+=`const ${baseName}=require('${singleFilePath}')\r\n`
            exp+=`${indent}${baseName},\r\n`
        }
    }
    exp+=`}`
    let finalContent=`${convertedEnum}${exp}`
    fs.writeFileSync(absoluteDestFilePath,`${finalContent}`)

}

//删除数组中指定的文件
function deleteFiles({arr_fileAbsPath}){
    for(let singleFilePath of arr_fileAbsPath){
        fs.unlink(singleFilePath)
    }
}
module.exports={
    recursiveReadFileAbsPath,//递归读取一个目录下所有文件的路径
    readFileExportItem,
    recursiveRequireAllFileInDir,//将数组中所有文件名require到指定文件中
    deleteFiles,//
}