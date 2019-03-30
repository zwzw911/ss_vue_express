/**
 * Created by zhangwei on 2018/1/9.
 * 产生client的input相关数据（空inputValue，input对应其他属性（label，type））
 
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
function generateClientInputValue({originRulePath,absResultPath}){
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    file.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,file.readFileExportItem({absFilePath:singleAbsFilePath}))

    }


    let allCollResult={'inputValueForCreate':{},'inputValueForUpdate':{}}
    for(let collName in fileExport){
        //对每个coll的rule定义，转换成iview的rule格式（但是require尚未处理）
        let result=generateInitInputValue({collName:collName,collRuleDefinition:fileExport[collName]})

        allCollResult['inputValueForCreate'][collName]=result['inputValueForCreate']
        allCollResult['inputValueForUpdate'][collName]=result['inputValueForUpdate']

        writeClientInitInputValueResult({content:allCollResult,resultPath:absResultPath})
    }


}

/*  根据coll的rule定义，产生coll对应的初始化的inputValue（iview只能使用{fieldName:value}的格式，因此其他属性需要另外一个函数产生）
* 
* */
function generateInitInputValue({collName,collRuleDefinition}){
    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    // relativePath='src/constant/initInputValue/'
    let inputValueForCreate={},inputValueForUpdate={}

    // for(let coll in ruleForCreate){
    //     inputValueForCreate[coll]={}
        for(let field in collRuleDefinition){

            // inputValueForCreate[field]['label']=browserInputRule[coll][field][otherRuleFiledName.CHINESE_NAME]
            // ap.inf('field',field)
            // ap.inf('collRuleDefinition[field][ruleFiledName.REQUIRE]',collRuleDefinition[field][ruleFiledName.REQUIRE])
            if(undefined!==collRuleDefinition[field][ruleFiledName.REQUIRE]['define'][e_applyRange.CREATE]){
                inputValueForCreate[field]=null //设成null，而不是undefined，否则字段会不存在
            }

            if(undefined!==collRuleDefinition[field][ruleFiledName.REQUIRE]['define'][e_applyRange.UPDATE_SCALAR] || undefined!==collRuleDefinition[field][ruleFiledName.REQUIRE]['define'][e_applyRange.UPDATE_ARRAY]){
                inputValueForUpdate[field]='notUsed' //设成notUsed(null会影响update的fieldValue，导致server认为字段需要被删除；undefined，会导致字段不存在，而在赋值时出错；notUsed最好，即避免了以上问题，又可以提示开发，update的时候，那些字段没有被初始化)
            }

        }

        return {inputValueForCreate:inputValueForCreate,inputValueForUpdate:inputValueForUpdate}

}
//将rule结果写入指定路径的文件下
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientInitInputValueResult({content,resultPath}){
    // ap.inf('content',content)
    // let relativePath='src/constant/rule/'
    let intent=`    `
    let description=`/*    gene by ${__filename}  \r\n`
    description+=`* 空对象，存储字段值（vue双向绑定） \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`

    let fileContentForCreate=`const inputValueForCreate=`
/*    for(let singleColl in content['inputValueForCreate']){
        fileContentForCreate+=`${intent}${singleColl}:${JSON.stringify(content['inputValueForCreate'][singleColl])},\r\n`
    }*/
    fileContentForCreate+=JSON.stringify(content['inputValueForCreate'],undefined,'    ')
    fileContentForCreate+=`\r\n`

    fileContentForCreate+=`//设成notUsed(null会影响update的fieldValue，导致server认为字段需要被删除；undefined，会导致字段不存在，而在赋值时出错；notUsed最好，即避免了以上问题，又可以提示开发，update的时候，那些字段没有被初始化)`
    let fileContentForUpdate=`const inputValueForUpdate=`
    fileContentForUpdate+=JSON.stringify(content['inputValueForUpdate'],undefined,'    ')
/*    for(let singleColl in content['inputValueForUpdate']){
        fileContentForUpdate+=`${intent}${singleColl}:${JSON.stringify(content['inputValueForUpdate'][singleColl])},\r\n`
    }*/
    // fileContentForUpdate+=`}\r\n`

    let exportStr=`export {inputValueForCreate,inputValueForUpdate}` //client段采用es6的export写法
    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分

/*    let initValueForCreate=content['inputValueForCreate']
    let initValueForUpdate=content['inputValueForUpdate']*/
    /*let fileContent=`const inputTempData={\r\n`

    for(let singleColl in content){
        fileContent+=`${intent}${singleColl}:{\r\n`
        for(let singleFieldName in content[singleColl]){
            fileContent+=`${intent}${intent}${singleFieldName}:${JSON.stringify(content[singleColl][singleFieldName])},\r\n`
        }
        // fileContent+=`${intent}${intent}\r\n`
        fileContent+=`${intent}},\r\n`
    }
    fileContent+=`}\r\n`*/

// ap.inf('ruleForCreate',ruleForCreate)
//     let contentFormatSanityForCreate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'])})

    // ap.inf('contentFormatSanityForCreate',contentFormatSanityForCreate)
    // let contentFormatSanityForUpdate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'])})


    let finalStr=`${description}${head}\r\n${fileContentForCreate}\r\n${fileContentForUpdate}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
    
}



module.exports={
    generateClientInputValue, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientInputValue({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',absResultPath:'D:/ss_vue_view/src/constant/initInputValue/inputValue.js'})