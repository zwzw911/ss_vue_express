/**
 * Created by wzhan039 on 2017-07-13.
 * 读取model/mongo/structure下文件的名称，将它们写入到enum文件中
 */
"use strict";
const fs=require('fs'),path=require('path')

function getFileName(filePath){
    let fileName=path.basename(filePath)
    return fileName.split('.')[0]
}


//递归读取目录下的coll定义文件名称，并返回键值对的字符串

function getFileNameInFolder(dirPath){
    let indent=`\ \ \ \ `
    let convertedEnum=''
    let skipFile=['readme.txt','enumValue.js']
    let isDir=fs.lstatSync(dirPath).isDirectory()
    if(isDir){
        let dirContent=fs.readdirSync(dirPath)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${dirPath}/${singleFileDir}`
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            if(isDir){
                convertedEnum+=`${indent}/*       ${singleFileDir}           */\r\n`
                convertedEnum+=getFileNameInFolder(tmpFileDir)
            }
            if(isFile){
                if(-1===skipFile.indexOf(path.basename(singleFileDir))){
                    // console.log(`file ${tmpFileDir}`)
                    let fileName=getFileName(tmpFileDir)
                    // console.log(`filename ${fileName}`)
                    let key=fileName.toUpperCase()
                    // console.log(`key ${fileName}`)

                    convertedEnum+=`${indent}${key}:'${fileName}',\r\n`
                    // finalResult[key]=fileName
                }

            }
        }
    }
    return convertedEnum

    // return finalResult
}

function writeResult(toBeReadDir,resultWriteFilePath){
    let description=`/*    gene by server/maintain/generateMongoCollToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}const Coll={\r\n`
    let exp=`\r\nmodule.exports={\r\n${indent}Coll,\r\n}`


    convertedEnum+=getFileNameInFolder(toBeReadDir)
    convertedEnum+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}


// let convertedEnum=''
// console.log(getFileName('H:/ss_vue_express/express/server/model/mongo/structure/admin/admin_user.js').toUpperCase())
// getFileNameInFolder('H:/ss_vue_express/express/server/model/mongo/structure/',finalResult)
// console.log(JSON.stringify(finalResult))

writeResult('../model/mongo/structure','../constant/enum/DB_Coll.js')


module.exports={
    getFileName
}