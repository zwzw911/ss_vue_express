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

/******************************/
/******     创建配置数据  *********/
/******************************/
async function storePath(){
    let storePathDocs=[]
// console.log(`==================>storePathRecord ${JSON.stringify(storePathRecord)}`)
// console.log(`==================>storePathRecord ${JSON.stringify(typeof storePathRecord)}`)
    for(let firstLevel in storePathRecord){
        for(let secondLevel in storePathRecord[firstLevel]){
            for(let ele of storePathRecord[firstLevel][secondLevel]){
                storePathDocs.push(ele)
            }
        }
    }
    console.log(`storePathDocs==============>${JSON.stringify(storePathDocs)}`)
    await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.store_path,docs:storePathDocs})
    //     .then(
    //     (v)=>{console.log(`success====>${JSON.stringify(v)}`)},
    //     (e)=>{console.log(`err====>${JSON.stringify(e)}`)}
    // )
}

async function category(){
    console.log(`${JSON.stringify(categoryRecord)}`)
    let categoryDocs=[]
//init use category
    for(let singleCategory of Object.values(categoryRecord)){
        categoryDocs.push({name:`${singleCategory}`})
    }
    // console.log(`${JSON.stringify(categoryDocs)}`)
    // ap.inf('categoryDocs',categoryDocs)
    await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.category,docs:categoryDocs})
    //     .then(
    //     (v)=>{console.log(`success====>${JSON.stringify(v)}`)},
    //     (e)=>{console.log(`err====>${JSON.stringify(e)}`)}
    // )
}


async function resourceProfile(){
    let resourceProfileDocs=[]
//init use category
    for(let singleItem of resourceProfileRecord){
        resourceProfileDocs.push(singleItem)
        // console.log(`singleItem。range====》${JSON.stringify(singleItem.range)}`)
    }

    // console.log(`resourceProfileDocs====》${JSON.stringify(resourceProfileDocs)}`)
    await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.resource_profile,docs:resourceProfileDocs})
    //     .then(
    //     (v)=>{console.log(`success====>${JSON.stringify(v)}`)},
    //     (e)=>{console.log(`err====>${JSON.stringify(e)}`)}
    // )
}
// console.log(`in=======>`)
// console.log(`${JSON.stringify(initSetting.resource_profile)}`)


async function createRoot(){
    // console.log(`adminUser===>${JSON.stringify(adminUser)}`)
    // //删除ROOT用户
    /*    let condition={
            [e_field.ADMIN_USER.USER_TYPE]:e_adminUserType.ROOT
        }
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.admin_user,condition:condition})*/

    let adminUser=adminUserRecord[0]
    //获得sugar和hash后的password
    let hashResult=generateSugarAndHashPassword({ifUser:false,ifAdminUser:true,password:adminUser[e_field.ADMIN_USER.PASSWORD]})
    let sugar=hashResult.msg['sugar']
    adminUser[e_field.ADMIN_USER.PASSWORD]=hashResult.msg['hashedPassword']

    let userResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_user,value:adminUser})
    let userId=userResult['_id']

    let sugarResult=await  common_operation_model.create_returnRecord_async(({dbModel:e_dbModel.admin_sugar,value:{sugar:sugar,[e_field.ADMIN_SUGAR.USER_ID]:userId}}))
}

/*async  function removeAll(){
    await common_operation_model.deleteAll_async({dbModel:e_dbModel.store_path})
    await common_operation_model.deleteAll_async({dbModel:e_dbModel.category})
    await common_operation_model.deleteAll_async({dbModel:e_dbModel.resource_profile})
    await common_operation_model.deleteAll_async({dbModel:e_dbModel.admin_user})
    await common_operation_model.deleteAll_async({dbModel:e_dbModel.admin_sugar})
}*/


async function all(){
    // await removeAll().catch(e=>{console.log(`remove all failed with cause ${JSON.stringify(e)}`)})
    await storePath().catch(e=>{ap.err(`storePath failed with cause ${JSON.stringify(e)}`)})
    await category().catch(e=>{ap.err(`category failed with cause ${JSON.stringify(e)}`)})
    await resourceProfile().catch(e=>{ap.err(`resourceProfile failed with cause ${JSON.stringify(e)}`)})
    await createRoot().catch(e=>{ap.err(`createRoot failed with cause ${JSON.stringify(e)}`)})
    ap.inf('init all done')
}

/********************************/
/******   移除配置数据    *******/
/********************************/
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


/***************/
/***    主函数 ***/
/***************/
async function rePreDeploy_async(){
    await remove_all_init_data_async()
    await all()
}

rePreDeploy_async().then(
    (v)=>{ap.inf('rePreDeploy done')},
    (e)=>{ap.err('rePreDeploy failed')},
)

// module.exports={
//     rePreDeploy_async,
// }