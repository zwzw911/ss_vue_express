/**
 * Created by zhangwei on 2018/1/9.
 * 读取server的browserRule，转换成client的validator使用的rule，已经对应的初始化inputValue（供client段存储用户输入）
 * readDirOrFileAbsPath：递归读取（目录下的）文件
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

const e_field=require('../../constant/genEnum/DB_field').Field
// ServerRuleMatchClientRule
// const applyRange=inputDataRuleType.ApplyRange
const e_serverRuleMatchClientRule=inputDataRuleType.ServerRuleMatchClientRule
const e_serverDataTypeMatchClientDataType=inputDataRuleType.ServerDataTypeMatchClientDataType

const e_applyRange=inputDataRuleType.ApplyRange

const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex

const misc=require('../../function/assist/misc')


const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')

const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}
let indent=`    `

function convertRule(){

}


/* 读取指定目录下所有文件/指定文件的绝对路径
* @skipFilesArray:需要排除的rule文件
* @rulePath： 可以是目录或者文件。必须是绝对路径
* */
let absFilesPath=[] //使用全局变量记录递归的中间值（文件）




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

/*  根据server段browser的rule定义，获得对应的client的rule定义（iview）
* @originRulePath：需要转换的rule的路径（文件或者目录）
* @absResultPath: 绝对 文件 路径
* */
function generateClientRule({originRulePath,absResultPath}){
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    misc.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,misc.readFileExportItem({absFilePath:singleAbsFilePath}))

    }

    let  allCollResult={ruleForCreate:{},ruleForUpdate:{}}
    for(let collName in fileExport){
        //对每个coll的rule定义，转换成iview的rule格式（但是require尚未处理）
        let singleCollIviewRawContent=convertRule_iview({collName:collName,ruleDefinitionOfFile:fileExport[collName]})
        // collIviewRawContent[collName]=singleCollIviewRawContent

        //分隔require（create/update）
        // allCollResult[collName]={}
        let result=splitRequire_iview({rawContent:singleCollIviewRawContent})
        allCollResult['ruleForCreate'][collName]=result['ruleForCreate']
        allCollResult['ruleForUpdate'][collName]=result['ruleForUpdate']

        // ap.inf('result',result)


    }
    writeClientRuleResult_iview({convertedRule:allCollResult,resultPath:absResultPath})

}

// 对传入的ruleDefinition进行检测,并转换成iview的格式(但是require尚未分离)
// @ruleDefinitionOfFile： 一个rule文件的definition
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
                    tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                }else if(singleRuleName===ruleFiledName.FORMAT){
                    tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition.toString()})
                }else{
                    tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                }
                let lastIdx=tmpResult[singleFieldName].length-1
                tmpResult[singleFieldName][lastIdx]['trigger']='blur,change'
                tmpResult[singleFieldName][lastIdx]['message']=errorMsg
                tmpResult[singleFieldName][lastIdx]['type']=clientDataType
                    // , :errorMsg
            }

        }

    }

    return tmpResult
}

//convertRule_iview得到的结果，require的定义直接照搬inputRule，需要将其中的applyRange分离
//rawContent: 单个coll转换出的符合iview格式的rule（但是require尚未分离）
function splitRequire_iview({rawContent}){
    let ruleForCreate=objectDeepCopy(rawContent),ruleForUpdate=objectDeepCopy(rawContent)
    // for(let coll in rawContent){
    for(let field in rawContent){
        // ap.inf('field',field)
        // ap.inf('content[coll][field][e_clientRuleType.REQUIRE]',content[coll][field][e_clientRuleType.REQUIRE])
        // ap.inf('ruleForCreate[coll][field][e_clientRuleType.REQUIRE]',ruleForCreate[coll][field][e_clientRuleType.REQUIRE])
        //如果某个applyRange定义了对应的require，则设置；如果根本没有定义，说明无法输入，需要删除

        for(let idx in rawContent[field]){
            // ap.inf('content[coll][field]',content[coll][field])
            // ap.inf('idx',idx)
            let ele=rawContent[field][idx]
            // ap.inf('ele',ele)
            if(undefined!==ele[e_clientRuleType.REQUIRE]){
                if(undefined!==ele[e_clientRuleType.REQUIRE][e_applyRange.CREATE]){
                    ruleForCreate[field][idx][e_clientRuleType.REQUIRE]=ele[e_clientRuleType.REQUIRE][e_applyRange.CREATE]
                }else{

                    delete ruleForCreate[field]
                }
            }

            if(undefined!==ele[e_clientRuleType.REQUIRE]){
                if( undefined!==ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]){
                    ruleForUpdate[field][idx][e_clientRuleType.REQUIRE]=ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY]
                }
                if( undefined!==ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                    ruleForUpdate[field][idx][e_clientRuleType.REQUIRE]=ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]
                }
                if( undefined===ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_ARRAY] && undefined===ele[e_clientRuleType.REQUIRE][e_applyRange.UPDATE_SCALAR]){
                    delete ruleForUpdate[field]
                }
            }

        }

    }
    // }

    return {ruleForCreate:ruleForCreate,ruleForUpdate:ruleForUpdate}
}
//将rule结果写入指定路径的文件下
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientRuleResult_iview({convertedRule,resultPath}){
    // ap.inf('content',content)
    // let relativePath='src/constant/rule/'
    let description=`/*    gene by ${__filename}  \r\n`
    description+=`* 产生client的rule \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`

    let ruleForCreate=`const ruleForCreate=\r\n`
    let ruleForUpdate=`const ruleForUpdate=\r\n`
    let exportStr=`export {ruleForCreate,ruleForUpdate}`  //client段采用es6的export写法

    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分
    
// ap.inf('convertedRule[\'ruleForCreate\']',convertedRule['ruleForCreate'])
    let contentFormatSanityForCreate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'])})

    // ap.inf('contentFormatSanityForCreate',contentFormatSanityForCreate)
    let contentFormatSanityForUpdate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'])})
    let finalStr=`${description}${head}\r\n${ruleForCreate}${contentFormatSanityForCreate}\r\n${ruleForUpdate}${contentFormatSanityForUpdate}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)


    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    // relativePath='src/constant/initInputValue/'
    /*let inputValueruleForCreate={},inputValueruleForUpdate={}
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
    fs.writeFileSync(`${resultProjectPath}${relativePath}inputValue.js`,finalStr)*/
}



module.exports={
    generateClientRule, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientRule({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',absResultPath:'D:/ss_vue_view/src/constant/rule/rule.js'})