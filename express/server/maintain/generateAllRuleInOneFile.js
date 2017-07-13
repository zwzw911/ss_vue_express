/**
 * Created by wzhan039 on 2017-07-13.
 * 读取constant/enum/inputRule下所有rule定义，放入一个文件
 */
"use strict";
const fs=require('fs'),path=require('path')

function getFileName(filePath){
    let fileName=path.basename(filePath)
    return fileName.split('.')[0]
}


//递归读取目录下的coll定义文件名称，并require js文件

function  combineRuleIntoOneFile(structure,result){
    let indent=`\ \ \ \ `
    let convertedEnum=''
    let exp=''

    let baseDir='../constant/inputRule/'
    let inputRuleFolder=['browserInput/','internalInput/']
    let skipFile=['readme.txt','enumValue.js']

    let isDir=fs.lstatSync(structure).isDirectory()
    if(isDir){
        let dirContent=fs.readdirSync(structure)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${structure}/${singleFileDir}`
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            if(isDir){
                // convertedEnum+=`/*       ${singleFileDir}           */\r\n`
                // convertedEnum+=combineRuleIntoOneFile(tmpFileDir,result).convertedEnum
                // exp+=`/*       ${singleFileDir}           */\r\n`
                // exp+=combineRuleIntoOneFile(tmpFileDir,result).exp
                combineRuleIntoOneFile(tmpFileDir,result)
            }
            //读取到coll文件名称
            if(isFile){

                if(-1===skipFile.indexOf(path.basename(singleFileDir))){
                    let collFileName=singleFileDir.split('.')[0]
                    //判断文件是否在browserInput/internalInput中存在
                    let browserFilePath,internalFilePath
                    let browserRequire,internalRequire
                    browserFilePath=`${baseDir}${inputRuleFolder[0]}${structure.replace(/\.\.\/model\/mongo\/structure\//g,'')}/${singleFileDir}`
                    internalFilePath=`${baseDir}${inputRuleFolder[1]}${structure.replace(/\.\.\/model\/mongo\/structure\//g,'')}/${singleFileDir}`
                    // console.log(`${baseDir}${inputRuleFolder[0]}${structure.replace(/\.\.\/model\/mongo\/structure\//g,'')}/${singleFileDir}`)
                    let collRule={}
                    if( fs.existsSync(browserFilePath)){
                        // console.log(`${JSON.stringify(browserFilePath)}`)
                        // console.log(`${JSON.stringify(singleFileDir)}`)
                        browserRequire=require(browserFilePath)[collFileName]
                        // collRule=Object.assign(collRule,browserRequire)
                    }
                    if(fs.existsSync(internalFilePath)){
                        internalRequire=require(internalFilePath)[collFileName]
                        // collRule=Object.assign(collRule,internalRequire)
                    }
                    collRule=Object.assign(collRule,browserRequire,internalRequire)
                    // console.log(`${JSON.stringify(collRule)}`)
                    result[collFileName.toUpperCase()]=collRule

                    /*// console.log(`file ${tmpFileDir}`)
                    let fileName=getFileName(tmpFileDir)
                    // console.log(`filename ${fileName}`)
                    let key=fileName.toUpperCase()
                    // console.log(`key ${fileName}`)
                    // convertedEnum+=`${indent}${key}:'${fileName}',\r\n`
                    convertedEnum+=`const ${fileName}=require('${tmpFileDir}').collFieldDefine\r\n`
                    exp+=`${fileName},\r\n`
                    // console.log(`${convertedEnum}`)
                    // finalResult[key]=fileName*/
                }

            }
        }
    }
    console.log(`${JSON.stringify(result)}`)
    // return {convertedEnum,exp}

    // return finalResult
}

function writeResult(structurePath,resultWriteFilePath){
    let description=`/*    gene by ${__filename}     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}\r\nconst inputRule=`
    let exp=`\r\nmodule.exports={\r\n${indent}`

    let result={}
    combineRuleIntoOneFile(structurePath,result)
    convertedEnum+=JSON.stringify(result)
    exp+=`inputRule\r\n`

    convertedEnum+=`\r\n`
    exp+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}



// let convertedEnum=''
// console.log(getFileName('H:/ss_vue_express/express/server/model/mongo/structure/admin/admin_user.js').toUpperCase())
// getFileNameInFolder('H:/ss_vue_express/express/server/model/mongo/structure/',finalResult)
// console.log(JSON.stringify(finalResult))

// writeMiddleResult('../model/mongo/structure','../constant/enum/test.js')
// generateFieldEnum()
// writeFinalResult('../model/mongo/structure','../constant/enum/DB_field.js')
// let result={}
// combineRuleIntoOneFile('../model/mongo/structure',result)
writeResult('../model/mongo/structure','../constant/inputRule/inputRule.js')
module.exports={
    getFileName
}