/**
 * Created by 张伟 on 2018/11/23.
 */
'use strict'
const ap=require('awesomeprint')
const removeAll_async=require('./removeAllData').remove_all_async
const insertInitData=require('./operateInitData').rePreDeploy_async

async function main_async(){
    await removeAll_async()
    await insertInitData()
}

main_async().then(
    function (r) {
        ap.inf('main_async result',r)
    },
    function (e) {
        ap.wrn('main_async err',e)
    }
)