/**
 * Created by 张伟 on 2018/7/27.
 * 执行所有preDeploy的操作
 */
'use strict'
const ap=require('awesomeprint')
const removeAll_async=require('./removeInitSettingData').remove_all_async
const insertAll_async=require('./insertInitRecord').all

async function rePreDeploy_async(){
    await removeAll_async()
    await insertAll_async()
}

rePreDeploy_async().then(
    (v)=>{ap.inf('rePreDeploy done')},
    (e)=>{ap.err('rePreDeploy failed')},
)

// module.exports={
//     rePreDeploy_async,
// }