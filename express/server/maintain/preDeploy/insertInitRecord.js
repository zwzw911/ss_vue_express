/**
 * Created by ada on 2017/7/26.
 * 在正式部署之前，需要预先设定一些值（例如，user_thumb存放路径，文档分类信息等）
 */
'use strict'

const common_operation_model=require('../../model/mongo/operation/common_operation_model')

const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage
const e_storePathStatus=require('../../constant/enum/mongo').StorePathStatus
const e_resourceRange=require('../../constant/enum/mongo').ResourceRange
const e_resourceType=require('../../constant/enum/mongo').ResourceType

const e_dbModel=require('../../model/mongo/dbModel')
const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const generateMongoEnumKeyValueExchange=require('../../maintain/generateMongoEnumKeyValueExchange').genMongoEnumKVExchange


const fs=require('fs')
// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})

const initSetting= {
    storePath: {
        tmpUploadDir: [{name: 'upload_tmp_dir', path: 'H:/ss_vue_express/test_data/tmp/'}],//所有上传文件临时存储位置
        user: {
            USER_PHOTO: [
                {name: 'userPhotoStorePath1', path: 'H:/ss_vue_express/test_data/userPhoto/dest/'},
                {name: 'userPhotoStorePath2', path: 'H:/ss_vue_express/test_data/userPhoto/dest1/'}
            ],//头像存放最终路径
        },
        article: {
            ARTICLE_INNER_IMAGE: [
                {name: 'articleImage1', path: 'H:/ss_vue_express/test_data/article_image/'}
            ],
            ARTICLE_INNER_ATTACHMENT: [
                {name: 'articleAttachment1', path: 'H:/ss_vue_express/test_data/article_attachment/'},
            ],
        },
    },
    category: {
        other: 'other',
        LTE_A: 'LTE_A',
    },
    resource_profile: [
        {
            [e_field.RESOURCE_PROFILE.NAME]:"普通用户文档资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceRange.DB.PER_ARTICLE,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceType.DB.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:10,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:20, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"普通用户总体资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceRange.DB.PER_PERSON,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceType.DB.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:1000,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:2000, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"升级用户文档资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceRange.DB.PER_ARTICLE,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceType.DB.ADVANCED,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:100,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:200, //假设每个文件大小为200M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"升级用户总体资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceRange.DB.PER_PERSON,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceType.DB.ADVANCED,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:1000,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:2000, //假设每个文件大小为2000M
        },
    ],

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




// console.log(`in=======>`)
console.log(`${JSON.stringify(initSetting.resource_profile)}`)
let resourceProfileDocs=[]
//init use category
for(let singleItem of initSetting.resource_profile){
    resourceProfileDocs.push(singleItem)
}
console.log(`resourceProfileDocs====》${JSON.stringify(resourceProfileDocs)}`)
common_operation_model.insertMany({dbModel:e_dbModel.resource_profile,docs:resourceProfileDocs}).then(
    (v)=>{console.log(`success====>${JSON.stringify(v)}`)},
    (e)=>{console.log(`err====>${JSON.stringify(e)}`)}
)



