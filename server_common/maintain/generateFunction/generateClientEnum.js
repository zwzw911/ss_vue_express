/**
 * Created by ada on 2017-06-16.
 * 将枚举值从DB形式，改成SHOW形式(  EventStatus: { '0': '处理中', '1': '处理完毕', '2': '拒绝' },  )
 */
"use strict";
const fs=require('fs')
const serverEnum=require('../../constant/enum/mongoEnum')
// console.log(`${JSON.stringify(serverEnum)}`)


//根据server端的enum设置，生成client端的enum定义
function genClientEnum(){
    let convertedEnum={}
    for(let singleEnumName in serverEnum){ //ARTICLE_STATUS
        if(serverEnum[singleEnumName]['SHOW']){
            convertedEnum[singleEnumName]={}
            for(let singleEnumItemName in serverEnum[singleEnumName]['DB']){
                let valueInDB=serverEnum[singleEnumName]['DB'][singleEnumItemName]
                let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
                convertedEnum[singleEnumName][valueInDB]=valueForShow  //使用数字作为key，因为中文不能作为key
                // convertedEnum[singleEnumName][valueForShow]=valueInDB
            }
        }

        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['DB'])}`)
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['SHOW'])}`)
    }
    return convertedEnum
}

/*          将mongoEnum中DB和SHOW联系起来，供client端使用         */
function writeResult({content,resultFilePath}){
    let description=`/*    gene by ${__filename}     */ \r\n \r\n`
    let indent=`\ \ \ \ `

    let useStrict=`"use strict"\r\n`
    let convertedEnum=``

    let exp=`module.exports={\r\n`

    for(let singleItemName in content){
        convertedEnum+=`const ${singleItemName}=\r\n`
        convertedEnum+=`${indent}${JSON.stringify(content[singleItemName])}\r\n`
        convertedEnum+=`\r\n`

        exp+=`${indent}${singleItemName},\r\n`
    }

    exp+=`}`

    fs.writeFileSync(`${resultFilePath}`,`${description}${useStrict}${convertedEnum}${exp}`)
}

/*  调用genClientEnum和writeResult，产生用于client enum格式的文件
* @resultFilePath：最后产生文件的绝对路径
* */
function generateClientEnum({resultFilePath}){
    let result=genClientEnum()
    writeResult({content:result,resultFilePath:resultFilePath})
}
// console.log(genClientEnum())
module.exports={
    generateClientEnum,
}
// console.log(`${JSON.stringify(convertedEnum)}`)
// generateClientEnum({resultFilePath:`D:/ss_vue_express/server_common/constant/genEnum/clientEnum.js`})