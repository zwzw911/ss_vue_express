/**
 * Created by ada on 2017/8/21.
 */
'use strict'

const common_operation_model=require('../../../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../../../server/model/mongo/dbModel')

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