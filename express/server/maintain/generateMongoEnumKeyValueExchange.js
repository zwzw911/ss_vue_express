/**
 * Created by ada on 2017-06-16.
 * 将枚举值中DB的value<====>key互换，
 */
"use strict";
const fs=require('fs')
const serverEnum=require('../constant/enum/mongo')
// console.log(`${JSON.stringify(serverEnum)}`)


//根据server端的enum设置，生成client端的enum定义
function genMongoEnumKVExchange(){
    let convetedEnum={}
    for(let singleEnumName in serverEnum){ //ARTICLE_STATUS
/*        if(serverEnum[singleEnumName]['SHOW']){
            convetedEnum[singleEnumName]={}
            for(let singleEnumItemName in serverEnum[singleEnumName]['DB']){
                let valueInDB=serverEnum[singleEnumName]['DB'][singleEnumItemName]
                let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
                convetedEnum[singleEnumName][valueInDB]=valueForShow
            }
        }*/
        if(serverEnum[singleEnumName]['DB']){
            convetedEnum[singleEnumName]={}
            for(let singleEnumItemName in serverEnum[singleEnumName]['DB']){
                let valueInDB=serverEnum[singleEnumName]['DB'][singleEnumItemName]
                // let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
                convetedEnum[singleEnumName][valueInDB]=singleEnumItemName
            }
        }
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['DB'])}`)
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['SHOW'])}`)
    }
    return convetedEnum
}

// console.log(genClientEnum())

module.exports={
    genMongoEnumKVExchange,
}
// console.log(`${JSON.stringify(convetedEnum)}`)