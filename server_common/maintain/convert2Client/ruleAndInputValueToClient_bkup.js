/**
 * Created by zhangwei on 2018/1/9.
 * 读取server的browserRule，转换成client的validator使用的rule，已经对应的初始化inputValue（供client段存储用户输入）
 * readDirOrFileAndCovertRule：递归读取（目录下的）文件
 * readRuleAndConvert：读取文件中的rule定义，并调用convertRule_iview根据rule定义，进行对应的操作
 */
'use strict'
const inputDataRuleType=require('../../constant/enum/inputDataRuleType')
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const ruleFiledName=inputDataRuleType.RuleFiledName
const serverDataType=inputDataRuleType.ServerDataType
const serverRuleType=inputDataRuleType.ServerRuleType
const e_clientDataType=inputDataRuleType.ClientDataType
const e_clientRuleType=inputDataRuleType.ClientRuleType
// ServerRuleMatchClientRule
// const applyRange=inputDataRuleType.ApplyRange
const e_serverRuleMatchClientRule=inputDataRuleType.ServerRuleMatchClientRule
const e_serverDataTypeMatchClientDataType=inputDataRuleType.ServerDataTypeMatchClientDataType

const e_applyRange=inputDataRuleType.ApplyRange

const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex


const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')

const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}
let indent=`    `
/* 读取指定目录下所有文件/指定文件，读取其中的export，require到一个文件
* @skipFilesArray:需要排除的rule文件
* @rulePath： 可以是目录或者文件。必须是绝对路径
* */
function  readDirOrFileAndCovertRule({skipFilesArray,rulePath,resultProjectPath}){
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
                readDirOrFileAndCovertRule({skipFilesArray:skipFilesArray,rulePath:tmpFileDir,resultProjectPath:resultProjectPath})
            }
            //读取到coll文件中module.exports中的内容（以便require）
            if(true===isFile){
                // ap.inf('tmpFileDir',tmpFileDir)
                tmpResult=Object.assign(tmpResult,readRuleAndConvert({absFilePath:tmpFileDir,skipFilesArray:skipFilesArray,}))
                if(tmpResult.rc>0){
                    ap.err('tmpResult',tmpResult)
                    return tmpResult
                }
            }
        }
    }
    if(true===isRulePathFile){
        // ap.inf('rulePath',rulePath)
        tmpResult=readRuleAndConvert({absFilePath:rulePath,skipFilesArray:skipFilesArray,})
        if(tmpResult.rc>0){
            ap.err('tmpResult',tmpResult)
            return tmpResult
        }
    }

    writeResult_iview({content:tmpResult,resultProjectPath:resultProjectPath})


    return rightResult
}

/*  读取rule文件内容并调用checkRule函数对rule检查
* @absFilePath：rule文件绝对路径
* @skipFilesArray：需要skip的rule文件
* */
function readRuleAndConvert({absFilePath,skipFilesArray}){
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
                tmpResult[singleExportsItem]=convertRule_iview({collName:singleExportsItem,ruleDefinitionOfFile:ruleDefineContent})
                // ap.inf('tmpResult',tmpResult)

                ap.inf(`end convert coll==>${singleExportsItem}`)
                // ap.print('ruleDefineContent',ruleDefineContent)
            }
        }
    }

    return tmpResult
    // }
}

