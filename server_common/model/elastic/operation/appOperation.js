/**
 * Created by 张伟 on 2019/2/19.
 * 初始化创建index
 */
'use strict'
const ap=require('awesomeprint')
const esOperation=require('./operation')
const converter=require('../common/converter')
const article=require('../structure/article').indexParam

let allIndices=[article]

async function createAllIndex_async(){
    for(let singleIndexParam of allIndices){
        let indexName=singleIndexParam.indexName
        await esOperation.checkIndexExistThenCreate_async({
            indexName:singleIndexParam.indexName,
            settings:singleIndexParam.settings,
            mappings:singleIndexParam.mappings,
            existThenDelete:true
        }) //如果index已经存在，直接删除

        /**     temp: function test     **/
        await esOperation.createDoc_async({indexName:indexName,id:1,data:{"name":"old","tags":["t1"]}})

        /*let op={
            "tags":{
                "add":"addNewValue",
                "addAll":["addNewArrayValue"],
                "remove":"t1"
            }
        }
        let {source,params}=esOperation.generateSourceParamForArrayOperation({inputArrayInfo:op})
        await esOperation.updateDocByScript_async({indexName:indexName,id:1,scriptContent:source,params:params})
        */

        // await esOperation.updatePartDoc_async({indexName:indexName,id:1,data:{"name":"new"}})


        // await esOperation.getIndexMapping_async({indexName:singleIndexParam.indexName})
        // result=await esOperation.updateIndexMapping_async({indexName:singleIndexParam.indexName,fieldsSetting:{"newfield":{"type":"text"}}})
        /**     temp: function test end    **/

    }
}

async function mongoDataToEsForCreate_async({collName,mongoData}){
    let convertedResult=await converter.convertMongoDataToEsData_async({collName:collName,mongoData:mongoData})
    // ap.wrn('convertedResult',convertedResult)
    await esOperation.createDoc_async({indexName:collName,id:mongoData['id'],data:convertedResult})
}

/**     更新分成2部分(数组使用script，其他使用part)     **/
async function mongoDataToEsForUpdate_async({collName,mongoData}){
    let convertedResult=await converter.convertMongoDataToEsData_async({collName:collName,mongoData:mongoData})
    // ap.wrn('convertedResult',convertedResult)
    for(let singleField of convertedResult){

    }
    await esOperation.createDoc_async({indexName:collName,id:mongoData['id'],data:convertedResult})
}
/*createAllIndex_async().then(
    function (res) {
        ap.inf('create index article done with result',res)

    },
    function(err){
        // if(false===err){
            ap.err(err)
        // }

    }
)*/

module.exports={
    createAllIndex_async,
    mongoDataToEsForCreate_async,
}