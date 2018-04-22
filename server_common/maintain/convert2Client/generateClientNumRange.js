/**
 * Created by zhangwei on 2018/4/19.
 * 某些字段，需要在刻苦段连续产生多个（例如文档的tags），此时需要验证单个input的输入（例如tag是否为空，长度），以及所有input的数量。
 * 需要分隔两种不同的validator，单个input的 输入 验证放入rule( [{type:'string',max:20,message:'err'}] )，数量放入maxNum(  {field:{min:1,max:5}} )
 * 如果不需要单个input输入验证，只要求数量验证，还是可以直接放入rule中[{type:'array',max:'5',message:'test'}]
 
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
const file=require('../../function/assist/file')

const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')

const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const rightResult={rc:0}
let indent=`    `

function convertRule(){

}




/*  根据server段browser的rule定义，获得对应的client的初始化inputValue
* @originRulePath：需要转换的rule的路径（文件或者目录）
* @absResultPath: 绝对 文件 路径
* */
function generateClientNumRange({originRulePath,absResultPath}){
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    file.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,file.readFileExportItem({absFilePath:singleAbsFilePath}))

    }


    let allCollResult={}
    for(let collName in fileExport){
        //对每个coll的rule定义，转换成iview的rule格式（但是require尚未处理）
        let result=generateNumRange({collName:collName,collRuleDefinition:fileExport[collName]})

        if(undefined!==result){
            allCollResult[collName]=result
        }

        // allCollResult['inputValueForUpdate'][collName]=result['inputValueForUpdate']

        writeClientInitInputValueResult({content:allCollResult,resultPath:absResultPath})
    }


}

/*  根据coll的rule定义，产生coll对应的初始化的inputValue（iview只能使用{fieldName:value}的格式，因此其他属性需要另外一个函数产生）
* 
* */
function generateNumRange({collName,collRuleDefinition}){
    //判断coll中是否有类型为数组，且非enum的field（enum的字段的数量验证还是放入rule）
    let collNumRange


    for(let field in collRuleDefinition){
        let fieldDataType=collRuleDefinition[field][otherRuleFiledName.DATA_TYPE]
        //数据类型是数组，且不是enum（enum在页面表现为select/radio/checkbox）
        if(true===dataTypeCheck.isArray(fieldDataType) && undefined===collRuleDefinition[field][ruleFiledName.ENUM]){
            if(undefined!==collRuleDefinition[field][ruleFiledName.ARRAY_MIN_LENGTH]){
                if(undefined===collNumRange){collNumRange={}}
                collNumRange[field]={}
                collNumRange[field]['min']=collRuleDefinition[field][ruleFiledName.ARRAY_MIN_LENGTH]['define']
            }
            if(undefined!==collRuleDefinition[field][ruleFiledName.ARRAY_MAX_LENGTH]){
                if(undefined===collNumRange){collNumRange={}}
                collNumRange[field]={}
                collNumRange[field]['max']=collRuleDefinition[field][ruleFiledName.ARRAY_MAX_LENGTH]['define']
            }
        }
    }

    return collNumRange

}
//将rule结果写入指定路径的文件下
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientInitInputValueResult({content,resultPath}){
    // ap.inf('content',content)
    // let relativePath='src/constant/rule/'
    let intent=`    `
    let description=`/*    gene by ${__filename}  \r\n`
    description+=`* 当input为autoGen的时候，产生需要的min/maxNum \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`

    let fileContent=`const numRange={\r\n`
    for(let singleColl in content){
        fileContent+=`${intent}${singleColl}:{\r\n`
        for(let singleField in content[singleColl]){
            fileContent+=`${intent}${intent}${singleField}:${JSON.stringify(content[singleColl][singleField])},\r\n`
            // fileContent+=`${intent}${intent}${intent}${JSON.stringify(content[singleColl][singleField])},\r\n`
            // fileContent+=`${intent}${intent}},\r\n`
        }
        fileContent+=`${intent}},\r\n`
    }
    fileContent+=`}\r\n`

    

    let exportStr=`export {numRange}` //client段采用es6的export写法


    let finalStr=`${description}${head}\r\n${fileContent}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
    
}



module.exports={
    generateClientNumRange, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientNumRange({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/',absResultPath:'D:/ss_vue_view/src/constant/inputValue/gen/numRange.js'})