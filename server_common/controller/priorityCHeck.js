/**
 * Created by ada on 2017/9/22.
 */
'use strict'

const e_dbModel=require('../constant/genEnum/dbModel')
const common_operation_model=require('../model/mongo/operation/common_operation_model')
async function ifRoot_async({userName:userName}){
    // let condition={[e_fi]}
    let tmpResult=common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user})
}