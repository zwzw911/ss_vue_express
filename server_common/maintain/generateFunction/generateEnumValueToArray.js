/**
 * Created by zhang wei on 2018-03-20.
 * 读取 enum 文件，将每个enum的value写入一个数组
 */
"use strict";
const fs=require('fs')
const path=require('path')
const ap=require('awesomeprint')

// const misc=require('../function/misc')
const file=require('../../function/assist/file')

function genEnumValueToArray({fileOrDirPath,skipFilesArray,resultDirPath}){
    // ap.inf('fileOrDirPath',fileOrDirPath)
    //1. 读取originRulePath下所有文件
    let absFilesPath=[]
    file.recursiveReadFileAbsPath({fileOrDirPath:fileOrDirPath,skipFilesArray:skipFilesArray,absFilesPathResult:absFilesPath})
    // ap.inf('absFilesPath',absFilesPath)
    //2. 对每个文件，读取export定义

    for(let singleAbsFilePath of absFilesPath){
        let fileExport={}
        Object.assign(fileExport,file.readFileExportItem({absFilePath:singleAbsFilePath}))
        let content=genContent({fileExport})
        // ap.inf('content',content)
        let resultAbsPath=resultDirPath+path.basename(singleAbsFilePath).split('.')[0]+'Value.js'
        // ap.inf('resultAbsPath',resultAbsPath)
        writeResult({content:content,resultAbsPath})

    }


}


function genContent({fileExport}){

    let description=`/*    gene by server/maintain/generateEnumValueToArray     */ \r\n \r\n`
    let useStrict=`"use strict"\r\n`
    let exp='module.exports={\r\n'
    let indent=`\ \ \ \ `
    let convertedEnum=``
    for(let singleEnumName in fileExport){ //ARTICLE_STATUS
        // let tmp=[]
        // convertedEnum[singleEnumName]=[]
// console.log(`singleEnumName ${singleEnumName}`)
        convertedEnum+=`const ${singleEnumName}=[`
        for(let singleEnumItemName in fileExport[singleEnumName]){
            let value=fileExport[singleEnumName][singleEnumItemName]
// console.log(`valueInDB ${valueInDB}`)
            //console.log(`valueInDB type ${typeof valueInDB}`)
            // let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
            convertedEnum+=`"${value}",` //因为mongoose 的enum只接受String，所以通过generateMongoEnum，需要把Number转换成String(通过添加")
            // tmp.push(valueInDB)
        }
        convertedEnum+=`] `
        convertedEnum+="\r\n"
        // convertedEnum+=String.fromCharCode(10)
        // convertedEnum=`const ${singleEnumName}`
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['DB'])}`)
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['SHOW'])}`)
        exp+=indent
        exp+=singleEnumName
        exp+=`,\r\n`
    }
    exp+='}'

    return description+useStrict+convertedEnum+exp
}


function writeResult({content,resultAbsPath}){
        // console.log(`genResult ${JSON.stringify(genResult)}`)
    fs.writeFileSync(resultAbsPath,content)
}

// writeResult('../model/mongo/structure/enumValue.js')

module.exports={
    genEnumValueToArray,
}
// console.log(`${convertedEnum}`)
// console.log(`${exp}`)
// console.log(`${exp}`)
//genEnumValueToArray({fileOrDirPath:'D:/ss_vue_express/server_common/constant/enum/inputDataRuleType.js',resultDirPath:'D:/ss_vue_express/server_common/constant/genEnum/'})

