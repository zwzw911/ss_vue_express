/**
 * Created by zhangwei on 2018/1/9.
 * 读取server的browserRule，转换成client的validator使用的rule
 */
'use strict'
const inputDataRuleType=require('../../constant/enum/inputDataRuleType')
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const ruleFiledName=inputDataRuleType.RuleFiledName
const serverDataType=inputDataRuleType.ServerDataType
const serverRuleType=inputDataRuleType.ServerRuleType
const e_clientDataType=inputDataRuleType.ClientDataType
const e_clientRuleType=inputDataRuleType.ClientRuleType
// const applyRange=inputDataRuleType.ApplyRange
const e_serverRuleMatchClientRule=inputDataRuleType.ServerRuleMatchClientRule
const e_serverDataTypeMatchClientDataType=inputDataRuleType.ServerDataTypeMatchClientDataType

const e_applyRange=inputDataRuleType.ApplyRange

const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex


const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')


// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}
/* 读取指定目录下所有文件/指定文件，读取其中的export，require到一个文件
* @skipFilesArray:需要排除的rule文件
* @rulePath： 可以是目录或者文件。必须是绝对路径
* */
function  readDirOrFileAndCovertRule({skipFilesArray,rulePath,resultPath}){
    // let baseDir=inputRuleBaseDir
    // console.log(`baseDir===========>${baseDir}`)
    // let inputRuleFolder=['browserInput/','internalInput/']
    // let matchResult
    let tmpResult={}
    let isRulePathDir=fs.lstatSync(rulePath).isDirectory()
    let isRulePathFile=fs.lstatSync(rulePath).isFile()
    if(true===isRulePathDir){
        let dirContent=fs.readdirSync(rulePath)
        // ap.print('dirContent',dirContent)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${rulePath}${singleFileDir}`
            // ap.print('tmpFileDir',tmpFileDir)
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            // ap.print('isFile',isFile)
            if(true===isDir){
                tmpFileDir+='/'
                // ap.inf('${rulePath}${singleFileDir}',tmpFileDir)
                readDirOrFileAndCovertRule({skipFilesArray:skipFilesArray,rulePath:tmpFileDir,resultPath:resultPath})
            }
            //读取到coll文件中module.exports中的内容（以便require）
            if(true===isFile){
                // ap.inf('tmpFileDir',tmpFileDir)
                tmpResult=Object.assign(tmpResult,convertRuleFile({absFilePath:tmpFileDir,skipFilesArray:skipFilesArray,}))
                if(tmpResult.rc>0){
                    ap.err('tmpResult',tmpResult)
                    return tmpResult
                }
            }
        }
    }
    if(true===isRulePathFile){
        // ap.inf('rulePath',rulePath)
        tmpResult=convertRuleFile({absFilePath:rulePath,skipFilesArray:skipFilesArray,})
        if(tmpResult.rc>0){
            ap.err('tmpResult',tmpResult)
            return tmpResult
        }
    }

    writeResult({content:tmpResult,resultPath:resultPath})


    return rightResult
}

/*  读取rule文件内容并调用checkRule函数对rule检查
* @absFilePath：rule文件绝对路径
* @skipFilesArray：需要skip的rule文件
* */
function convertRuleFile({absFilePath,skipFilesArray}){
    let tmpResult={}
    // ap.inf('absFilePath',absFilePath)
    if(undefined===skipFilesArray || -1===skipFilesArray.indexOf(path.basename(absFilePath))){
        // 读取rule文件中export的内容
        let pattern=regex.moduleExports
        // ap.print('tmpFileDir',tmpFileDir)
        let fileContent=fs.readFileSync(`${absFilePath}`,'utf8')
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
            if(''!==singleExportsItem){
                // ap.print('tmpFileDir',tmpFileDir)
                // ap.print('singleExportsItem',singleExportsItem)
                let ruleDefineContent=require(`${absFilePath}`)[singleExportsItem]
                ap.inf(`start convert coll==>${singleExportsItem}`)
                // ap.inf('tmpResult',tmpResult)
                // ap.inf('singleExportsItem',singleExportsItem)
                tmpResult[singleExportsItem]=convertRule({collName:singleExportsItem,ruleDefinitionOfFile:ruleDefineContent})
                // ap.inf('tmpResult',tmpResult)

                ap.inf(`end convert coll==>${singleExportsItem}`)
                // ap.print('ruleDefineContent',ruleDefineContent)
            }
        }
    }

    return tmpResult
    // }
}

