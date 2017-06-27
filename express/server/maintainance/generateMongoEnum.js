/**
 * Created by wzhan039 on 2017-06-16.
 */
"use strict";
const fs=require('fs')
const serverEnum=require('../constant/enum/mongo')
// console.log(`${JSON.stringify(serverEnum)}`)


let description=`/*    gene by server/maintain/generateMongoEnum     */ \r\n \r\n`
let indent=`\ \ \ \ `
let useStrict=`"use strict"\r\n`
let convertedEnum=``
let exp='module.exports={\r\n'
//根据server端的mongo.DB的enum设置，获得mongoose中对应字段enum的值
/*DB:{
    ARTICLE: 0,
        COMMENT:1,

},======>[0,1]   */
function genMongooseEnum(){
    for(let singleEnumName in serverEnum){ //ARTICLE_STATUS
        // let tmp=[]
        // convertedEnum[singleEnumName]=[]
        convertedEnum+=`const ${singleEnumName}=[`
        for(let singleEnumItemName in serverEnum[singleEnumName]['DB']){
            let valueInDB=serverEnum[singleEnumName]['DB'][singleEnumItemName]
            // let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
            convertedEnum+=`${valueInDB},`
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
}

genMongooseEnum()

// console.log(`${convertedEnum}`)
// console.log(`${exp}`)
// console.log(`${exp}`)

fs.writeFileSync('../model/mongo/structure/enumValue.js',description+useStrict+convertedEnum+exp)