/*  对传入的ruleDefinition进行检测,并转换成asyncValidator的格式
* @ruleDefinitionOfFile：object。一个文件的ruleDefinition。
* */
function convertRule_asyncValidator({collName,ruleDefinitionOfFile}){
    let tmpResult={}

    for(let singleFieldName in ruleDefinitionOfFile){
        tmpResult[singleFieldName]={}  //iview的格式

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
                            // ap.inf('ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]',eval(ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define']))
                            tmpResult[singleFieldName]['defaultField'][e_clientRuleType.PATTERN]=eval(ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define'])
                        }
                        if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]){
                            tmpResult[singleFieldName]['defaultField'][e_clientRuleType.ENUM]=ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]['define']
                        }
                    }else{
                        tmpResult[singleFieldName]['type']=e_serverDataTypeMatchClientDataType[singleRuleDefinition]
                        if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]){
                            // ap.inf('ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]',ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define'].toString())
                            tmpResult[singleFieldName][e_clientRuleType.PATTERN]=ruleDefinitionOfFile[singleFieldName][ruleFiledName.FORMAT]['define'].toString()
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
function writeResult_asyncValidator({content,resultProjectPath}){
    // ap.inf('content',content)
    let relativePath='src/constant/rule/'
    let head=`"use strict"\r\n\r\n`

    let ruleForCreate=`const ruleForCreate=\r\n`
    let ruleForUpdate=`const ruleForUpdate=\r\n`
    let exportStr=`export {ruleForCreate,ruleForUpdate}`   //client段采用es6的export写法

    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分
    let ruleForCreate=objectDeepCopy(content),ruleForUpdate=objectDeepCopy(content)
    for(let coll in content){
        for(let field in content[coll]){
            // ap.inf('field',field)
            // ap.inf('content[coll][field][e_clientRuleType.REQUIRE]',content[coll][field][e_clientRuleType.REQUIRE])
            // ap.inf('ruleForCreate[coll][field][e_clientRuleType.REQUIRE]',ruleForCreate[coll][field][e_clientRuleType.REQUIRE])
            //如果某个applyRange定义了对应的require，则设置；如果根本没有定义，说明无法输入，需要删除
            if(undefined!==content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE]){
                // ap.inf('content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE]',content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE])
                ruleForCreate[coll][field][e_clientRuleType.REQUIRE]=content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.CREATE]
            }else{
                delete ruleForCreate[coll][field]
            }

            if(undefined!==content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]){
                ruleForUpdate[coll][field][e_clientRuleType.REQUIRE]=content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]
            }
            if(undefined!==content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                ruleForUpdate[coll][field][e_clientRuleType.REQUIRE]=content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]
            }
            if(undefined===content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY] && undefined===content[coll][field][e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                delete ruleForUpdate[coll][field]
            }
        }
    }

    let finalStr=`${head}\r\n${ruleForCreate}${JSON.stringify(ruleForCreate)}\r\n${ruleForUpdate}${JSON.stringify(ruleForUpdate)}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultProjectPath}${relativePath}rule.js`,finalStr)


    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    relativePath='src/constant/initInputValue/'
    let inputValueruleForCreate={},inputValueruleForUpdate={}
    let inputValueForCreate=`const inputValueForCreate=\r\n`
    let inputValueForUpdate=`const inputValueForUpdate=\r\n`
    exportStr=`export {inputValueForCreate,inputValueForUpdate}`  //client段采用es6的export写法
    for(let coll in ruleForCreate){
        inputValueruleForCreate[coll]={}
        for(let field in ruleForCreate[coll]){
            inputValueruleForCreate[coll][field]={}
            inputValueruleForCreate[coll][field]['label']=browserInputRule[coll][field][otherRuleFiledName.CHINESE_NAME]
            inputValueruleForCreate[coll][field]['value']=null //设成null，而不是undefined，否则字段会不存在
        }
    }
    for(let coll in ruleForUpdate){
        inputValueruleForUpdate[coll]={}
        for(let field in ruleForUpdate[coll]){
            inputValueruleForUpdate[coll][field]={}
            inputValueruleForUpdate[coll][field]['label']=browserInputRule[coll][field][otherRuleFiledName.CHINESE_NAME]
            inputValueruleForUpdate[coll][field]['value']=null //设成null，而不是undefined，否则字段会不存在
        }
    }
    finalStr=`${head}\r\n${inputValueForCreate}${JSON.stringify(inputValueruleForCreate)}\r\n${inputValueForUpdate}${JSON.stringify(inputValueruleForUpdate)}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultProjectPath}${relativePath}inputValue.js`,finalStr)
}



// 对传入的ruleDefinition进行检测,并转换成iview的格式
function convertRule_iview({collName,ruleDefinitionOfFile}){
    let tmpResult={}

    for(let singleFieldName in ruleDefinitionOfFile){
        tmpResult[singleFieldName]=[]  //iview的格式

        let clientDataType,clientEleDataType  //获得field的dataType，如果是array，还要获得array元素的类型
        let dataTypeDefinition=ruleDefinitionOfFile[singleFieldName][otherRuleFiledName.DATA_TYPE]
        //获得field的数据类型
        if(true===dataTypeCheck.isArray(dataTypeDefinition)){
            clientDataType=e_clientDataType.ARRAY   //{type:'array'}
            clientEleDataType=dataTypeDefinition[0]
        }else{
            clientDataType=dataTypeDefinition
        }


        for(let singleRuleName in ruleDefinitionOfFile[singleFieldName]){
            // ap.inf('ruleDefinitionOfFile[singleFieldName]',ruleDefinitionOfFile[singleFieldName])
            // ap.inf('singleRuleName',singleRuleName)
            if(-1!==Object.values(ruleFiledName).indexOf(singleRuleName)){
                let singleRuleDefinition=ruleDefinitionOfFile[singleFieldName][singleRuleName]['define']
                let errorMsg=ruleDefinitionOfFile[singleFieldName][singleRuleName]['error']['msg']
                if(singleRuleName===ruleFiledName.REQUIRE){
                    tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition, message:errorMsg})
                }else if(singleRuleName===ruleFiledName.FORMAT){
                    tmpResult[singleFieldName].push({'type':clientDataType,[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition.toString(), message:errorMsg})
                }else{
                    tmpResult[singleFieldName].push({'type':clientDataType,[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition, message:errorMsg})
                }

            }

        }

    }

    return tmpResult
}

