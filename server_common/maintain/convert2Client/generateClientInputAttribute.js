/**
 * Created by zhangwei on 2018/1/9.
 * 产生client的input相关数据（input对应其他属性（label，type））
 
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
const e_uniqueField=require('../../constant/genEnum/DB_uniqueField').UniqueField //单字段的unique

const clientNonValueEnum=require('../../constant/clientEnum/clientNonValueEnum')
const e_inputAttributeFieldName=clientNonValueEnum.InputAttributeFieldName


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

const clientEnumValue=require('../../constant/genEnum/clientEnumValue')

const rightResult={rc:0}
let indent=`    `

function convertRule(){

}




/*  根据server段browser的rule定义，获得对应的client的初始化inputValue
* @originRulePath：需要转换的rule的路径（文件或者目录）
* @absResultPath: 绝对 文件 路径
* */
function generateClientInputAttribute({originRulePath,absResultPath}){
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    misc.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,misc.readFileExportItem({absFilePath:singleAbsFilePath}))
    }


    // let allCollResult={'inputValueForCreate':{},'inputValueForUpdate':{}}
    let allCollAttribute={}
    for(let collName in fileExport){
        //对每个coll的rule定义，转换成iview的rule格式（但是require尚未处理）
        let result=generateSingleCollInputAttribute({collName:collName,collRuleDefinition:fileExport[collName],absFilesPath:absFilesPath})
        allCollAttribute[collName]=result
        generateSingleCollInputAttributeUnique({collAttribute:allCollAttribute[collName],collUniqueField:e_uniqueField[collName]})

        writeClientInitInputValueResult({content:allCollAttribute,resultPath:absResultPath})
    }


}

/*  根据coll的rule定义，产生对应的属性（label，type）
* 
* */
function generateSingleCollInputAttribute({collName,collRuleDefinition,absFilesPath}){
    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    // relativePath='src/constant/initInputValue/'
    let collAttribute={}

    // for(let coll in ruleForCreate){
    //     inputValueForCreate[coll]={}
        for(let field in collRuleDefinition){

            collAttribute[field]={}
            collAttribute[field][e_inputAttributeFieldName.LABEL]=collRuleDefinition[field][otherRuleFiledName.CHINESE_NAME]
            //如果没有定义placeHolder，自动补全一个空字符的数组
            if(undefined===collRuleDefinition[field][otherRuleFiledName.PLACE_HOLDER]){
                collAttribute[field][e_inputAttributeFieldName.PLACE_HOLDER]=['']
                collAttribute[field][e_inputAttributeFieldName.PLACE_HOLDER_BKUP]=['']
            }else{
                collAttribute[field][e_inputAttributeFieldName.PLACE_HOLDER]=collRuleDefinition[field][otherRuleFiledName.PLACE_HOLDER]
                collAttribute[field][e_inputAttributeFieldName.PLACE_HOLDER_BKUP]=collRuleDefinition[field][otherRuleFiledName.PLACE_HOLDER]
            }

            if(field===e_field.USER.PASSWORD){
                collAttribute[field][e_inputAttributeFieldName.INPUT_TYPE]='password'
            }

            //如果enum存在，获得enum的key
            if(undefined!==collRuleDefinition[field][ruleFiledName.ENUM]){
                //读取rule文件内容
                for(let singleFilePath of absFilesPath){
                    if(true===singleFilePath.includes(singleFilePath)){
                        let fileContent=fs.readFileSync(singleFilePath,'utf8')
                        //去除注释，空白和换行
                        fileContent=misc.deleteCommentSpaceReturn({string:fileContent})

                        // ap.inf('fileContent',fileContent)
                        let regexp=new RegExp(`${field}:{.*ruleFiledName.ENUM.+?:{define:(.*?),`)
                        // let regexp=new RegExp(`userType:{(.+)}`,'g')
                        // let regexp=/userType:{.*\[ruleFiledName.ENUM\]:{define:(.*?),/
                        // ap.inf('regexp',regexp.toString())
                        let result=fileContent.match(regexp)
                        if(undefined!==result[1]){
                            let enumName=result[1].replace('enumValue.','')
                            collAttribute[field][e_inputAttributeFieldName.ENUM_VALUE]=clientEnumValue[enumName]
                        }else{
                            ap.err('not match enum define')
                        }
                        // ap.inf('result',result)
                        // ap.inf('result',result[1])
                    }
                }

            }
            // let enumDef=JSON.stringify(collRuleDefinition[ruleFiledName.ENUM])
        }

        return collAttribute

}

/*  对单个coll的field进行检查，看是否有unique的字段
* */
function generateSingleCollInputAttributeUnique({collAttribute,collUniqueField}){
    // ap.inf('collAttribute',collAttribute)
    // ap.inf('collUniqueField',collUniqueField)
    // collUniqueField的值是数组
    for(let singleUniqueField of collUniqueField){
        if(undefined!==collAttribute[singleUniqueField]){
            // ap.inf('singleUniqueField',singleUniqueField)
            // ap.inf('collAttribute[singleUniqueField]',collAttribute[singleUniqueField])
            collAttribute[singleUniqueField][e_inputAttributeFieldName.UNIQUE]=true
            // ap.inf('collAttribute[singleUniqueField]',collAttribute[singleUniqueField])
        }
    }
}
//将rule结果写入指定路径的文件下
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientInitInputValueResult({content,resultPath}){
    // ap.inf('content',content)
    // let relativePath='src/constant/rule/'
    let description=`/*    gene by ${__filename}  \r\n`
    description+=`* 字段的非rule属性，例如label，placeHolder，unique等 \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`

    let inputAttribute=`const inputAttribute=\r\n`
    // let inputValueForUpdate=`const inputValueForUpdate=\r\n`
    let exportStr=`export {inputAttribute}` //client段采用es6的export写法
    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分

// ap.inf('ruleForCreate',ruleForCreate)
//     let contentFormatSanityForCreate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'])})

    // ap.inf('contentFormatSanityForCreate',contentFormatSanityForCreate)
    // let contentFormatSanityForUpdate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'])})


    let finalStr=`${description}${head}\r\n${inputAttribute}${JSON.stringify(content)}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
    
}



module.exports={
    generateClientInputAttribute, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientInputAttribute({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',absResultPath:'D:/ss_vue_view/src/constant/initInputValue/inputAttribute.js'})
