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

function  requireCollDbModel(dirPath){
    let indent=`\ \ \ \ `
    let convertedEnum=''
    let exp=''

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
                convertedEnum+=`/*       ${singleFileDir}           */\r\n`
                convertedEnum+=requireCollDbModel(tmpFileDir).convertedEnum
                exp+=`${indent}/*       ${singleFileDir}           */\r\n`
                exp+=requireCollDbModel(tmpFileDir).exp
            }
            if(isFile){
                if(-1===skipFile.indexOf(path.basename(singleFileDir))){
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

function writeModelResult(toBeReadDir,resultWriteFilePath){
    let description=`/*    gene by server/maintain/generateMongoDbModelToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    let exp=`\r\nmodule.exports={\r\n`

    let result=requireCollDbModel(toBeReadDir)
    convertedEnum+=result.convertedEnum
    exp+=result.exp

    convertedEnum+=`\r\n`
    exp+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}

function writeModelInArrayResult(toBeReadDir,resultWriteFilePath){
    let description=`/*    gene by server/maintain/generateMongoDbModelToEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    let exp=`\r\nmodule.exports=[\r\n`

    let result=requireCollDbModel(toBeReadDir)
    convertedEnum+=result.convertedEnum
    exp+=result.exp

    // convertedEnum+=`\r\n`
    exp+=`]\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}
/*function generateFieldEnum(structureDir,destFilePath){
    // let result={}
    let indent=`\ \ \ \ `
    let convertedEnum=``
    let skipField=['cDate','uDate','dDate']
    //field定义文件产生的路径（临时文件）
    let fieldDefinePath='./tmp.js'
    //将所有的coll文件的fieldDefine 写入一个文件
    writeModelResult(structureDir,fieldDefinePath)
    //引用上述文件，遍历获得所有field
    const dbFieldDefine=require(fieldDefinePath)
    for(let singleColl in dbFieldDefine){

        convertedEnum+=`${indent}${singleColl.toUpperCase()}:{\r\n`
        let collFields=dbFieldDefine[singleColl]
        // console.log(`${JSON.stringify(singleColl)}`)
        // console.log(`${JSON.stringify(dbFieldDefine[singleColl])}`)
        convertedEnum+=`${indent}${indent}ID:'id',\r\n`
        for(let singleField in collFields){
            if(-1===skipField.indexOf(singleField)){
                let singleFieldKey=singleField.replace(/([A-Z])/g,"_$1")
                // console.log(singleField)
                // console.log(`${singleField.toUpperCase()}:${singleField}`)
                convertedEnum+=`${indent}${indent}${singleFieldKey.toUpperCase()}:'${singleField}',\r\n`
            }

        }
        convertedEnum+=`${indent}},\r\n`
    }
    fs.unlinkSync(fieldDefinePath)
    return convertedEnum
}

function writeFinalResult(toBeReadDir,resultWriteFilePath){
    let description=`/!*    gene by server/maintain/generateMongoFieldToEnum     *!/ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=``
    convertedEnum+=`${description}${indent}${useStrict}\r\n`
    convertedEnum+=`const Coll=require('./DB_Coll').Coll \r\n`

    convertedEnum+=`const Field={\r\n`
    let exp=`\r\nmodule.exports={\r\n${indent}Field,\r\n}`

    let result=generateFieldEnum(toBeReadDir,resultWriteFilePath)
    convertedEnum+=result
    // exp+=result.exp

    convertedEnum+=`}\r\n`
    // exp+=`}\r\n`
    fs.writeFileSync(resultWriteFilePath,`${convertedEnum}${exp}`)
}*/

// let convertedEnum=''
// console.log(getFileName('H:/ss_vue_express/express/server/model/mongo/structure/admin/admin_user.js').toUpperCase())
// getFileNameInFolder('H:/ss_vue_express/express/server/model/mongo/structure/',finalResult)
// console.log(JSON.stringify(finalResult))

// writeModelResult('../model/mongo/structure','../constant/enum/test.js')
// generateFieldEnum()
writeModelResult('../model/mongo/structure','../model/mongo/dbModel.js')
writeModelInArrayResult('../model/mongo/structure','../model/mongo/dbModelInArray.js')
module.exports={
    getFileName
}