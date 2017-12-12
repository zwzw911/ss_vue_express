/**
 * Created by ada on 2017/12/7.
 * 对 某些数据库的数据，进行一致性检测，确保用户操作产生的数据变化是正确的
 */
'use strict'
const server_common_file_require=require('../../server_common_file_require')
const mongoEnum=server_common_file_require.mongoEnum
const nodeEnum=server_common_file_require.nodeEnum

const arr_resouceType=require('../../server/constant/genEnum/enumValue').ResourceType

const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
const e_dbModel=require('../../server/constant/genEnum/dbModel')
const e_resourceType=mongoEnum.ResourceType.DB
const e_resourceFieldName=nodeEnum.ResourceFieldName
const e_resourceConfigFieldName=nodeEnum.ResourceConfigFieldName
const maintainError=server_common_file_require.maintainError

const groupConfigForDaily=server_common_file_require.calcResourceConfig.daily

const dailyConfiguration=server_common_file_require.globalConfiguration.daily

const common_operation_model=server_common_file_require.common_operation_model
/*  对article_image/article_attachment中，对所有或者指定用户进行group，获得的uploaded的数据，和user_resource_static中的数据进行比较，不正确的话，直接覆盖
* @resourceType: article_image还是article_attachment,如果不指定，则包含2者
* @userId: 如果undefined，对指定用户进行group，否则对所有用户进行group
*
* PS：必须在空闲时进行
* */
async function uploadedFileNumSizeMatchCheck_async({resourceType,arr_userId}){

    //获得需要进行检查的userId（user_resource_static）
    //如果没有指定要检查的用户，根据dailyCheckDate获得最久没有检查过的用户
    if(undefined===arr_userId){
        //读取user中数量，和maxUserNumDailyCheck比较，取小值比较
        let totalUserNum=await common_operation_model.count_async({dbModel:e_dbModel.user})
        let validUserNum=Math.ceil(totalUserNum/dailyConfiguration.resource_maxDailyCheckUserNum) //根据周期确定，每天check 多少用户
        if(0===validUserNum){
            return undefined
        }
        let dailyDealUserNum=validUserNum<dailyConfiguration.resource_maxDailyCheckUserNum ?  validUserNum:dailyConfiguration.resource_maxDailyCheckUserNum
        //根据lastDailyCheck，获得userId数据，返回[{_id:ObjectId}]
        let tmpResult=await e_dbModel.user_resource_static.aggregate([
            {$sort:{[e_field.USER_RESOURCE_STATIC.DAILY_CHECK_DATE]:1}},
            {$limit:dailyDealUserNum*arr_resouceType.length},//用户*需要统计的资源类型的数量（当前资源数量为2：image/attachment）
            {$group:{_id:`$${[e_field.USER_RESOURCE_STATIC.USER_ID]}`}},
            ])
        //将group得到的用户塞入arr_userId
        arr_userId=[]
        for(let singleRecord of tmpResult){
            arr_userId.push(singleRecord[`_id`])
        }
        await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_resource_static})
    }

    //对每个用户的资源类型进行检测
    // for(let singleResourceConfig of config){
        for(let singleUserId of arr_userId){
            let config=[]
            //确定资源类型
            if(undefined!==resourceType){
                config.push(groupConfigForDaily[resourceType]({userId:singleUserId}))
            }else{
                config.push(groupConfigForDaily[e_resourceType.ARTICLE_ATTACHMENT]({userId:singleUserId}))
                config.push(groupConfigForDaily[e_resourceType.ARTICLE_IMAGE]({userId:singleUserId}))
            }

            //userId下，每个资源单独比较
            for(let singleConfig of config){
                let dbResourceStatic,realResource //都是对象，一条记录
                //user_resource_static中获得资源，返回
                let staticResource=await common_operation_model.find_returnRecords_async({
                    dbModel:e_dbModel.user_resource_static,
                    condition:{
                        [e_field.USER_RESOURCE_STATIC.USER_ID]:singleUserId,
                        [e_field.USER_RESOURCE_STATIC.RESOURCE_TYPE]:singleConfig[e_resourceConfigFieldName.RESOURCE_TYPE],
                    }
                })
                if(1!==staticResource.length){
                    return Promise.reject(maintainError.noRelatedRecordInUserResourceStatic({userId:singleUserId,resourceType:singleConfig[e_resourceConfigFieldName.RESOURCE_TYPE]}))
                }
                dbResourceStatic=staticResource[0]

                //group统计资源, 返回数组，其中只有一个记录[{_id:userId,TOTAL_FILE_SIZE_IN_MB:123,MAX_FILE_NUM:123}]
                let groupedResource=await common_operation_model.group_async({
                    dbModel:singleConfig[e_resourceConfigFieldName.DB_MODEL],
                    match:singleConfig[e_resourceConfigFieldName.RAW_DOC_FILTER],
                    group:singleConfig[e_resourceConfigFieldName.RAW_DOC_GROUP],
                })

                //0说明还没有任何资源，MAX_SIZE/NUM直接设0
                if(0===groupedResource.length){
                    realResource={_id:singleUserId,[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:0,[e_resourceFieldName.MAX_FILE_NUM]:0}
                }else{
                    realResource=groupedResource[0]
                }
                //比较数据：不一致，更新数据和DAILY_CHECK_DATE/DAILY_CHECK_UPDATE;一致，只更新DAILY_CHECK_DATE
                let needUpdate=false
                if(dbResourceStatic[e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]!==realResource[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]){
                    dbResourceStatic[e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]=realResource[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]
                    needUpdate=true
                }
                if(dbResourceStatic[e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]!==realResource[e_resourceFieldName.MAX_FILE_NUM]){
                    dbResourceStatic[e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]=realResource[e_resourceFieldName.MAX_FILE_NUM]
                    needUpdate=true
                }
                if(needUpdate===true){
                    dbResourceStatic[e_field.USER_RESOURCE_STATIC.DAILY_UPDATE_DATE]=Date.now()
                }
                dbResourceStatic[e_field.USER_RESOURCE_STATIC.DAILY_CHECK_DATE]=Date.now()
                await dbResourceStatic.save()
            }


        }

}

// uploadedFileNumSizeMatchCheck_async({}).then(
//     (v)=>{console.log(`result is ${JSON.stringify(v)}`)},
//     (e)=>{console.log(`err is ${JSON.stringify(e)}`)}
// )
module.exports={
    uploadedFileNumSizeMatchCheck_async,
}
