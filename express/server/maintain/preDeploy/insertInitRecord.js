/**
 * Created by ada on 2017/7/26.
 * 在正式部署之前，需要预先设定一些值（例如，user_thumb存放路径，文档分类信息等）
 */
'use strict'

const common_operation_model=require('../../model/mongo/operation/common_operation_model')
const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage
const e_storePathStatus=require('../../constant/enum/mongo').StorePathStatus
const e_dbModel=require('../../model/mongo/dbModel')
const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const generateMongoEnumKeyValueExchange=require('../../maintain/generateMongoEnumKeyValueExchange').genMongoEnumKVExchange


const fs=require('fs')
// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})

const initSetting={
    storePath:{
        tmpUploadDir:[{name:'upload_tmp_dir',path:'H:/ss_vue_express/test_data/tmp/'}],//所有上传文件临时存储位置
        user:{
            USER_PHOTO:[
                {name:'userPhotoStorePath1',path:'H:/ss_vue_express/test_data/userPhoto/dest/'},
                {name:'userPhotoStorePath2',path:'H:/ss_vue_express/test_data/userPhoto/dest1/'}
                ],//头像存放最终路径
        },
        article:{
            ARTICLE_INNER_IMAGE:[
                {name:'articleImage1',path:'H:/ss_vue_express/test_data/article_image/'}
            ],
            ARTICLE_INNER_ATTACHMENT:[
                {name:'articleAttachment1',path:'H:/ss_vue_express/test_data/article_attachment/'},
            ],
        },
    },
    category:{
        other:'other',
        LTE_A:'LTE_A',
    },

}

let storePathDocs=[]

for(let firstLevel in initSetting.storePath){
    if('tmpUploadDir'===firstLevel){
        for(let idx in initSetting.storePath[firstLevel]){
            storePathDocs.push({name:initSetting.storePath[firstLevel][idx]['name'],path:initSetting.storePath[firstLevel][idx]['path'],usage:e_storePathUsage.DB.UPLOAD_TMP,lowThreshold:70,highThreshold:90,size:2*1000,usedSize:0,status:e_storePathStatus.DB.READ_WRITE})
        }
    }else{
        for(let secondLevel in initSetting.storePath[firstLevel]){
            let usage=e_storePathUsage.DB[secondLevel]
            for(let singleEle of initSetting.storePath[firstLevel][secondLevel]){
                let name=singleEle['name']
                let path=singleEle['path']
                storePathDocs.push({name:name,path:path,usage:usage,lowThreshold:70,highThreshold:90,size:2*1000,usedSize:0,status:e_storePathStatus.DB.READ_WRITE})
            }
        }
    }
}

console.log(`storePathDocs====>${JSON.stringify(storePathDocs)}`)
common_operation_model.insertMany({dbModel:e_dbModel.store_path,docs:storePathDocs}).then(
    (v)=>{console.log(`success====>${JSON.stringify(v)}`)},
    (e)=>{console.log(`err====>${JSON.stringify(e)}`)}
)


console.log(`${JSON.stringify(initSetting.category)}`)
let categoryDocs=[]
//init use category
for(let singleCategory of Object.values(initSetting.category)){
    categoryDocs.push({name:`${singleCategory}`})
}
console.log(`${JSON.stringify(categoryDocs)}`)
common_operation_model.insertMany({dbModel:e_dbModel.category,docs:categoryDocs}).then(
    (v)=>{console.log(`success====>${JSON.stringify(v)}`)},
    (e)=>{console.log(`err====>${JSON.stringify(e)}`)}
)


/*          从db中读取store_path/category的记录，获得id并写入文件                */
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
        if( usage in mongoEnumKVExchange['StorePathUsage']){
            if(undefined===result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]]){
                result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]]={}
            }

            result[e_coll.STORE_PATH][mongoEnumKVExchange['StorePathUsage'][usage]][name]=id
        }
    }



    result[e_coll.CATEGORY]={}
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.category,condition:{}})
    for(let singleRecord of tmpResult.msg){
        let name=singleRecord[e_field.CATEGORY.NAME]
        let objectId=singleRecord['id']
        result[e_coll.CATEGORY][name]=objectId
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
    convertedEnum+=`const iniSettingObjectId={\r\n`
    let exp='module.exports={\r\n'

    let initSettingEnum=await generateInitSettingEnum_async()

    let str=JSON.stringify(initSettingEnum)
    convertedEnum+=str.replace(/^{/,'').replace(/},/g,'\r\n},\r\n').replace(/:{/g,':{\r\n').replace(/",/g,'",\r\n').replace('}}','}\r\n}')
    convertedEnum+=`\r\n`
    exp+=indent
    exp+='iniSettingObjectId'
    exp+=`,\r\n}`
    convertedEnum+=exp

    console.log(`convertedEnum====>${JSON.stringify(convertedEnum)}`)
    fs.writeFileSync(destFilePath,convertedEnum)

}
writeInitSettingEnum_async('../../constant/enum/initSettingObject.js')