/**
 * Created by ada on 2017-07-13.
 * 读取constant/inputValue/inputRule，将其中所有coll的field及其chineseName写入 constant/enum/inputRule_field_chineseName
 */
"use strict";
const fs=require('fs'),path=require('path')
const inputRule=require('../constant/inputRule/inputRule').inputRule



function generateFieldEnum(){
    // let result={}
    let indent=`\ \ \ \ `
    let convertedEnum=``


    for(let singleColl in inputRule){

        convertedEnum+=`${indent}${singleColl}:{\r\n`
        let collFields=inputRule[singleColl]
        // console.log(`${JSON.stringify(singleColl)}`)
        // console.log(`${JSON.stringify(dbFieldDefine[singleColl])}`)

        for(let singleField in collFields){
            // if(-1===skipField.indexOf(singleField)){
            //     let singleFieldKey=singleField.replace(/([A-Z])/g,"_$1")
                // console.log(singleField)
                // console.log(`${singleField.toUpperCase()}:${singleField}`)
                convertedEnum+=`${indent}${indent}'${singleField}':'${collFields[singleField]['chineseName']}',\r\n`
            // }

        }
        convertedEnum+=`},\r\n`
    }
    // fs.unlinkSync(fieldDefinePath)
    return convertedEnum
}

function writeFinalResult(toBeReadDir,resultWriteFilePath){
    let description=`/*    gene by server/maintain/generateRuleFieldChineseName     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    // convertedEnum+=`${description}`
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    // convertedEnum+=`const Coll=require('./DB_Coll').Coll \r\n`

    let moduleName='ChineseName'
    convertedEnum+=`const ${moduleName}={\r\n`
    let exp=`\r\nmodule.exports={\r\n${indent}${moduleName},\r\n}`

    let result=generateFieldEnum(toBeReadDir,resultWriteFilePath)
    convertedEnum+=result
    // exp+=result.exp

    convertedEnum+=`}\r\n`
    // exp+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}

// let convertedEnum=''
// console.log(getFileName('H:/ss_vue_express/express/server/model/mongo/structure/admin/admin_user.js').toUpperCase())
// getFileNameInFolder('H:/ss_vue_express/express/server/model/mongo/structure/',finalResult)
// console.log(JSON.stringify(finalResult))

// writeMiddleResult('../model/mongo/structure','../constant/enum/test.js')
// generateFieldEnum()
writeFinalResult('../model/mongo/structure','../constant/enum/inputRule_field_chineseName.js')

module.exports={

}