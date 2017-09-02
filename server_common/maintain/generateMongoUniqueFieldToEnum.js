/**
 * Created by wzhan039 on 2017-07-13.
 * 读取model/mongo/structure下所有文件的字段，如果是unique，写入文件DB_unqiueField
 */
"use strict";
const fs=require('fs'),path=require('path'),os=require('os')

function getFileName(filePath){
    let fileName=path.basename(filePath)
    return fileName.split('.')[0]
}


//递归读取目录下的coll定义文件名称，并require js文件

function  requireCollFieldDefine(dirPath,skipFilesArray){
    let indent=`\ \ \ \ `
    let convertedEnum=''
    let exp=''

    // let skipFile=['readme.txt','enumValue.js']
    let isDir=fs.lstatSync(dirPath).isDirectory()
    if(isDir){
        let dirContent=fs.readdirSync(dirPath)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${dirPath}/${singleFileDir}`
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            if(isDir){
                convertedEnum+=`/*       ${singleFileDir}           */\r\n`
                convertedEnum+=requireCollFieldDefine(tmpFileDir,skipFilesArray).convertedEnum
                exp+=requireCollFieldDefine(tmpFileDir,skipFilesArray).exp
            }
            if(isFile){
                if(-1===skipFilesArray.indexOf(path.basename(singleFileDir))){
                    // console.log(`file ${tmpFileDir}`)
                    let fileName=getFileName(tmpFileDir)
                    // console.log(`filename ${fileName}`)
                    let key=fileName.toUpperCase()
                    // console.log(`key ${fileName}`)
                    // convertedEnum+=`${indent}${key}:'${fileName}',\r\n`
                    convertedEnum+=`const ${fileName}=require('${tmpFileDir}').collFieldDefine\r\n`
                    exp+=`${fileName},\r\n`
                    // console.log(`${convertedEnum}`)
                    // finalResult[key]=fileName
                }

            }
        }
    }
    return {convertedEnum,exp}

    // return finalResult
}

function writeMiddleResult(toBeReadDir,resultWriteFilePath,skipFilesArray){
    let description=`/*    gene by server/maintain/generateMongoFieldToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    let exp=`\r\nmodule.exports={\r\n${indent}`

    let result=requireCollFieldDefine(toBeReadDir,skipFilesArray)
    convertedEnum+=result.convertedEnum
    exp+=result.exp

    convertedEnum+=`\r\n`
    exp+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}

function generateFieldEnum(structureDir,skipFilesArray){
    // let result={}
    let indent=`\ \ \ \ `
    let convertedEnum=``
    let skipField=['cDate','uDate','dDate']
    //field定义文件产生的路径（临时文件）
    let fieldDefinePath=os.tmpdir()+'tmp.js'
    //将所有的coll文件的fieldDefine 写入一个文件
    writeMiddleResult(structureDir,fieldDefinePath,skipFilesArray)
    //引用上述文件，遍历获得所有field
    const dbFieldDefine=require(fieldDefinePath)
    for(let singleColl in dbFieldDefine){
        // if(-1===skipFilesArray.indexOf(singleColl)) {
            let dbString = `${indent}${singleColl}:[`
            let dbStringAlreadyWrite = false
            // convertedEnum+=`${indent}${singleColl.toUpperCase()}:{\r\n`
            let collFields = dbFieldDefine[singleColl]
            // console.log(`${JSON.stringify(singleColl)}`)
            // console.log(`${JSON.stringify(dbFieldDefine[singleColl])}`)
            // convertedEnum+=`${indent}${indent}ID:'id',\r\n`
            for (let singleField in collFields) {
                if (-1 === skipField.indexOf(singleField)) {
                    if (true === collFields[singleField]['unique']) {
                        if (false === dbStringAlreadyWrite) {
                            convertedEnum += dbString
                            dbStringAlreadyWrite = true
                        }
                        convertedEnum += `"${singleField}",`
                        // let singleFieldKey=singleField.replace(/([A-Z])/g,"_$1")
                        // console.log(singleField)
                        // console.log(`${singleField.toUpperCase()}:${singleField}`)
                        // convertedEnum+=`${indent}${indent}${singleFieldKey.toUpperCase()}:'${singleField}',\r\n`
                    }

                }

            }
            if (true === dbStringAlreadyWrite) {
                convertedEnum += `],\r\n`
            }
        // }
    }
    fs.unlinkSync(fieldDefinePath)
    return convertedEnum
}

function writeFinalResult(toBeReadDir,resultWriteFilePath,skipFilesArray){
    let description=`/*    gene by server/maintain/generateMongoUniqueFieldToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    // convertedEnum+=`${description}`
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    // convertedEnum+=`const Coll=require('./DB_Coll').Coll \r\n`

    convertedEnum+=`const UniqueField={\r\n`
    let exp=`\r\nmodule.exports={\r\n${indent}UniqueField,\r\n}`

    let result=generateFieldEnum(toBeReadDir,skipFilesArray)
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
// let skipFilesArray=['admin_user','admin_sugar']
/*let skipFilesArray=['readme.txt','enumValue.js','admin_user.js','admin_sugar.js']
writeFinalResult('../model/mongo/structure','../constant/enum/DB_uniqueField.js',skipFilesArray)*/

module.exports={
    writeFinalResult,
}