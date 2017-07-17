/**
 * Created by wzhan039 on 2017-06-16.
 * 将枚举值从DB形式，改成SHOW形式(  EventStatus: { '0': '处理中', '1': '处理完毕', '2': '拒绝' },  )
 */
"use strict";
const fs=require('fs')
const serverEnum=require('../constant/enum/mongo')
// console.log(`${JSON.stringify(serverEnum)}`)


//根据server端的enum设置，生成client端的enum定义
function genClientEnum(){
    let convetedEnum={}
    for(let singleEnumName in serverEnum){ //ARTICLE_STATUS
        if(serverEnum[singleEnumName]['SHOW']){
            convetedEnum[singleEnumName]={}
            for(let singleEnumItemName in serverEnum[singleEnumName]['DB']){
                let valueInDB=serverEnum[singleEnumName]['DB'][singleEnumItemName]
                let valueForShow=serverEnum[singleEnumName]['SHOW'][singleEnumItemName]
                convetedEnum[singleEnumName][valueInDB]=valueForShow
            }
        }

        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['DB'])}`)
        // console.log(`${JSON.stringify(serverEnum[singleEnumName]['SHOW'])}`)
    }
    return convetedEnum
}

console.log(genClientEnum())

// console.log(`${JSON.stringify(convetedEnum)}`)