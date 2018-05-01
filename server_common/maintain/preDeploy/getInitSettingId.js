/**
 * Created by ada on 2017/7/26.
 * 在正式部署之前，需要预先设定一些值（例如，user_thumb存放路径，文档分类信息等）
 *
 * 被express/express_admin的genCollFieldEnum调用，server_common没有使用，但是为了照顾test/db_operation_helper中的格式，还是需要产生
 */
'use strict'
// const server_common_file_require=require('../../../express/server_common_file_require')
const common_operation_model=require(`../../model/mongo/operation/common_operation_model`)//server_common_file_require.common_operation_model

const mongoEnum=require(`../../constant/enum/mongoEnum`)//server_common_file_require.mongoEnum
const e_storePathUsage=mongoEnum.StorePathUsage
const e_storePathStatus=mongoEnum.StorePathStatus
const e_resourceProfileRange=mongoEnum.ResourceProfileRange

const e_dbModel=require('../../../express/server/constant/genEnum/dbModel')
const e_coll=require('../../../express/server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../../express/server/constant/genEnum/DB_field').Field
const generateMongoEnumKeyValueExchange=require(`../generateFunction/generateMongoEnumKeyValueExchange`).genMongoEnumKVExchange//server_common_file_require.generateMongoEnumKeyValueExchange


const fs=require('fs')
// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})





/*          从db中读取store_path/category/resource_profile的记录，获得id并写入文件                */
/*             store path 还需要路径         */
async function generateInitSettingEnum_async(){
    let mongoEnumKVExchange=generateMongoEnumKeyValueExchange()
    // console.log(`mongoEnumKVExchange===>${JSON.stringify(mongoEnumKVExchange)}`)
    let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.store_path,condition:{}})
    // console.log(`all store path===>${tmpResult}`)
    let result={}
    result[e_coll.STORE_PATH]={}

    for(let singleRecord of tmpResult){
        let usage=singleRecord[e_field.STORE_PATH.USAGE]
        let name=singleRecord[e_field.STORE_PATH.NAME]
        let id=singleRecord['_id']
        let path=singleRecord[e_field.STORE_PATH.PATH]
        if( usage in mongoEnumKVExchange['StorePathUsage']){
            if(undefined===result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]]){
                result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]]={}
            }

            // console.log(`store path path=========.${JSON.stringify(path)}`)
            result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]][name]=id
            result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]][name]={id:id,path:path}
        }
    }
// console.log(`store path extract result =========> ${JSON.stringify(result)}`)


    result[e_coll.CATEGORY]={}
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.category,condition:{}})
    for(let singleRecord of tmpResult){
        let name=singleRecord[e_field.CATEGORY.NAME]
        let objectId=singleRecord['id']
        result[e_coll.CATEGORY][name]=objectId
    }
// console.log(`CATEGORY extract result =========> ${JSON.stringify(result[e_coll.CATEGORY])}`)

    result[e_coll.RESOURCE_PROFILE]={}
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:{}})
    for(let singleRecord of tmpResult){
        // console.log(`single record ====>${JSON.stringify(singleRecord)}`)
        // console.log(`mongoEnumKVExchange['ResourceType'] ====>${JSON.stringify(mongoEnumKVExchange['ResourceType'])}`)

        let typeInNumber=singleRecord[e_field.RESOURCE_PROFILE.TYPE]
        // console.log(`typeInNumber ====>${JSON.stringify(typeInNumber)}`)
        let typeInKey=mongoEnumKVExchange.ResourceProfileType[typeInNumber]
        // console.log(`typeInKey ====>${JSON.stringify(typeInKey)}`)
        if(undefined===result[e_coll.RESOURCE_PROFILE][typeInKey]){
            result[e_coll.RESOURCE_PROFILE][typeInKey]={}
        }
        let name=singleRecord[e_field.RESOURCE_PROFILE.NAME]
        let objectId=singleRecord['id']
        result[e_coll.RESOURCE_PROFILE][typeInKey][name]=objectId
    }
// console.log(`e_coll.RESOURCE_PROFILE extract result =========> ${JSON.stringify(result[e_coll.RESOURCE_PROFILE])}`)
//     console.log(`result is -====>${JSON.stringify(result)}`)
    return Promise.resolve(result)
}

async function writeInitSettingEnum_async(destFileDir){
    let description=`/*    gene by server/maintain/getInitSettingId     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=''
    convertedEnum+=`${description}${indent}${useStrict}`
    convertedEnum+=`const iniSettingObject={\r\n`
    let exp='module.exports={\r\n'
    // console.log(`atart generateInitSettingEnum_async====>`)
    let initSettingEnum=await generateInitSettingEnum_async()

    let str=JSON.stringify(initSettingEnum)
    convertedEnum+=str.replace(/^{/,'').replace(/},/g,'\r\n},\r\n').replace(/:{/g,':{\r\n').replace(/",/g,'",\r\n').replace('}}','}\r\n}')
    convertedEnum+=`\r\n`
    exp+=indent
    exp+='iniSettingObject'
    exp+=`,\r\n}`
    convertedEnum+=exp

    // console.log(`convertedEnum====>${JSON.stringify(convertedEnum)}`)
    fs.writeFileSync(destFileDir+'initSettingObject.js',convertedEnum)
    return Promise.resolve({rc:0})
}

/*writeInitSettingEnum_async('../../constant/enum/initSettingObject.js').then(
    (result)=>{console.log(`result is ${JSON.stringify(result)}`)},
    (err)=>{console.log(`err is ${JSON.stringify(err)}`)},
)*/

module.exports={
    writeInitSettingEnum_async,
}