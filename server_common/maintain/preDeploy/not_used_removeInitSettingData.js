/**
 * Created by ada on 2017/8/21.
 */
'use strict'
const ap=require('awesomeprint')
// const server_common_file_require=require('../../../express/server_common_file_require')
const common_operation_model=require(`../../model/mongo/operation/common_operation_model`)//server_common_file_require.common_operation_model
const e_dbModel=require('../../constant/genEnum/dbModel')
const dbModelArray=require('../../constant/genEnum/dbModelInArray')

async function remove_all_init_data_async(){
    let dbModelInArray=[e_dbModel.store_path,e_dbModel.category,e_dbModel.resource_profile,e_dbModel.admin_user,e_dbModel.admin_sugar]
    let promiseTobeExec=[]
    for(let singleDbModel of dbModelInArray){
        promiseTobeExec.push(common_operation_model.deleteAll_async({dbModel:singleDbModel}))
        // await
    }
    return await Promise.all(promiseTobeExec)
}
async function remove_all_async(){
    // let dbModelInArray=[e_dbModel.store_path,e_dbModel.category,e_dbModel.resource_profile,e_dbModel.admin_user]
    let promiseTobeExec=[]
    for(let singleDbModel of dbModelArray){
        promiseTobeExec.push(common_operation_model.deleteAll_async({dbModel:singleDbModel}))
    }
    return await Promise.all(promiseTobeExec)
    // ap.inf('remove_all_async done')
}

module.exports={
    remove_all_init_data_async,
    remove_all_async,
}