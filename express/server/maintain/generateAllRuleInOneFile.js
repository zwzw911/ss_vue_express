/**
 * Created by wzhan039 on 2017-07-13.
 * 读取constant/enum/inputRule下所有rule定义，放入一个文件
 */
"use strict";
const fs=require('fs'),path=require('path')
const regex=require('../constant/regex/regex').regex

const RuleType={
    BROWSER:0,
    INTERNAL:1,
    BOTH:2
}
function getFileName(filePath){
    let fileName=path.basename(filePath)
    return fileName.split('.')[0]
}


//递归读取目录下的coll定义文件名称，并require js文件

function  combineRuleIntoOneFile(structure,result,ruleType){
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
                combineRuleIntoOneFile(tmpFileDir,result,ruleType)
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
                    if(ruleType===RuleType.BOTH || ruleType===RuleType.BROWSER){
                        if( fs.existsSync(browserFilePath)){
                            // console.log(`${JSON.stringify(browserFilePath)}`)
                            // console.log(`${JSON.stringify(singleFileDir)}`)
                            browserRequire=require(browserFilePath)[collFileName]
                            // collRule=Object.assign(collRule,browserRequire)
                        }
                    }
                    if(ruleType===RuleType.BOTH || ruleType===RuleType.INTERNAL){
                        if(fs.existsSync(internalFilePath)){
                            internalRequire=require(internalFilePath)[collFileName]
                            // collRule=Object.assign(collRule,internalRequire)
                        }
                    }
                    /*if(browserRequire){
                        for(let singleFieldName in browserRequire){
                            if(true==='format'in browserRequire[singleFieldName]){
                                browserRequire[singleFieldName]['format']['define']=browserRequire[singleFieldName]['format']['define'].source
                            }
                        }
                    }
                    if(internalRequire){
                        for(let singleFieldName in internalRequire){
                            if(true==='format'in internalRequire[singleFieldName]){
                                internalRequire[singleFieldName]['format']['define']=internalRequire[singleFieldName]['format']['define'].source
                            }
                        }
                        // console.log(`================coll is ${collFileName}==================`)
                        // if(collFileName==='user'){
                            // console.log(`${JSON.stringify(internalRequire)}`)
/!*                            for(let singleFieldName in internalRequire){
                                // console.log(`${collFileName}-${singleFieldName}`)
                                if(true==='format'in internalRequire[singleFieldName]){
                                    // console.log(`${singleFieldName} has rule format ${JSON.stringify(internalRequire[singleFieldName]['format']['define'])}`)
                                    internalRequire[singleFieldName]['format']['define']=internalRequire[singleFieldName]['format']['define'].toString()
                                    // console.log(`${singleFieldName} covert is ${internalRequire[singleFieldName]['format']['define']}`)
                                }
                            }*!/
                        // }

                    }*/
                    collRule=Object.assign(collRule,browserRequire,internalRequire)
                    for(let singleFieldName in collRule){
                        // console.log(`${collFileName}-${singleFieldName}`)
                        if(true==='format'in collRule[singleFieldName]){
                            // console.log(`${singleFieldName} has rule format ${JSON.stringify(internalRequire[singleFieldName]['format']['define'])}`)
                            collRule[singleFieldName]['format']['define']=collRule[singleFieldName]['format']['define'].toString()
                            // console.log(`${singleFieldName} covert is ${internalRequire[singleFieldName]['format']['define']}`)
                        }
                    }

                    // console.log(`${JSON.stringify(collRule)}`)
                    result[collFileName]=collRule

                }

            }
        }
    }
    // console.log(`${JSON.stringify(result)}`)
    // return {convertedEnum,exp}

    // return finalResult
}



function writeResult(structurePath,resultWriteFilePath,ruleType){
    let description=`/*    gene by ${__filename}     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``

    let exportObjectName
    switch (ruleType){
        case RuleType.BOTH:
            exportObjectName='inputRule'
            break;
        case RuleType.INTERNAL:
            exportObjectName='internalInputRule'
            break;
        case RuleType.BROWSER:
            exportObjectName='browserInputRule'
            break;
    }
    convertedEnum+=`${description}${indent}${useStrict}\r\nconst ${exportObjectName}=`
    let exp=`\r\nmodule.exports={\r\n${indent}`

    let result={}
    combineRuleIntoOneFile(structurePath,result,ruleType)
    // console.log(JSON.stringify(result['user']))
    //  ?代表懒惰
    let content=JSON.stringify(result).replace(regex.removeDoubleQuotes, '$1/$3/,"').replace(regex.removeDoubleSlash,'\\')
    // "format":{"define":"/^[0-9a-f]{24}$/","error":{"rc":10092},"mongoError":{"rc":20092,"msg":"处罚人格式不正确"}
    convertedEnum+=content
    exp+=`${exportObjectName}\r\n`

    convertedEnum+=`\r\n`
    exp+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}

function returnRegExp(){

    let internalRule=require('../constant/inputRule/internalInputRule').internalInputRule
    console.log(`${typeof internalRule['user']['password']['format']['define']}`)
    console.log(`${internalRule['user']['password']['format']['define']}`)
    for(let coll in internalRule){
        for(let field in internalRule[coll]){
            if(true==='format' in internalRule[coll][field]){
                internalRule[coll][field]['format']['define']=eval(internalRule[coll][field]['format']['define'])
            }
        }
    }
    console.log(`${typeof internalRule['user']['password']['format']['define']}`)
    console.log(`${internalRule['user']['password']['format']['define']}`)
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
writeResult('../model/mongo/structure','../constant/inputRule/inputRule.js',RuleType.BOTH)
writeResult('../model/mongo/structure','../constant/inputRule/browserInputRule.js',RuleType.BROWSER)

writeResult('../model/mongo/structure','../constant/inputRule/internalInputRule.js',RuleType.INTERNAL)
// returnRegExp()
// fs.writeFileSync('./test.js',eval({a:/a/.toString()}))
module.exports={
    getFileName
}