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
const file=require('../../function/assist/file')
const str=require('../../function/assist/string')

const dataTypeCheck=require(`../../function/validateInput/validateHelper`).dataTypeCheck
const ap=require('awesomeprint')

const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
// const convertError=require('../../constant/error/maintainError').convertBrowserRuleError
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy

const clientEnumValue=require('../../constant/genEnum/clientEnum')

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
    file.recursiveReadFileAbsPath({fileOrDirPath:originRulePath,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义
    let fileExport={}
    for(let singleAbsFilePath of absFilesPath){
        Object.assign(fileExport,file.readFileExportItem({absFilePath:singleAbsFilePath}))
    }


    // let allCollResult={'inputValueForCreate':{},'inputValueForUpdate':{}}
    // ap.inf('fileexport',Object.keys(fileExport))
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
    // ap.inf('collname',collName)
    // ap.inf('fileContent',fileContent)
    // ap.inf('collRuleDefinition',Object.keys(collRuleDefinition))
    // ap.inf('absFilesPath',absFilesPath)
    //根据ruleForUpdate和ruleForCreate，产生对应的inputValue
    // relativePath='src/constant/initInputValue/'
    let collAttribute={}
    let fileContent

    //获得匹配js文件，并读取文件内容（JSON.strinify object或有\，影响正则匹配）
    for(let singleFilePath of absFilesPath){

        if(path.basename(singleFilePath).split('.')[0]===collName){
            // ap.inf('path.basename(singleFilePath).split(\'.\')[0]',path.basename(singleFilePath).split('.')[0])
            fileContent =fs.readFileSync(singleFilePath,'utf8')

        }
    }
    //去除注释，空白和换行
    // ap.inf('fileContent',fileContent)
    fileContent=str.deleteCommentSpaceReturn({string:fileContent})
    // ap.inf('fileciontent',fileContent)
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

            //inputType在client手工测试
/*            if(field===e_field.USER.PASSWORD){
                collAttribute[field][e_inputAttributeFieldName.INPUT_TYPE]='password'
            }*/

            //如果enum存在，获得enum的key
            if(undefined!==collRuleDefinition[field][ruleFiledName.ENUM]){
                //读取rule文件内容

                collAttribute[field][e_inputAttributeFieldName.ENUM_VALUE]=browserInputRule[collName][field][ruleFiledName.ENUM]['define']
                // fileContent=fileContent.replace(/\/,'')



                        // ap.inf('fileContent',fileContent)
                        // ap.inf('field',field)
                        // let regexp=new RegExp(`${field}:{.*ruleFiledName.ENUM.+?:{define:(.*?),`)
                        let regexp=new RegExp(`${field}:{.*?ruleFiledName.ENUM\]:{define:([^,]+?),`)
                        // let regexp=new RegExp(`userType:{(.+)}`,'g')
                        // let regexp=/userType:{.*\[ruleFiledName.ENUM\]:{define:(.*?),/
                        ap.inf('regexp',regexp.toString())
                        let result=fileContent.match(regexp)
                        // ap.inf('enum value match result',result)
                        if(undefined!==result[1]){
                            ap.inf('enum value match result',result[1])
                            let enumName=result[1].replace('enumValue.','')
                            collAttribute[field][e_inputAttributeFieldName.ENUM_VALUE]=misc.objectDeepCopy(clientEnumValue[enumName])
                        }else{
                            ap.err('not match enum define')
                        }
                        // ap.inf('result',result)
                        // ap.inf('result',result[1])
                //     }
                // }

            }
            // let enumDef=JSON.stringify(collRuleDefinition[ruleFiledName.ENUM])
        }
// ap.inf('collAttribute',collAttribute)
        return collAttribute

}

/*  对单个coll的field进行检查，看是否有unique的字段
* */
function generateSingleCollInputAttributeUnique({collAttribute,collUniqueField}){
    // ap.inf('collAttribute',collAttribute)
    // ap.inf('collUniqueField',collUniqueField)
    // collUniqueField的值是数组
    if(undefined!==collUniqueField){
        for(let singleUniqueField of collUniqueField){
            if(undefined!==collAttribute[singleUniqueField]){
                // ap.inf('singleUniqueField',singleUniqueField)
                // ap.inf('collAttribute[singleUniqueField]',collAttribute[singleUniqueField])
                collAttribute[singleUniqueField][e_inputAttributeFieldName.UNIQUE]=true
                // ap.inf('collAttribute[singleUniqueField]',collAttribute[singleUniqueField])
            }
        }
    }

}
//将rule结果写入指定路径的文件下
//convertedRule：分隔成ruleForCreate/update的内容（object）
//resultPath: 最终写入的绝对路径
function writeClientInitInputValueResult({content,resultPath}){
    // ap.inf('content',typeof content)
    // let relativePath='src/constant/rule/'
    let description=`/*    gene by ${__filename}  \r\n`
    let intent=`    `
    description+=`* 字段的非rule属性，例如label，placeHolder，unique等 \r\n`
    description+=`*/\r\n\r\n`
    let head=`"use strict"\r\n\r\n`

    let fileContent=`const inputAttribute={\r\n`

    for(let singleColl in content){
        fileContent+=`${intent}${singleColl}:{\r\n`
        for(let singleFieldName in content[singleColl]){
            fileContent+=`${intent}${intent}${singleFieldName}:${JSON.stringify(content[singleColl][singleFieldName])},\r\n`
        }
        // fileContent+=`${intent}${intent}\r\n`
        fileContent+=`${intent}},\r\n`
    }
    fileContent+=`}\r\n`
    let exportStr=`export {inputAttribute}` //client段采用es6的export写法
    //将require中的applyRange（CREATE，UPDATE_SCRLAR）区分

// ap.inf('ruleForCreate',ruleForCreate)
//     let contentFormatSanityForCreate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForCreate'])})

    // ap.inf('contentFormatSanityForCreate',contentFormatSanityForCreate)
    // let contentFormatSanityForUpdate=misc.sanityClientPatternInString({string:JSON.stringify(convertedRule['ruleForUpdate'])})


    let finalStr=`${description}${head}\r\n${fileContent}\r\n\r\n${exportStr}`
    fs.writeFileSync(`${resultPath}`,finalStr)
    
}



module.exports={
    generateClientInputAttribute, //对一个目录或者一个文件，读取内容并进行rule check
    // readRuleAndConvert, //对一个文件，读取内容并进行rule check
    // checkRule, //对传入的rule（object），直接进行rule check
}



// generateClientInputAttribute({originRulePath:'D:/ss_vue_express/server_common/constant/inputRule/browserInput/user/user.js',absResultPath:'D:/ss_vue_view/src/constant/initInputValue/inputAttribute.js'})
