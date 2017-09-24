/**
 * Created by ada on 2017/7/26.
 * 在正式部署之前，需要预先设定一些值（例如，user_thumb存放路径，文档分类信息等）
 */
'use strict'

const server_common_file_require=require('../../server_common_file_require')
const common_operation_model=server_common_file_require.common_operation_model

const generateSugarAndhashPassword=server_common_file_require.controllerHelper.generateSugarAndhashPassword
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_adminUserType=mongoEnum.AdminUserType.DB

const allAdminPriorityType=require('../../server/constant/genEnum/enumValue').AdminPriorityType
/*const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_storePathStatus=mongoEnum.StorePathStatus.DB
const e_resourceProfileRange=mongoEnum.ResourceProfileRange
const e_resourceProfileType=mongoEnum.ResourceProfileType*/

const e_dbModel=require('../../server/constant/genEnum/dbModel')
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
const generateMongoEnumKeyValueExchange=server_common_file_require.generateMongoEnumKeyValueExchange
// const e_hashType=server_common_file_require.nodeEnum.hash
// const hash=server_common_file_require.crypt.hash

const fs=require('fs')
// common_operation_model.removeAll({dbModel:e_dbModel.store_path})
// common_operation_model.removeAll({dbModel:e_dbModel.category})

let initSetting= {
    admin_user:[
        {
            [e_field.ADMIN_USER.NAME]:'zw',
            [e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE,
            [e_field.ADMIN_USER.LAST_ACCOUNT_UPDATE_DATE]:Date.now(),
            [e_field.ADMIN_USER.LAST_SIGN_IN_DATE]:Date.now(),
            [e_field.ADMIN_USER.PASSWORD]:'123456',
            [e_field.ADMIN_USER.USER_PRIORITY]:allAdminPriorityType,
            [e_field.ADMIN_USER.USER_TYPE]:e_adminUserType.ROOT,
        },
    ],
}

async function createRoot(adminUser){
    console.log(`adminUser===>${JSON.stringify(adminUser)}`)
    //删除ROOT用户
    let condition={
        [e_field.ADMIN_USER.USER_TYPE]:e_adminUserType.ROOT
    }
    await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.admin_user,condition:condition})

    //获得sugar和hash后的password
    let hashResult=generateSugarAndhashPassword({ifUser:false,ifAdminUser:true,password:adminUser[e_field.ADMIN_USER.PASSWORD]})
    let sugar=hashResult.msg['sugar']
    adminUser[e_field.ADMIN_USER.PASSWORD]=hashResult.msg['hashedPassword']

    let userResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_user,value:adminUser})
    let userId=userResult['_id']

    let sugarResult=await  common_operation_model.create_returnRecord_async(({dbModel:e_dbModel.admin_sugar,value:{sugar:sugar,[e_field.ADMIN_SUGAR.USER_ID]:userId}}))
}



createRoot(initSetting.admin_user[0]).then(
    (v)=>{console.log(`create admin root user success====>${JSON.stringify(v)}`)},
    (e)=>{console.log(`create admin root user err====>${JSON.stringify(e)}`)}
)



