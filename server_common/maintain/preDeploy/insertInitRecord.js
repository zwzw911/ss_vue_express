/**
 * Created by ada on 2017/7/26.
 * 在正式部署之前，需要预先设定一些值（例如，user_thumb存放路径，文档分类信息等）
 */
'use strict'

const common_operation_model=require('../../model/mongo/operation/common_operation_model')

const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage.DB
const e_storePathStatus=require('../../constant/enum/mongo').StorePathStatus.DB
const e_resourceProfileRange=require('../../constant/enum/mongo').ResourceProfileRange
const e_resourceProfileType=require('../../constant/enum/mongo').ResourceProfileType

const e_dbModel=require('../../model/mongo/dbModel')
const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const generateMongoEnumKeyValueExchange=require('../../maintain/generateMongoEnumKeyValueExchange').genMongoEnumKVExchange


const fs=require('fs')
// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})

const initSetting= {
    storePath: {
        tmpDir:{
            tmpUploadDir: [
                {
                    [e_field.STORE_PATH.NAME]: 'upload_tmp_dir',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/tmp/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.UPLOAD_TMP,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ]
        },//所有上传文件临时存储位置
        user: {
            USER_PHOTO: [
                {
                    [e_field.STORE_PATH.NAME]: 'userPhotoStorePath1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/userPhoto/dest/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.USER_PHOTO,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
                {
                    [e_field.STORE_PATH.NAME]: 'userPhotoStorePath2',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/userPhoto/dest1/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.USER_PHOTO,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],//头像存放最终路径
        },
        article: {
            ARTICLE_INNER_IMAGE: [
                {
                    [e_field.STORE_PATH.NAME]: 'articleImage1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/article_image/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.ARTICLE_INNER_IMAGE,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],
            ARTICLE_INNER_ATTACHMENT: [
                {
                    [e_field.STORE_PATH.NAME]: 'articleAttachment1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/article_attachment/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.ARTICLE_INNER_ATTACHMENT,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],
        },
        impeach:{
            IMPEACH_IMAGE:[
                {
                    [e_field.STORE_PATH.NAME]: 'impeachImage1',
                    [e_field.STORE_PATH.PATH]: 'H:/ss_vue_express/test_data/impeach_image/',
                    [e_field.STORE_PATH.USAGE]:e_storePathUsage.IMPEACH_IMAGE,
                    [e_field.STORE_PATH.STATUS]:e_storePathStatus.READ_WRITE,
                    [e_field.STORE_PATH.SIZE_IN_KB]:10*1000,
                    [e_field.STORE_PATH.USED_SIZE]:0,
                    [e_field.STORE_PATH.LOW_THRESHOLD]:70,
                    [e_field.STORE_PATH.HIGH_THRESHOLD]:90,
                },
            ],
        }
    },
    category: {
        other: 'other',
        LTE_A: 'LTE_A',
    },
    resource_profile: [
        {
            [e_field.RESOURCE_PROFILE.NAME]:"普通用户文档资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.DB.PER_ARTICLE,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DB.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:10,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:20, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"普通用户总体资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.DB.PER_PERSON,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DB.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:1000,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:2000, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"升级用户文档资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.DB.PER_ARTICLE,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DB.ADVANCED,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:100,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:200, //假设每个文件大小为200M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"升级用户总体资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.DB.PER_PERSON,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DB.ADVANCED,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:1000,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:2000, //假设每个文件大小为2000M
        },

        {
            [e_field.RESOURCE_PROFILE.NAME]:"用户举报资源设定",
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.DB.PER_IMPEACH_OR_COMMENT,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DB.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:10,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:20, //假设每个文件大小为2M
        },
        {
            [e_field.RESOURCE_PROFILE.NAME]:"用户举报总体资源设定", //假设一次举报中，用户总共进行了10次（发起，回复）的操作，每个操作10文件，20M
            [e_field.RESOURCE_PROFILE.RANGE]:e_resourceProfileRange.DB.PER_PERSON_IN_IMPEACH,
            [e_field.RESOURCE_PROFILE.TYPE]:e_resourceProfileType.DB.DEFAULT,
            [e_field.RESOURCE_PROFILE.MAX_FILE_NUM]:100,
            [e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]:200, //假设每个文件大小为2M
        },
    ],

}

let storePathDocs=[]
// console.log(`==================>initSetting.storePath ${JSON.stringify(initSetting.storePath)}`)
// console.log(`==================>initSetting.storePath ${JSON.stringify(typeof initSetting.storePath)}`)
for(let firstLevel in initSetting.storePath){


        for(let secondLevel in initSetting.storePath[firstLevel]){

            for(let ele of initSetting.storePath[firstLevel][secondLevel]){
                storePathDocs.push(ele)
            }

        }

}

console.log(`storePathDocs==============>${JSON.stringify(storePathDocs)}`)
common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.store_path,docs:storePathDocs}).then(
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
common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.category,docs:categoryDocs}).then(
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
common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.resource_profile,docs:resourceProfileDocs}).then(
    (v)=>{console.log(`success====>${JSON.stringify(v)}`)},
    (e)=>{console.log(`err====>${JSON.stringify(e)}`)}
)



