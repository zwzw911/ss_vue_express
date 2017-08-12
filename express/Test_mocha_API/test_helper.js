/**
 * Created by ada on 2017/8/9.
 */
'use strict'

const common_operation_model=require('../server/model/mongo/operation/common_operation_model')
const e_dbModel=require('../server/model/mongo/dbModel')

const e_part=require('../server/constant/enum/node').ValidatePart
const e_method=require('../server/constant/enum/node').Method
const e_coll=require('../server/constant/enum/DB_Coll').Coll
const e_field=require('../server/constant/enum/DB_field').Field
const dbModelInArray=require('../server/model/mongo/dbModelInArray')

async function deleteUserAndRelatedInfo_async({account}){
    let result=await common_operation_model.find({dbModel:e_dbModel.user,condition:{account:account}})
    console.log(`find user result =======>${JSON.stringify(result)}`)
    if(0===result.rc && result.msg[0]){
        let userId=result.msg[0]['id']
        result=await common_operation_model.deleteOne({dbModel:e_dbModel.user,condition:{account:account}})
        result=await common_operation_model.deleteOne({dbModel:e_dbModel.sugar,condition:{userId:userId}})
        result=await common_operation_model.deleteOne({dbModel:e_dbModel.user_friend_group,condition:{userId:userId}})
        result=await common_operation_model.deleteOne({dbModel:e_dbModel.folder,condition:{authorId:userId}})
        result=await common_operation_model.deleteOne({dbModel:e_dbModel.user_resource_profile,condition:{userId:userId}})
    }

}


async function deleteAllModelRecord_async({}){
    let skipColl=[e_coll.STORE_PATH,e_coll.CATEGORY,e_coll.RESOURCE_PROFILE]
    for(let singleDbModel of dbModelInArray){
        if(-1===skipColl.indexOf(singleDbModel.modelName)){
        console.log(`model name======>${singleDbModel.modelName}`)
        await common_operation_model.removeAll({dbModel:singleDbModel})
        }

    }
}


module.exports={
    deleteUserAndRelatedInfo_async,
    deleteAllModelRecord_async,

}