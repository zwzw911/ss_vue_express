/**
 * Created by 张伟 on 2019/2/20.
 */
'use strict'
const ap=require('awesomeprint')
const dataType=require('../../../function/assist/dataType')
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const dbModel=require('../../../constant/genEnum/dbModel')
const e_field=require('../../../constant/genEnum/DB_field').Field
const common_operation_model=require('../../mongo/operation/common_operation_model')

const esArticleFieldDefinition=require('../structure/article').indexParam.mappings['_doc']['properties']
/** 从API中获得的mapping数据中，抽取出字段及其定义（供js使用）    **/
function extractField({indexName,apiMappingResult}){
    // let origFieldsResult=apiMappingResult[indexName]['mappings']['_doc']['properties']
/*    let extractResult={}
    if(Object.keys(origFieldsResult).length>0){
        for(let singleFieldName in origFieldsResult){
            //判断field的类型是否为object（是否有properties），如果是，去除properties
            if(undefined!==origFieldsResult[singleFieldName] && undefined!==origFieldsResult[singleFieldName]['properties']){
                extractResult[singleFieldName]=origFieldsResult[singleFieldName]['properties']
            }else{
                extractResult[singleFieldName]=origFieldsResult[singleFieldName]
            }
        }
    }
    return extractResult*/
    return apiMappingResult[indexName]['mappings']['_doc']['properties']
}

/** 将mongodb的数据转换成es的数据，以便存入es
 * @:
 * **/
async function convertMongoDataToEsData_async({collName,mongoData}){
    // ap.inf('collName',collName)
    // ap.inf('mongoData',mongoData)
    let convertedData={}
    let fieldsShouldConvert //在mongo中为objectId,到es需要展开。格式为{fieldName:refDbModel}，以便mongo通过Id直接查询
    let esFieldDefinition
    switch (collName){
        case 'article':
            fieldsShouldConvert={[e_field.ARTICLE.AUTHOR_ID]:dbModel.user}
            esFieldDefinition=esArticleFieldDefinition
            break;
    }

    let esFieldsName=Object.keys(esFieldDefinition)
    for(let singleFieldName of esFieldsName){
        //如果es中某个字段，在mongo中是objectId，但是在es需要扩展（成object）
        if(undefined!==fieldsShouldConvert[singleFieldName]){
            let refDbModel=fieldsShouldConvert[singleFieldName]
            // ap.inf('singleFieldName',singleFieldName)
            // ap.inf('refDbModel',refDbModel.collName())
            let esNeededField=esFieldDefinition[singleFieldName]['properties']
            // ap.inf('esNeededField',esNeededField)
            let selectedFields=Object.keys(esNeededField).concat(' ')
            // ap.inf('selectedFields',selectedFields)
            let result=await common_operation_model.findById_returnRecord_async({dbModel:refDbModel,id:mongoData[singleFieldName],selectedFields:selectedFields})
            if(null!==result){
                // ap.inf('result',result)
                result=result.toObject()
                delete result['id']
                delete result['_id']
            }

            convertedData[singleFieldName]=result
        }
        //否则，mongo中非objectId字段，直接赋值非es
        else{
            convertedData[singleFieldName]=mongoData[singleFieldName]
        }
    }
    return Promise.resolve(convertedData)
}

convertMongoDataToEsData_async({collName:e_coll.ARTICLE,mongoData:{'authorId':'5c6cd75ead8443f6103b7fcb'},esFieldDefinition:esArticleFieldDefinition}).then(
    function(res){
        ap.inf('result',res)
    }
)

module.exports={
    extractField,
    convertMongoDataToEsData_async,
}