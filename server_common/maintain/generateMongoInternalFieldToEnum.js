/**
 * Created by wzhan039 on 2017-07-13.
 * 读取constant/inputValue/internalInputRule，将其中所有coll的inernal field写入到一个文件 constant/enum/DB_internal_field
 */
"use strict";
const fs=require('fs'),path=require('path')
const internalInputRule=require('../constant/inputRule/internalInputRule').internalInputRule



function generateFieldEnum(skipCollNameArray){
    // let result={}
    let indent=`\ \ \ \ `
    let convertedEnum=``


    for(let singleColl in internalInputRule){
        if(-1===skipCollNameArray.indexOf(singleColl)){
            convertedEnum+=`${indent}${singleColl}:[`
            let collFields=internalInputRule[singleColl]
            // console.log(`${JSON.stringify(singleColl)}`)
            // console.log(`${JSON.stringify(dbFieldDefine[singleColl])}`)

            for(let singleField in collFields){

                //     let singleFieldKey=singleField.replace(/([A-Z])/g,"_$1")
                    // console.log(singleField)
                    // console.log(`${singleField.toUpperCase()}:${singleField}`)
                    convertedEnum+=`'${singleField}',`
            }
        }
        convertedEnum+=`],\r\n`
    }
    // fs.unlinkSync(fieldDefinePath)
    return convertedEnum
}

function writeFinalResult(resultWriteFilePath,skipCollNameArray){
    let description=`/*    gene by server/maintain/generateMongoInternalFieldToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    // convertedEnum+=`${description}`
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    // convertedEnum+=`const Coll=require('./DB_Coll').Coll \r\n`

    convertedEnum+=`const Field={\r\n`
    let exp=`\r\nmodule.exports={\r\n${indent}Field,\r\n}`

    let result=generateFieldEnum(skipCollNameArray)
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

/*let skipCollNameArray=['admin_user','admin_sugar']
writeFinalResult('../constant/enum/DB_internal_field.js',skipCollNameArray)*/

module.exports={
    writeFinalResult,
}