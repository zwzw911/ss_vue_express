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
const e_applyRange=inputDataRuleType.ApplyRange

const e_field=require('../../constant/genEnum/DB_field').Field
// ServerRuleMatchClientRule
// const applyRange=inputDataRuleType.ApplyRange
const e_serverRuleMatchClientRule=inputDataRuleType.ServerRuleMatchClientRule
const e_serverDataTypeMatchClientDataType=inputDataRuleType.ServerDataTypeMatchClientDataType

// const e_applyRange=inputDataRuleType.ApplyRange

const fs=require('fs'),path=require('path')
const regex=require('../../constant/regex/regex').regex

// const misc=require('../../function/assist/misc')
const file=require('../../function/assist/file')
const str=require('../../function/assist/string')

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






/*  根据server段browser的rule定义，获得对应的client的rule定义（iview）
* @originRulePath：需要转换的rule的路径（文件或者目录）
* @absResultPath: 绝对 文件 路径
* */
function generateClientRule({originRulePath,absResultPath}){
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    //skipDirArray:['admin']
    file.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,file.readFileExportItem({absFilePath:singleAbsFilePath}))

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
// @ruleDefinitionOfFile： 一个coll的rule文件的definition
//特殊处理：如果是enum,在处理enum list的时候，type要设置成enum====>[{type:"string",message:"",trigger:"",required:true},{type:"enum",message:"",trigger:"",enum:[1,2,3,4]}]
//          如果是array，需要产生2组rule：一组对array本身(required/array_min/max_length)，一组对array中的元素(除了required/array_min/max_length之外的rule)。分别以字段名称，以及字段名称.0命名
function convertRule_iview({collName,ruleDefinitionOfFile}){
    let tmpResult={}

    for(let singleFieldName in ruleDefinitionOfFile){
        tmpResult[singleFieldName]=[]  //iview的格式
// ap.inf('singleFieldName',singleFieldName)
        let clientDataType//,clientEleDataType  //获得field的dataType，如果是array，还要获得array元素的类型
        let dataTypeDefinition=ruleDefinitionOfFile[singleFieldName][otherRuleFiledName.DATA_TYPE]
        let ifArray=false   //判断数据类型是否为array，初始设为false
        let ifEnum=false //因为enum的dataType是string，但是需要额外指出type=enum，以便检测enum是否位于范围内
        // let isEnumArray=false,isNormalArray=false //字段是否为enumArray还是普通array，默认不是任何array

        //获得field的数据类型
        //是array，判断enumArray还是normalArray
        if(true===dataTypeCheck.isArray(dataTypeDefinition)){
            // clientDataType=e_clientDataType.ARRAY   //{type:'array'}
            // clientEleDataType=dataTypeDefinition[0]
            clientDataType=dataTypeDefinition[0]
            ifArray=true
/*            if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]){
                isEnumArray=true
            }else{
                isNormalArray=true
            }*/
        }else{
            clientDataType=dataTypeDefinition
        }

        //需要从server的dataTYpe转换成client的dataType。例如，server的objectId，在client必须是string
        clientDataType=e_serverDataTypeMatchClientDataType[clientDataType]
/*if('array'===clientDataType){
            ap.wrn(`field ${singleFieldName} type is array`)
}*/
        //enum的dataType是string，所以需要额外进行判断
        if(undefined!==ruleDefinitionOfFile[singleFieldName][ruleFiledName.ENUM]){
            ifEnum=true
        }
        // ap.inf('singleFieldName isEnumArray',isEnumArray)
        // ap.inf('singleFieldName isNormalArray',isNormalArray)

        let eleRuleKeyName   //如果是array，需要为其中元素设置rule，不能用fieldName，而是用fieldName.0
        if(true===ifArray){
            eleRuleKeyName=`${singleFieldName}.0`
            tmpResult[eleRuleKeyName]=[]
        }

        for(let singleRuleName in ruleDefinitionOfFile[singleFieldName]){
            let newClientDataType=clientDataType  //后续（例如enum可能会更改原始数据类型，因此每次都要重新赋值，防止临时更改影响后续的rule）

            let ifRuleBelongToEle=false //判断当前singleRule，是属于fieldName的（数组，或者非数组），还是eleRuleKeyName的（数组的元素）。ifArray是对field的整体判断，而不是对field下单个rule的判断，所以不能被用来判断是放入field的rule，还是field的元素的rule
            // ap.inf('ruleDefinitionOfFile[singleFieldName]',ruleDefinitionOfFile[singleFieldName])
            // ap.inf('singleRuleName',singleRuleName)
            //判断单条rule的定义是否合法（是否为预定义（REQUIRE/FORMAT等）的一种）。如果不是(chineseName/applyrange/dataType/placeHolder)，打印错误，并继续下一条
            if(-1===Object.values(ruleFiledName).indexOf(singleRuleName)){
                ap.wrn(`coll ${collName} field ${singleFieldName}: rule ${singleRuleName} not predefined`)
                continue
            }

            //提取通用部分: rule定义和错误信息（iview的一个rule包含4部分，type,message,trigger,define）
            let singleRuleDefinition=ruleDefinitionOfFile[singleFieldName][singleRuleName]['define']
            let errorMsg=ruleDefinitionOfFile[singleFieldName][singleRuleName]['error']['msg']
            //根据不同的rule进行处理
            switch (singleRuleName){
                case ruleFiledName.REQUIRE:
                    if(true===ifArray){
                        singleRuleDefinition[e_applyRange.CREATE]=true //普通array，create必定为true
                        //require比较特殊，如果是array，那么对于其中元素来说，内容必须不为空（require必须为true，否则生成的这个元素将毫无意义）
                        tmpResult[eleRuleKeyName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                        let lastIdx=tmpResult[eleRuleKeyName].length-1
                        tmpResult[eleRuleKeyName][lastIdx]['trigger']='blur,change'
                        tmpResult[eleRuleKeyName][lastIdx]['message']=errorMsg
                    }
                    tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})


                    break;
                case ruleFiledName.FORMAT:
                    //如果是数组，则FORMAT属性是对应数组元素的属性，需要被加入到tmpResult[`${singleFieldName}.0`]中；否则直接在default中，直接加入整体验证规则中（而不是defaultField）
                    if(true===ifArray){
                        ifRuleBelongToEle=true
                        // tmpResult[e_serverRuleMatchClientRule[singleRuleName]]=singleRuleDefinition.toString()
                        tmpResult[eleRuleKeyName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition.toString()})
                        // continue
                    }
                    else{
                        //正则要先变成string（然后将""去掉，便会正则）
                        tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition.toString()})
                    }

                    break;
                case ruleFiledName.MIN_LENGTH:
                    //如果是数组，则MIN_LENGTH属性是对应数组元素的属性，需要被加入到defaultField中，最后在被push到tmpResult；否则直接在default中，直接加入整体验证规则中（而不是defaultField）
                    if(true===ifArray){
                        ifRuleBelongToEle=true
                        tmpResult[eleRuleKeyName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                        // continue
                    }else{
                        tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }

                    break;
                case ruleFiledName.MAX_LENGTH:
/*                    if('article'===collName && 'name'===singleFieldName){
                        ap.err('ifarray',ifArray)
                    }*/
                    //如果是数组，则MIN属性是对应数组元素的属性，需要被加入到defaultField中，最后在被push到tmpResult；否则直接在default中，直接加入整体验证规则中（而不是defaultField）
                    if(true===ifArray){
                        ifRuleBelongToEle=true
                        tmpResult[eleRuleKeyName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                        // continue
                    }else{
                        tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }

                    break;
                case ruleFiledName.ARRAY_MIN_LENGTH:
                    if(false===ifArray){
                        ap.err(`coll ${collName} field ${singleFieldName}: rule ${singleRuleName} has ARRAY_MIN_LENGTH, but type not array`)
                        continue
                    }
                    //不能论是不是enum，只要是array，就要push {type:array,message:"",trigger:"",min:1}
                    tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    /*//数组enum，才需要ARRAY_MIN/MAX；其他数组，直接使用numberRange
                    if(true===ifEnum && true===ifArray){
                        tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }*/
                    break;
                case ruleFiledName.ARRAY_MAX_LENGTH:
                    if(false===ifArray){
                        ap.err(`coll ${collName} field ${singleFieldName}: rule ${singleRuleName} has ARRAY_MAX_LENGTH, but type not array`)
                        continue
                    }
                    //不能论是不是enum，只要是array，就要push {type:array,message:"",trigger:"",min:1}
                    tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
/*                    //数组enum，才需要ARRAY_MIN/MAX；其他数组，直接使用numberRange
                    if(true===ifEnum && true===ifArray){
                        tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }*/
                    break;
                case ruleFiledName.ENUM:
                    //如果是enum，type需要设定为enum。[{type:"enum",enum:[1,2,3,4],message:"error",trigger:"blur change"}]
                    //只有在非array，且是enum的情况下，才需要把数据类型改成enum，以便让async-validator使用（如果是array，保持数据类型不便，相应的enum检测，放入eleRuleKeyName中）
                    if(false===ifArray && true===ifEnum){
                        newClientDataType=e_clientDataType.ENUM
                    }

                    if(true===ifArray){
                        ifRuleBelongToEle=true
                        tmpResult[eleRuleKeyName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }else{
                        tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }

                    break;
                default:
                    if(true===ifArray){
                        ifRuleBelongToEle=true
                        tmpResult[eleRuleKeyName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }else{
                        tmpResult[singleFieldName].push({[e_serverRuleMatchClientRule[singleRuleName]]:singleRuleDefinition})
                    }

            }


            //添加trigger和message，如果是enum，还要将type改成enum（async_validator这样定义来检测enum）
            if(false===ifRuleBelongToEle) {
                //无论是否为array，都要为singleFieldName执行如下操作
                let lastIdx = tmpResult[singleFieldName].length - 1
                tmpResult[singleFieldName][lastIdx]['trigger'] = 'blur,change'
                tmpResult[singleFieldName][lastIdx]['message'] = errorMsg
                // tmpResult[singleFieldName][lastIdx]['type']=clientDataType
                tmpResult[singleFieldName][lastIdx]['type'] = ifArray ? e_clientDataType.ARRAY : newClientDataType
                // ifEnum ? tmpResult[singleFieldName][lastIdx]['type']=newClientDataType : tmpResult[singleFieldName][lastIdx]['type']=clientDataType
            }
            // }else{
            //如果是array，要额外为eleRuleKeyName添加属性
            if(true===ifArray && true===ifRuleBelongToEle){
                let lastIdx=tmpResult[eleRuleKeyName].length-1
                if(lastIdx>=0){
                    // ap.inf('lastIdx',lastIdx)
                    // ap.inf('tmpResult[eleRuleKeyName][lastIdx]',tmpResult[eleRuleKeyName][lastIdx])
                    tmpResult[eleRuleKeyName][lastIdx]['trigger']='blur,change'
                    tmpResult[eleRuleKeyName][lastIdx]['message']=errorMsg
                    ifEnum ? tmpResult[eleRuleKeyName][lastIdx]['type']=e_clientDataType.ENUM : tmpResult[eleRuleKeyName][lastIdx]['type']=newClientDataType
                    // tmpResult[eleRuleKeyName][lastIdx]['type']=e_clientDataType.ARRAY
                }
            }


            // }
            /*let lastIdx=tmpResult[singleFieldName].length-1
            tmpResult[singleFieldName][lastIdx]['trigger']='blur,change'
            tmpResult[singleFieldName][lastIdx]['message']=errorMsg

            //普通array
            if(true===ifArray && false===ifEnum){
                tmpResult[singleFieldName][lastIdx]['type']=e_clientDataType.ARRAY
            }else{
                tmpResult[singleFieldName][lastIdx]['type']=newClientDataType
            }*/
        }
        //如果是array，且defaultField的key数量大于1（1是type，是数组则必定设置）
        // ap.wrn('defaultField',defaultField)
/*        if(true===ifArray && Object.keys(defaultField).length>1){
            tmpResult[singleFieldName].push({defaultField:defaultField})
        }*/
    }
// ap.inf('tmpResult',tmpResult.tags)
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
// ap.inf('ruleForCreate',ruleForCreate)
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
    let contentFormatSanityForCreate=str.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'],undefined,'  ')})
//     let contentFormatSanityForCreate=str.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'])})

    // ap.inf('contentFormatSanityForCreate',contentFormatSanityForCreate)
    let contentFormatSanityForUpdate=str.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'],undefined,'  ')})
    // let contentFormatSanityForUpdate=str.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'])})
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



// generateClientRule({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/article/article.js',absResultPath:'D:/ss_vue_view/src/constant/rule/rule.js'})