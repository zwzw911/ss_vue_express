/**
 * Created by zhangwei on 2018/1/9.
 * 读取inputRule下所有rule定义，并进行格式检查
 */
'use strict'
const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex
const otherRuleFiledName=require('../../constant/enum/inputDataRuleType').OtherRuleFiledName
const ruleFiledName=require('../../constant/enum/inputDataRuleType').RuleFiledName

const ap=require('awesomeprint')
/* 读取指定目录下所有文件，读取其中的export，require到一个文件
*
*
* */
function  readAllInputFile({skipFilesArray,ruleRootDir}){
    // let baseDir=inputRuleBaseDir
    // console.log(`baseDir===========>${baseDir}`)
    // let inputRuleFolder=['browserInput/','internalInput/']
    let matchResult
    let isDir=fs.lstatSync(ruleRootDir).isDirectory()
    if(isDir){
        let dirContent=fs.readdirSync(ruleRootDir)
        // ap.print('dirContent',dirContent)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${ruleRootDir}/${singleFileDir}`
            // ap.print('tmpFileDir',tmpFileDir)
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            // ap.print('isFile',isFile)
            if(isDir){
                readAllInputFile({skipFilesArray:skipFilesArray,ruleRootDir:`${ruleRootDir}${singleFileDir}`})
            }
            //读取到coll文件中module.exports中的内容（以便require）
            if(isFile){
                if(undefined===skipFilesArray || -1===skipFilesArray.indexOf(path.basename(singleFileDir))){
                    let collFileName=singleFileDir.split('.')[0]
                    let pattern=regex.moduleExports
                    // ap.print('tmpFileDir',tmpFileDir)
                    let fileContent=fs.readFileSync(`${tmpFileDir}`,'utf8')
                    // ap.print('fileContent',fileContent)
                    matchResult=fileContent.match(pattern)
                    // ap.print('matchResult',matchResult)
                    if(null===matchResult){
                        ap.print(`not find module.exports content`)
                    }
                    // ap.print('matchResult[1]',matchResult[1])
                    let allExportsInFile=matchResult[1].split(',')
                    // ap.print('allExportsInFile',allExportsInFile)
                    for(let singleExportsItem of allExportsInFile){
                        if(''!==singleExportsItem){
                            // ap.print('tmpFileDir',tmpFileDir)
                            // ap.print('singleExportsItem',singleExportsItem)
                            let ruleDefineContent=require(`${tmpFileDir}`)[singleExportsItem]
                            ap.print(`start check coll==>${singleExportsItem}`)
                            checkMandatoryFieldExists({ruleDefineContent:ruleDefineContent})
                            // ap.print('ruleDefineContent',ruleDefineContent)
                        }
                    }

                }
            }
        }
    }

}
/*检查rule中必须字段是否存在
* ruleDefineContent：object。被检查的内容
* */
function checkMandatoryFieldExists({ruleDefineContent}){
    let mandatoryFields=[otherRuleFiledName.APPLY_RANGE,otherRuleFiledName.CHINESE_NAME,otherRuleFiledName.DATA_TYPE]
    for(let singleField in ruleDefineContent){
        // ap.print('singleField',singleField)
        for(let singleMandatoryField of mandatoryFields){
            // ap.print('singleMandatoryField',singleMandatoryField)
            if(undefined===ruleDefineContent[singleField][singleMandatoryField]){
                ap.print(`field:${singleField} miss mandatory item:${singleMandatoryField}`)
            }
        }
    }

}
readAllInputFile({ruleRootDir:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user'})