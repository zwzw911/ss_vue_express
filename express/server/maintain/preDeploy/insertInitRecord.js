/**
 * Created by ada on 2017/7/26.
 * 在正式部署之前，需要预先设定一些值（例如，user_thumb存放路径，文档分类信息等）
 */
'use strict'

const common_operation_model=require('../../model/mongo/operation/common_operation_model')
const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage.DB
const e_dbModel=require('../../model/mongo/dbModel')


// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})

const initSetting={
    storePath:{
        tmpUploadDir:'H:/ss_vue_express/test_data/tmp/',//所有上传文件临时存储位置
        user:{
            thumb:['H:/ss_vue_express/test_data/userPhoto/dest/','H:/ss_vue_express/test_data/userPhoto/dest1/'],//头像存放最终路径
        }
    },
    category:{
        other:'未分类',
        LTE_A:'LTE_A',
    },

}

let storePathDocs=[]
//init use photoStorePath
for(let idx in initSetting.storePath.user.thumb){
    storePathDocs.push({name:`头像存储路径${idx*1+1}`,path:initSetting.storePath.user.thumb[idx],usage:e_storePathUsage.USER_PHOTO,lowThreshold:70,highThreshold:90,size:500*1000,usedSize:0})
}
//init tmp path
storePathDocs.push({name:`临时文件夹`,path:initSetting.storePath.tmpUploadDir,usage:e_storePathUsage.UPLOAD_TMP,lowThreshold:65,highThreshold:90,size:500*1000,usedSize:0})
console.log(`${JSON.stringify(storePathDocs)}`)

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