/*  对传入的ruleDefinition进行检测
* @ruleDefinitionOfFile：object。一个文件的ruleDefinition。
* */
function convertRule({collName,ruleDefinitionOfFile}){
    let tmpResult={}

    for(let singleFieldName in ruleDefinitionOfFile){
        tmpResult[singleFieldName]={}

        // let clientDataType
        for(let singleRuleName in ruleDefinitionOfFile[singleFieldName]){
            // ap.inf('ruleDefinitionOfFile[singleFieldName]',ruleDefinitionOfFile[singleFieldName])
            // ap.inf('singleRuleName',singleRuleName)
            let singleRuleDefinition=ruleDefinitionOfFile[singleFieldName][singleRuleName]
            // ap.inf('singleRuleDefinition',singleRuleDefinition)
            switch (singleRuleName){
                case otherRuleFiledName.DATA_TYPE:
                    if(true===dataTypeCheck.isArray(singleRuleDefinition)){
                        tmpResult[singleFieldName]['type']=e_clientDataType.ARRAY   //{type:'array'}
                        tmpResult[singleFieldName]['defaultField']={'type':e_serverDataTypeMatchClientDataType[singleRuleDefinition[0]]}  //{'defaultField':'patttern'}
                        if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]){
                            ap.inf('ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]',eval(ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define']))
                            tmpResult[singleFieldName]['defaultField'][e_clientRuleType.PATTERN]=eval(ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define'])
                        }
                        if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]){
                            tmpResult[singleFieldName]['defaultField'][e_clientRuleType.ENUM]=ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]['define']
                        }
                    }else{
                        tmpResult[singleFieldName]['type']=e_serverDataTypeMatchClientDataType[singleRuleDefinition]
                        if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]){
                            ap.inf('ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]',eval(ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define']))
                            tmpResult[singleFieldName][e_clientRuleType.PATTERN]=eval(ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define'])
                        }
                        if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]){
                            tmpResult[singleFieldName][e_clientRuleType.ENUM]=ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]['define']
                        }
                    }
                    break;
                case ruleFiledName.REQUIRE:
                    // ap.inf('singleRuleDefinition',singleRuleDefinition)
                    tmpResult[singleFieldName][e_clientRuleType.REQUIRE]=singleRuleDefinition['define']
                    break;
            }
        }

    }

    return tmpResult
}

//将结果写入指定路径的文件下
function writeResult({content,resultPath}){
    ap.inf('content',content)
    let head=`"use strict"\r\n\r\n`

    let ruleForCreate=`const ruleForCreate=\r\n`
    let ruleForUpdate=`const ruleForUpdate=\r\n`
    let exportStr=`module.exports={ruleForCreate,ruleForUpdate}`

    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分
    let contentForCreate=objectDeepCopy(content),contentForUpdate=objectDeepCopy(content)
    for(let coll in content){
        for(let field in content[coll]){
            // ap.inf('field',field)
            // ap.inf('content[coll][field][e_clientRuleType.REQUIRE]',content[coll][field][e_clientRuleType.REQUIRE])
            // ap.inf('contentForCreate[coll][field][e_clientRuleType.REQUIRE]',contentForCreate[coll][field][e_clientRuleType.REQUIRE])
            //如果某个applyRange定义了对应的require，则设置；如果根本没有定义，说明无法输入，需要删除
            if(undefined!==content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE]){
                // ap.inf('content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE]',content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE])
                contentForCreate[coll][field][e_clientRuleType.REQUIRE]=content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE]
            }else{
                delete contentForCreate[coll][field]
            }

            if(undefined!==content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]){
                contentForUpdate[coll][field][e_clientRuleType.REQUIRE]=content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]
            }
            if(undefined!==content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                contentForUpdate[coll][field][e_clientRuleType.REQUIRE]=content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]
            }
            if(undefined===content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY] && undefined===content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                delete contentForUpdate[coll][field]
            }
        }
    }
    // ap.inf('contentForCreate',contentForCreate)
    let finalStr=`${head}\r\n${ruleForCreate}${JSON.stringify(contentForCreate)}\r\n${ruleForUpdate}${JSON.stringify(contentForUpdate)}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}rule.js`,finalStr)
}


module.exports={
    readDirOrFileAndCovertRule, //对一个目录或者一个文件，读取内容并进行rule check
    // convertRuleFile, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}


// readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/internalInput/admin/admin_penalize.js'})
// tmpResult=readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/friend/user_friend_group.js'})

readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',resultPath:'D:/ss_vue_express/vue/src/constant/rule/'})
// readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/internalInput/',resultPath:'D:/ss_vue_express/vue/src/constant/rule/'})

/*
if(tmpResult.rc>0){
    ap.err('tmpResult',tmpResult)
}*/
