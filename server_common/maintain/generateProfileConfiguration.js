/**
 * Created by 张伟 on 2018-12-10.
 * 根据maintain/preDeploy/iniRecord中resource_profile，生成一个对象到 constant/configuration/profileConfiguration中，以便代码可以使用profile的定义
 * 需要首先被执行，以便生成的文件供其他地方（rule等）使用
 */
"use strict";
const fs=require('fs')
const ap=require('awesomeprint')
const arr_profileRecord=require('./preDeploy/initRecord').resource_profile
const e_field=require('../constant/genEnum/DB_field').Field
const e_resourceRage=require('../constant/enum/mongoEnum').ResourceRange
const e_resourceType=require('../constant/enum/mongoEnum').ResourceType

function findKeyBasedOnDBValue({value,enumDefine}){
    for(let singleKey in enumDefine['DB']){
        if(value===enumDefine['DB'][singleKey]){
            return singleKey
        }
    }
    return ''
}
//从数组转成对象
// {
//     [e_field.RESOURCE_PROFILE.NAME]:"普通用户所有文档资源设定",
//     [e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON,
//     [e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC,
//     [e_field.RESOURCE_PROFILE.MAX_NUM]:1000,
//     [e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]:1000,
// }
// {e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON:{e_resourceType.BASIC:{MAX_NUM:1000,MAX_DISK_SPACE_IN_MB:1000}}}
function generateObject(){
    let result={}
    for(let singleEle of arr_profileRecord){
        if(undefined!==singleEle[e_field.RESOURCE_PROFILE.RESOURCE_RANGE]){
            let resourceRange=singleEle[e_field.RESOURCE_PROFILE.RESOURCE_RANGE]
            //获得的是DB中的值，需要转换成key
            let keyName=findKeyBasedOnDBValue({value:resourceRange,enumDefine:e_resourceRage})
            if(''===keyName){
                return ap.err(`resourceRage ${resourceRange} 没有找到对应的keyName`)
            }

            //如果键不存在，设置
            if(undefined===result[keyName]){
                result[keyName]={}
            }

            //设置basic或者advanced
            if(undefined!==singleEle[e_field.RESOURCE_PROFILE.RESOURCE_TYPE]){
                let resourceType=singleEle[e_field.RESOURCE_PROFILE.RESOURCE_TYPE]
                let resourceTypeName=findKeyBasedOnDBValue({value:resourceType,enumDefine:e_resourceType})
                result[keyName][resourceTypeName]={}
                //设置num和size
                if(undefined!==singleEle[e_field.RESOURCE_PROFILE.MAX_NUM]){
                    result[keyName][resourceTypeName][e_field.RESOURCE_PROFILE.MAX_NUM]=singleEle[e_field.RESOURCE_PROFILE.MAX_NUM]
                }
                if(undefined!==singleEle[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]){
                    result[keyName][resourceTypeName][e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]=singleEle[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]
                }
            }
        }
    }
    return result
}

function writeFinalResult(resultFilePath){
    let description=`/*    gene by server/maintain/generateProfileConfiguration     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let resultString=``
    // resultString+=`${description}`
    resultString+=`${description}${useStrict}\r\n`
    // resultString+=`const Coll=require('./DB_Coll').Coll \r\n`

    resultString+=`const profileConfiguration=`
    let exp=`\r\nmodule.exports={\r\n${indent}profileConfiguration,\r\n}`

    let result=JSON.stringify(generateObject(),null,4)
    resultString+=result
    // exp+=result.exp

    // resultString+=`}\r\n`
    // exp+=`}\r\n`
    fs.writeFileSync(resultFilePath,`${resultString}${exp}`)
}

writeFinalResult(`../constant/config/profileConfiguration.js`)
// let resultString=''
// console.log(getFileName('H:/ss_vue_express/express/server/model/mongo/structure/admin/admin_user.js').toUpperCase())
// getFileNameInFolder('H:/ss_vue_express/express/server/model/mongo/structure/',finalResult)
// console.log(JSON.stringify(finalResult))

// writeMiddleResult('../model/mongo/structure','../constant/enum/test.js')
// generateFieldEnum()

/*let skipFilesArray=['readme.txt','enumValue.js','admin_user.js','admin_sugar.js']
writeFinalResult('../model/mongo/structure','../constant/enum/DB_field.js',skipFilesArray)*/

module.exports={
    writeFinalResult,
}