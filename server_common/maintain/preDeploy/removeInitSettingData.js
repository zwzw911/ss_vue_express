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
    for(let singleDbModel of dbModelInArray){
        await common_operation_model.removeAll_async({dbModel:singleDbModel})
    }
}
async function remove_all_async(){
    // let dbModelInArray=[e_dbModel.store_path,e_dbModel.category,e_dbModel.resource_profile,e_dbModel.admin_user]
    for(let singleDbModel of dbModelArray){
        await common_operation_model.removeAll_async({dbModel:singleDbModel})
    }
}
remove_all_init_data_async().then(
    (result)=>{
        ap.inf('remove_all_init_data_async done',result)
    },
    (err)=>{
        ap.err('remove_all_init_data_async fail',err)
        // console.log(`removeAll fail========>${JSON.stringify(err)}`)
    }
)
remove_all_async().then(
    (result)=>{
        ap.inf('remove_all_async done',result)
    },
    (err)=>{
        ap.err('remove_all_async fail',err)
    }
)
