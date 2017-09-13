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


//递归读取目录下的coll定义文件名称，并require js文件

function  requireCollDbModel(dirPath,skipFilesArray){
    let indent=`\ \ \ \ `
    let convertedEnum=''
    let exp=''


    let isDir=fs.lstatSync(dirPath).isDirectory()
    if(isDir){
        let dirContent=fs.readdirSync(dirPath)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${dirPath}${singleFileDir}`
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()
            // console.log(`${tmpFileDir}`)
            if(isDir){
                convertedEnum+=`/*       ${singleFileDir}           */\r\n`
                convertedEnum+=requireCollDbModel(tmpFileDir+'/',skipFilesArray).convertedEnum
                exp+=`${indent}/*       ${singleFileDir}           */\r\n`
                exp+=requireCollDbModel(tmpFileDir+'/',skipFilesArray).exp
            }
            if(isFile){
                if(-1===skipFilesArray.indexOf(path.basename(singleFileDir))){
                    // console.log(`file ${tmpFileDir}`)
                    let fileName=getFileName(tmpFileDir)
                    // console.log(`filename ${fileName}`)
                    let key=fileName.toUpperCase()
                    // console.log(`key ${fileName}`)
                    // convertedEnum+=`${indent}${key}:'${fileName}',\r\n`
                    convertedEnum+=`const ${fileName}=require('${tmpFileDir}').collModel\r\n`
                    exp+=`${indent}${fileName},\r\n`
                    // console.log(`${convertedEnum}`)
                    // finalResult[key]=fileName
                }

            }
        }
    }
    convertedEnum=convertedEnum.replace(/\.\.\/model\/mongo\/structure/g,'./structure')
    return {convertedEnum,exp}

    // return finalResult
}

function writeModelResult(toBeReadDir,resultWriteFilePath,skipFilesArray){
    let description=`/*    gene by server/maintain/generateMongoDbModelToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    let exp=`\r\nmodule.exports={\r\n`

    let result=requireCollDbModel(toBeReadDir,skipFilesArray)
    convertedEnum+=result.convertedEnum
    exp+=result.exp

    convertedEnum+=`\r\n`
    exp+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}

function writeModelInArrayResult(toBeReadDir,resultWriteFilePath,skipFilesArray){
    let description=`/*    gene by server/maintain/generateMongoDbModelToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    let exp=`\r\nmodule.exports=[\r\n`

    let result=requireCollDbModel(toBeReadDir,skipFilesArray)
    convertedEnum+=result.convertedEnum
    exp+=result.exp

    // convertedEnum+=`\r\n`
    exp+=`]\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}


// writeModelResult('../model/mongo/structure','../constant/enum/test.js')
// generateFieldEnum()


/*let skipFilesArray=['readme.txt','enumValue.js','admin_user.js','admin_sugar.js']
writeModelResult('../model/mongo/structure','../model/mongo/dbModel.js',skipFilesArray)
writeModelInArrayResult('../model/mongo/structure','../model/mongo/dbModelInArray.js',skipFilesArray)*/

module.exports={
    writeModelResult,
    writeModelInArrayResult,
}