/**
 * Created by ada on 2017/7/26.
 * 插入一些测试数据
 */
'use strict'

const common_operation_model=require('../server/model/mongo/operation/common_operation_model')
const e_penalizeType=require('../server/constant/enum/mongo').PenalizeType.DB
const e_penalizeSubType=require('../server/constant/enum/mongo').PenalizeSubType.DB
const e_userType=require('../server/constant/enum/mongo').UserType.DB
const e_docStatus=require('../server/constant/enum/mongo').DocStatus.DB
// const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage
// const e_storePathStatus=require('../../constant/enum/mongo').StorePathStatus
const e_dbModel=require('../server/model/mongo/dbModel')
const e_coll=require('../server/constant/enum/DB_Coll').Coll
const e_field=require('../server/constant/enum/DB_field').Field
// const
// const generateMongoEnumKeyValueExchange=require('../../maintain/generateMongoEnumKeyValueExchange').genMongoEnumKVExchange


/*          为所有存在的用户创建处罚记录              */
async  function createPenalizeForExistUser_async(){
    let condition={}
    condition[e_field.USER.DOC_STATUS]=e_docStatus.DONE
    condition[e_field.USER.USER_TYPE]=e_userType.USER_NORMAL
    let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:condition})
    if(tmpResult.length>0){
        for(let singleUser of tmpResult){
            let value={}
            value[e_field.ADMIN_PENALIZE.PUNISHED_ID]=singleUser['_id']
            value[e_field.ADMIN_PENALIZE.CREATOR_ID]=singleUser['_id']
            value[e_field.ADMIN_PENALIZE.PENALIZE_TYPE]=e_penalizeType.NO_ARTICLE
            value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=e_penalizeSubType.CREATE
            value[e_field.ADMIN_PENALIZE.DURATION]=1
            value[e_field.ADMIN_PENALIZE.REASON]=`test data, after user create`

            await  common_operation_model.create({dbModel:e_dbModel.admin_penalize,value:value})

            value[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=e_penalizeSubType.ALL
            await  common_operation_model.create({dbModel:e_dbModel.admin_penalize,value:value})
        }
    }
}
createPenalizeForExistUser_async()