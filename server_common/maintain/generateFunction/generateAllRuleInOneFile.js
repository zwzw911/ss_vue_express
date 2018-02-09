/**
 * Created by wzhan039 on 2017-07-13.
 * 读取constant/enum/inputRule下所有rule定义，放入一个文件
 */
"use strict";
const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex

const RuleType={
    BROWSER:0,
    INTERNAL:1,
    BOTH:2
}
function getFileName(filePath){
    let fileName=path.basename(filePath)
    return fileName.split('.')[0]
}


//
/*      递归读取目录下的coll定义文件名称，根据coll name来require对应的inpuRule文件
*
* @structure：coll文件所在的目录。 获得目录下所有coll name
* @result：对象，获得coll/field的rule
* @ruleType： 枚举。 对internal/browse/all进行操作
* @skipFilesArray：对structure目录下，哪些文件需要排除
* @inputRuleBaseDir:原始的（独立的）rule定义
* */
function  combineRuleIntoOneFile(structure,result,ruleType,skipFilesArray,inputRuleBaseDir){
    let baseDir=inputRuleBaseDir
    // console.log(`baseDir===========>${baseDir}`)
    let inputRuleFolder=['browserInput/','internalInput/']

    let isDir=fs.lstatSync(structure).isDirectory()
    if(isDir){
        let dirContent=fs.readdirSync(structure)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${structure}/${singleFileDir}`
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            if(isDir){
                combineRuleIntoOneFile(tmpFileDir,result,ruleType,skipFilesArray,inputRuleBaseDir)
            }
            //读取到coll文件名称
            if(isFile){
                if(-1===skipFilesArray.indexOf(path.basename(singleFileDir))){
                    let collFileName=singleFileDir.split('.')[0]
                    //判断文件是否在browserInput/internalInput中存在
                    let browserFilePath,internalFilePath
                    let browserRequire,internalRequire
                    browserFilePath=`${baseDir}${inputRuleFolder[0]}${structure.replace(/^.*\/model\/mongo\/structure\//g,'')}/${singleFileDir}`
                    // browserFilePath=`${baseDir}${inputRuleFolder[0]}${path.basename(singleFileDir)}`
                    // console.log(`browserFilePath==========>${browserFilePath}`)
                    internalFilePath=`${baseDir}${inputRuleFolder[1]}${structure.replace(/^.*\/model\/mongo\/structure\//g,'')}/${singleFileDir}`
                    // internalFilePath=`${baseDir}${inputRuleFolder[1]}${path.basename(singleFileDir)}`
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
                    collRule=Object.assign(collRule,browserRequire,internalRequire)
                    for(let singleFieldName in collRule){
                        // console.log(`=======>${collFileName}-${singleFieldName}`)
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



function writeResult(structurePath,resultWriteFilePath,ruleType,skipFilesArray,inputRuleBaseDir){
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
    combineRuleIntoOneFile(structurePath,result,ruleType,skipFilesArray,inputRuleBaseDir)
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
    // console.log(`${typeof internalRule['user']['password']['format']['define']}`)
    // console.log(`${internalRule['user']['password']['format']['define']}`)
    for(let coll in internalRule){
        for(let field in internalRule[coll]){
            if(true==='format' in internalRule[coll][field]){
                internalRule[coll][field]['format']['define']=eval(internalRule[coll][field]['format']['define'])
            }
        }
    }
    // console.log(`${typeof internalRule['user']['password']['format']['define']}`)
    // console.log(`${internalRule['user']['password']['format']['define']}`)
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


/*let skipFilesArray=['readme.txt','enumValue.js','admin_sugar.js','admin_user.js']
writeResult('../model/mongo/structure','../constant/inputRule/inputRule.js',RuleType.BOTH,skipFilesArray)
writeResult('../model/mongo/structure','../constant/inputRule/browserInputRule.js',RuleType.BROWSER,skipFilesArray)

writeResult('../model/mongo/structure','../constant/inputRule/internalInputRule.js',RuleType.INTERNAL,skipFilesArray)*/


// returnRegExp()
// fs.writeFileSync('./test.js',eval({a:/a/.toString()}))
module.exports={
    writeResult,
    RuleType,
}