//convertRule_iview得到的结果，require的定义直接照搬inputRule，需要将其中的applyRange分离
//clientRule: convertRule_iview得到的结果
function splitRequire_iview({clientRule}){
    let ruleForCreate=objectDeepCopy(clientRule),ruleForUpdate=objectDeepCopy(clientRule)
    for(let coll in content){
        for(let field in content[coll]){
            // ap.inf('field',field)
            // ap.inf('content[coll][field][e_clientRuleType.REQUIRE]',content[coll][field][e_clientRuleType.REQUIRE])
            // ap.inf('ruleForCreate[coll][field][e_clientRuleType.REQUIRE]',ruleForCreate[coll][field][e_clientRuleType.REQUIRE])
            //如果某个applyRange定义了对应的require，则设置；如果根本没有定义，说明无法输入，需要删除

            for(let idx in content[coll][field]){
                // ap.inf('content[coll][field]',content[coll][field])
                // ap.inf('idx',idx)
                let ele=content[coll][field][idx]
                // ap.inf('ele',ele)
                if(undefined!==ele[e_clientRuleType.REQUIRE]){
                    if(undefined!==ele[e_clientRuleType.REQUIRE][e_applyRange.CREATE]){
                        ruleForCreate[coll][field][idx][e_clientRuleType.REQUIRE]=ele[e_clientRuleType.REQUIRE][e_applyRange.CREATE]
                    }else{

                        delete ruleForCreate[coll][field]
                    }
                }

                if(undefined!==ele[e_clientRuleType.REQUIRE]){
                    if( undefined!==ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]){
                        ruleForUpdate[coll][field][idx][e_clientRuleType.REQUIRE]=ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]
                    }
                    if( undefined!==ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                        ruleForUpdate[coll][field][idx][e_clientRuleType.REQUIRE]=ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]
                    }
                    if( undefined===ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY] && undefined===ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                        delete ruleForUpdate[coll][field]
                    }
                }

            }

        }
    }
}
//将结果写入指定路径的文件下
function writeResult_iview({content,resultProjectPath}){
    // ap.inf('content',content)
    let relativePath='src/constant/rule/'
    let head=`"use strict"\r\n\r\n`

    let ruleForCreate=`const ruleForCreate=\r\n`
    let ruleForUpdate=`const ruleForUpdate=\r\n`
    let exportStr=`export {ruleForCreate,ruleForUpdate}`  //client段采用es6的export写法

    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分
    
// ap.inf('ruleForCreate',ruleForCreate)
    let contentFormatSanityForCreate=JSON.stringify(ruleForCreate).replace(regex.clientRemoveDoubleQuotes, '$1/$3/,"').replace(regex.removeDoubleSlash,'\\')
    let contentFormatSanityForUpdate=JSON.stringify(ruleForUpdate).replace(regex.clientRemoveDoubleQuotes, '$1/$3/,"').replace(regex.removeDoubleSlash,'\\')
    let finalStr=`${head}\r\n${ruleForCreate}${contentFormatSanityForCreate}\r\n${ruleForUpdate}${contentFormatSanityForUpdate}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultProjectPath}${relativePath}rule.js`,finalStr)


    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    relativePath='src/constant/initInputValue/'
    let inputValueruleForCreate={},inputValueruleForUpdate={}
    let inputValueForCreate=`const inputValueForCreate=\r\n`
    let inputValueForUpdate=`const inputValueForUpdate=\r\n`
    exportStr=`export {inputValueForCreate,inputValueForUpdate}` //client段采用es6的export写法
    for(let coll in ruleForCreate){
        inputValueruleForCreate[coll]={}
        for(let field in ruleForCreate[coll]){
            inputValueruleForCreate[coll][field]={}
            inputValueruleForCreate[coll][field]['label']=browserInputRule[coll][field][otherRuleFiledName.CHINESE_NAME]
            inputValueruleForCreate[coll][field]['value']=null //设成null，而不是undefined，否则字段会不存在
        }
    }
    for(let coll in ruleForUpdate){
        inputValueruleForUpdate[coll]={}
        for(let field in ruleForUpdate[coll]){
            inputValueruleForUpdate[coll][field]={}
            inputValueruleForUpdate[coll][field]['label']=browserInputRule[coll][field][otherRuleFiledName.CHINESE_NAME]
            inputValueruleForUpdate[coll][field]['value']=null //设成null，而不是undefined，否则字段会不存在
        }
    }
    finalStr=`${head}\r\n${inputValueForCreate}${JSON.stringify(inputValueruleForCreate)}\r\n${inputValueForUpdate}${JSON.stringify(inputValueruleForUpdate)}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultProjectPath}${relativePath}inputValue.js`,finalStr)
}



module.exports={
    readDirOrFileAndCovertRule, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}


// readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/internalInput/admin/admin_penalize.js'})
// tmpResult=readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/friend/user_friend_group.js'})

readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',resultProjectPath:'D:/ss_vue_view/'})
// readDirOrFileAndCovertRule({rulePath:'D:/ss_vue_express/server_common/constant/inputRule/internalInput/',resultProjectPath:'D:/ss_vue_express/vue/src/constant/rule/'})

/*
if(tmpResult.rc>0){
    ap.err('tmpResult',tmpResult)
}*/
