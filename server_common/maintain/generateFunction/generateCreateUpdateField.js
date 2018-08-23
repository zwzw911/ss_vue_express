/**
 * Created by 张伟 on 2018/8/19.
 * 根据browseInputRule，为每个coll生成可以在创建中使用的字符
 * 必须在genenreateAllRuleInOneFile后执行
 */
'use strict'

const fs=require('fs')
const path=require('path')
const ap=require('awesomeprint')

const file=require('../../function/assist/file')

const e_applyRange=require('../../constant/enum/inputDataRuleType').ApplyRange
/**     主函数         **/
function generateCreateField({browserInputRuleFileAbsPath,resultFileAbsPath}){
    let expectedApplyRange=[e_applyRange.CREATE]
    let expectedField=generateContent({browserInputRuleFileAbsPath:browserInputRuleFileAbsPath,expectedApplyRange:expectedApplyRange})
    writeResult({expectedField:expectedField,resultFileAbsPath:resultFileAbsPath,expectedApplyRange:expectedApplyRange})
}
function generateUpdateField({browserInputRuleFileAbsPath,resultFileAbsPath}){
    let expectedApplyRange=[e_applyRange.UPDATE_ARRAY,e_applyRange.UPDATE_SCALAR]
    let expectedField=generateContent({browserInputRuleFileAbsPath:browserInputRuleFileAbsPath,expectedApplyRange:expectedApplyRange})
    writeResult({expectedField:expectedField,resultFileAbsPath:resultFileAbsPath,expectedApplyRange:expectedApplyRange})
}

/**     读取文件内容，并提取需要的内容      **/
function generateContent({browserInputRuleFileAbsPath,expectedApplyRange}){
    let fileContent=file.readFileExportItem({absFilePath:browserInputRuleFileAbsPath}).browserInputRule
// ap.inf('fileContent',fileContent)
    let expectedField={}
    for(let singleColl in fileContent){
        expectedField[singleColl]=[]
        for(let singleField in fileContent[singleColl]){
            // ap.inf('fileContent[singleColl][singleField]',fileContent[singleColl][singleField])
            // ap.inf('fileContent[singleColl][singleField][\'applyRange\']',fileContent[singleColl][singleField]['applyRange'])
            if(fileContent[singleColl][singleField]['applyRange']){
                for(let singleExpectedApplyRange of expectedApplyRange){
                    if(-1!==fileContent[singleColl][singleField]['applyRange'].indexOf(singleExpectedApplyRange)){
                        expectedField[singleColl].push(singleField)
                    }
                }
            }
        }
    }
    return expectedField
}

function writeResult({expectedField,resultFileAbsPath,expectedApplyRange}){
    let indent=`\ \ \ \ `
    let expItem

    for(let singleExpectedApplyRange of expectedApplyRange){
        if(singleExpectedApplyRange===e_applyRange.CREATE){
            expItem='createField'
            break;
        }
        if(singleExpectedApplyRange===e_applyRange.UPDATE_SCALAR || singleExpectedApplyRange===e_applyRange.UPDATE_ARRAY){
            expItem='updateField'
            break;
        }
    }

    let description=`/*    gene by server/maintain/generateCreateUpdateField     */ \r\n \r\n`
    let useStrict=`"use strict"\r\n`
    let exp='module.exports={\r\n'
    exp+=`${indent}${expItem},\r\n`
    exp+=`}\r\n`


    let convertedResult=`const createField={\r\n`
    // convertedResult+=`${description}${useStrict}${exp}`
    for(let singleColl in expectedField){
        convertedResult+=`${indent}'${singleColl}':${JSON.stringify(expectedField[singleColl])},\r\n`
    }
    convertedResult+=`}\r\n`


    fs.writeFileSync(resultFileAbsPath,`${description}${useStrict}${convertedResult}${exp}`)

}

module.exports={
    generateCreateField,
    generateUpdateField,
}

