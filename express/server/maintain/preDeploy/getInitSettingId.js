/**
 * Created by ada on 2017/7/26.
 * 在正式部署之前，需要预先设定一些值（例如，user_thumb存放路径，文档分类信息等）
 */
'use strict'

const common_operation_model=require('../../model/mongo/operation/common_operation_model')

const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage
const e_storePathStatus=require('../../constant/enum/mongo').StorePathStatus
const e_resourceRange=require('../../constant/enum/mongo').ResourceRange

const e_dbModel=require('../../model/mongo/dbModel')
const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const generateMongoEnumKeyValueExchange=require('../../maintain/generateMongoEnumKeyValueExchange').genMongoEnumKVExchange


const fs=require('fs')
// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})





/*          从db中读取store_path/category/resource_profile的记录，获得id并写入文件                */
/*             store path 还需要路径         */
async function generateInitSettingEnum_async(){
    let mongoEnumKVExchange=generateMongoEnumKeyValueExchange()
    let tmpResult=await common_operation_model.find({dbModel:e_dbModel.store_path,condition:{}})
    console.log(`all store path===>${tmpResult.msg}`)
    let result={}
    result[e_coll.STORE_PATH]={}

    for(let singleRecord of tmpResult.msg){
        let usage=singleRecord[e_field.STORE_PATH.USAGE]
        let name=singleRecord[e_field.STORE_PATH.NAME]
        let id=singleRecord['_id']
        let path=singleRecord[e_field.STORE_PATH.PATH]
        if( usage in mongoEnumKVExchange['StorePathUsage']){
            if(undefined===result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]]){
                result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]]={}
            }

            console.log(`store path path=========.${JSON.stringify(path)}`)
            result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]][name]=id
            result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]][name]={id:id,path:path}
        }
    }
console.log(`store path extract result =========> ${JSON.stringify(result)}`)


    result[e_coll.CATEGORY]={}
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.category,condition:{}})
    for(let singleRecord of tmpResult.msg){
        let name=singleRecord[e_field.CATEGORY.NAME]
        let objectId=singleRecord['id']
        result[e_coll.CATEGORY][name]=objectId
    }

    result[e_coll.RESOURCE_PROFILE]={}
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.resource_profile,condition:{}})
    for(let singleRecord of tmpResult.msg){
        // console.log(`single record ====>${JSON.stringify(singleRecord)}`)
        // console.log(`mongoEnumKVExchange['ResourceType'] ====>${JSON.stringify(mongoEnumKVExchange['ResourceType'])}`)

        let typeInNumber=singleRecord[e_field.RESOURCE_PROFILE.TYPE]
        // console.log(`typeInNumber ====>${JSON.stringify(typeInNumber)}`)
        let typeInKey=mongoEnumKVExchange['ResourceType'][typeInNumber]
        // console.log(`typeInKey ====>${JSON.stringify(typeInKey)}`)
        if(undefined===result[e_coll.RESOURCE_PROFILE][typeInKey]){
            result[e_coll.RESOURCE_PROFILE][typeInKey]={}
        }
        let name=singleRecord[e_field.RESOURCE_PROFILE.NAME]
        let objectId=singleRecord['id']
        result[e_coll.RESOURCE_PROFILE][typeInKey][name]=objectId
    }
    // console.log(`result is -====>${JSON.stringify(result)}`)
    return result
}

async function writeInitSettingEnum_async(destFilePath){
    let description=`/*    gene by server/maintain/generateMongoEnum     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=''
    convertedEnum+=`${description}${indent}${useStrict}`
    convertedEnum+=`const iniSettingObject={\r\n`
    let exp='module.exports={\r\n'

    let initSettingEnum=await generateInitSettingEnum_async()

    let str=JSON.stringify(initSettingEnum)
    convertedEnum+=str.replace(/^{/,'').replace(/},/g,'\r\n},\r\n').replace(/:{/g,':{\r\n').replace(/",/g,'",\r\n').replace('}}','}\r\n}')
    convertedEnum+=`\r\n`
    exp+=indent
    exp+='iniSettingObject'
    exp+=`,\r\n}`
    convertedEnum+=exp

    console.log(`convertedEnum====>${JSON.stringify(convertedEnum)}`)
    fs.writeFileSync(destFilePath,convertedEnum)

}
writeInitSettingEnum_async('../../constant/enum/initSettingObject.js')