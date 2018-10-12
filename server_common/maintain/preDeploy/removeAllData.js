/**
 * Created by 张伟 on 2018/7/27.
 * 执行所有preDeploy的操作
 */
'use strict'
const ap=require('awesomeprint')
// const server_common_file_require=require('../../../express/server_common_file_require')
const common_operation_model=require(`../../model/mongo/operation/common_operation_model`)//server_common_file_require.common_operation_model
const e_dbModel=require('../../constant/genEnum/dbModel')
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
const dbModelArray=require('../../constant/genEnum/dbModelInArray')
// const generateMongoEnumKeyValueExchange=server_common_file_require.generateMongoEnumKeyValueExchange
const fs=require('fs')
const generateSugarAndHashPassword=require(`../../controller/controllerHelper`).generateSugarAndHashPassword//.controllerHelper.generateSugarAndHashPassword
// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})

const initRecord=require(`./initRecord`)
const storePathRecord=initRecord.storePath
const categoryRecord=initRecord.category
const resourceProfileRecord=initRecord.resource_profile
const adminUserRecord=initRecord.admin_user


async function remove_all_async(){
    // let dbModelInArray=[e_dbModel.store_path,e_dbModel.category,e_dbModel.resource_profile,e_dbModel.admin_user]
    let promiseTobeExec=[]
    for(let singleDbModel of dbModelArray){
        promiseTobeExec.push(common_operation_model.removeAll_async({dbModel:singleDbModel}))
    }
    return await Promise.all(promiseTobeExec)
    // ap.inf('remove_all_async done')
}




remove_all_async().then(
    (v)=>{ap.inf('remove all data done')},
    (e)=>{ap.err('remove all data failed')},
)

// module.exports={
//     rePreDeploy_async,
// }