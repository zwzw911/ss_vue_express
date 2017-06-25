/**
 * Created by wzhan039 on 2017-06-16.
 */
"use strict";
const fs=require('fs')
const serverEnum=require('../constant/enum/mongo')
console.log(`${JSON.stringify(serverEnum)}`)

let convetedEnum={}
//根据server端的enum设置，生成client端的enum定义
function genClientEnum(){
    for(let singleEnumName in serverEnum){ //ARTICLE_STATUS
        convetedEnum[singleEnumName]={}
        for(let singleEnumItemName in serverEnum[singleEnumName]['DB']){
            let valueInDB=serverEnum[singleEnumName]['DB'][singleEnumItemName]
            let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
            convetedEnum[singleEnumName][valueInDB]=valueForShow
        }
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['DB'])}`)
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['SHOW'])}`)
    }

}

genClientEnum()

// console.log(`${JSON.stringify(convetedEnum)}`)