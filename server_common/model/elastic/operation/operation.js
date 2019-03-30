/**
 * Created by 张伟 on 2019/2/19.
 * 对elastice
 */
'use strict'
const ap=require('awesomeprint')

const dataTypeCheck=require('../../../function/validateInput/validateHelper').dataTypeCheck
const esClinet=require('../common/connection').esClient;

const error=require('../../../constant/error/es/esError')
const e_arrayOperation=require('../../../constant/enum/elasticEnum').ArrayOperation
/**  检查index是否已经存在，如果存在，提示；否则直接创建
 * existThenDelete:如果已经存在，是否直接删除。默认不删除（以便用户有机会备份数据）
 * **/
async function checkIndexExistThenCreate_async({indexName,settings,mappings,existThenDelete=false}){
    let ifExist=await indexExists_async({indexName:indexName})
    if(true===ifExist){
        if(true===existThenDelete){
            await deleteIndex_async({indexName:indexName})
        }else{
            return Promise.reject(`index ${indexName} 已经存在，先删除，然后再次运行脚本`)
        }
    }

    return await createIndex_async({indexName:indexName,settings:settings,mappings:mappings})


}


async function createIndex_async({indexName,settings,mappings}){
    return esClinet.indices.create({
        "index":indexName,
        "body":{
            "settings":settings,
            "mappings":mappings,
        }
    })
}
/*更新index的mapping（例如，添加一个字段。无法删除一个字段）*/
async function updateIndexMapping_async({indexName,fieldsSetting}){
    return esClinet.indices.putMapping({
        "index":indexName,
        "type":"_doc",
        "body":{
            "properties":fieldsSetting
        }
    })
}
async function deleteIndex_async({indexName}){
    return esClinet.indices.delete({
        index:indexName
    })
}
async function indexExists_async({indexName}){
    return esClinet.indices.exists({index:indexName})
}

/** 获取index的所有设置    **/
async function getIndex_async({indexName}){
    return esClinet.indices.get({index:indexName})
}
/** 获取index的mapping设置    **/
async function getIndexMapping_async({indexName}){
    return esClinet.indices.getMapping({index:indexName})
}


async function createDoc_async({indexName,id,data}){
    return esClinet.create({
        "index":indexName,
        "type":'_doc',
        "id":id,
        body:data
    })
}

/**   更新文档（需要自己确定，是否使用script）  **/
/**     为数组操作（script）添加source   **/
/*"script":{
    "source":"ctx._source.tags.add(params.value)",
    "params":{
        "value":"newtag"
    }
},
scriptContent:"ctx._source.tags.add(params.value)",params:{"value":"test"}
*/
function generateBasicSourceForArrayOperation({operation,fieldName}){
    switch(operation){
        case e_arrayOperation.ADD:
            return `ctx._source.${fieldName}.add(params.${fieldName}.${operation})`
        case e_arrayOperation.ADD_ALL:
            return `ctx._source.${fieldName}.addAll(params.${fieldName}.${operation})`
        case e_arrayOperation.REMOVE:
            return `if(-1!==ctx._source.${fieldName}.indexOf(params.${fieldName}.${operation})){ctx._source.${fieldName}.remove(ctx._source.${fieldName}.indexOf(params.${fieldName}.${operation}))}`
        case e_arrayOperation.REMOVE_ALL:
            return `ctx._source.${fieldName}.removeAll(params.${fieldName}.${operation})`
        default:
            return error.arrayOperationError.unknownArrayOperation
    }
}

/**     根据输入的信息，产生esClient需要的source和params字段
 *  @inputArrayInfo: {fieldName:{[ADD]:value,[ADD_ALL]:[value1,value2]}}
 * **/
function generateSourceParamForArrayOperation({inputArrayInfo}){
    let generateSource='',generateParams={}
    for(let singleField in inputArrayInfo){
        for(let singleOp in inputArrayInfo[singleField]){
            if(''!==generateSource){
                generateSource+=';'
            }
            generateSource+=generateBasicSourceForArrayOperation({operation:singleOp,fieldName:singleField})

            if(undefined===generateParams[singleField]){
                generateParams[singleField]={}
            }
            generateParams[singleField][singleOp]=inputArrayInfo[singleField][singleOp]
        }
            //1 检查值是否为数组
/*            let ifArray=dataTypeCheck.isArray(inputArrayInfo[singleOp][singleField])
            if(true===ifArray){
                switch (singleOp){
                    case e_arrayOperation.ADD_ALL:

                }

            }
        }*/

    }
    return {"source":generateSource,"params":generateParams}
}
/**     数组匹配则删除整个文档     **/
/*"script":{
    "source":"""if(ctx._source.tags.contains(params.value)) {ctx.op = "delete"}""",        //kibana中测试时delete需要双引号括起
    "params":{
        "value":"newtag"
    }
},
scriptContent:"if(ctx._source.tags.contains(params.value)) { ctx.op = 'delete' }",params:{"value":"test"}       //直接传入时，可以使用单引号
*/
async function deleteArrayWhenContainValue_async({indexName,id,fieldName,value}){
    return esClinet.update({
        "index":indexName,
        "type":'_doc',
        "id":id,
        body:{
            "script":{
                "source":`if(ctx._source.${fieldName}.contains(params.value)) { ctx.op = 'delete' }`,
                "lang":"painless",
                "params":{
                    "value":value
                },
            }
        }
    })
}
/**     common update    **/
async function updateDocByScript_async({indexName,id,scriptContent,params}){
    return esClinet.update({
        "index":indexName,
        "type":'_doc',
        "id":id,
        body:{
            "script":{
                "source":scriptContent,
                "lang":"painless",
                "params":params,
            }
        }
    })
}

/**     直接更新文档字段内容    **/
async function updatePartDoc_async({indexName,id,data}){
    return esClinet.update({
        "index":indexName,
        "type":'_doc',
        "id":id,
        body:{
            "doc":data  //必须是doc
        }
    })
}
module.exports={
    checkIndexExistThenCreate_async,

    indexExists_async,
    createIndex_async,
    updateIndexMapping_async,
    getIndex_async,
    getIndexMapping_async,

    createDoc_async,

    generateSourceParamForArrayOperation,//如果字段是数组，需要将内容转换成scriptContent和params
    deleteArrayWhenContainValue_async,

    updateDocByScript_async,
    updatePartDoc_async,
}