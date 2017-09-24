/**
 * Created by ada on 2017/8/21.
 */
'use strict'
const server_common_file_require=require('../../server_common_file_require')
const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')

async function remove_all_init_data_async(){
    let dbModelInArray=[e_dbModel.store_path,e_dbModel.category,e_dbModel.resource_profile]
    for(let singleDbModel of dbModelInArray){
        await common_operation_model.removeAll_async({dbModel:singleDbModel})
    }
}

remove_all_init_data_async().then(
    (result)=>{

    },
    (err)=>{
        console.log(`removeAll fail========>${JSON.stringify(err)}`)
    }
)