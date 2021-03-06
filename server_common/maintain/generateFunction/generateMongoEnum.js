/**
 * Created by wzhan039 on 2017-06-16.
 * 读取 constant/enum/mongo 中数据，将DB中的数据组合到一个array中，以便给mongoose的field的enum定义
 */
"use strict";
const fs=require('fs')

// console.log(`${JSON.stringify(serverEnum)}`)



//根据server端的mongo.DB的enum设置，获得mongoose中对应字段enum的值
/*DB:{
    ARTICLE: 0,
        COMMENT:1,

},======>[0,1]   */
function genMongooseEnum(mongoEnumDir){
    const serverEnum=require(`${mongoEnumDir}mongoEnum`)
    // console.log(`genMongooseEnum serverEnum ${mongoEnumDir}mongoEnum`)
    let exp='module.exports={\r\n'
    let indent=`\ \ \ \ `
    let convertedEnum=``
    for(let singleEnumName in serverEnum){ //ARTICLE_STATUS
        // let tmp=[]
        // convertedEnum[singleEnumName]=[]
// console.log(`singleEnumName ${singleEnumName}`)
        convertedEnum+=`const ${singleEnumName}=[`
        for(let singleEnumItemName in serverEnum[singleEnumName]['DB']){
            let valueInDB=serverEnum[singleEnumName]['DB'][singleEnumItemName]
// console.log(`valueInDB ${valueInDB}`)
            //console.log(`valueInDB type ${typeof valueInDB}`)
            // let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
            convertedEnum+=`"${valueInDB}",` //因为mongoose 的enum只接受String，所以通过generateMongoEnum，需要把Number转换成String(通过添加")
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

    return {convertedEnum:convertedEnum,exp:exp}
}

// genMongooseEnum()

function writeResult(mongoEnumDir,resultWriteFilePath){
    let description=`/*    gene by server/maintain/generateMongoEnum     */ \r\n \r\n`

    let useStrict=`"use strict"\r\n`
    let genResult=genMongooseEnum(mongoEnumDir)
    // console.log(`genResult ${JSON.stringify(genResult)}`)
    fs.writeFileSync(resultWriteFilePath,description+useStrict+genResult.convertedEnum+genResult.exp)
}

// writeResult('../model/mongo/structure/enumValue.js')

module.exports={
    writeResult,
}
// console.log(`${convertedEnum}`)
// console.log(`${exp}`)
// console.log(`${exp}`)

