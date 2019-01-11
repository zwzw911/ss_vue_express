/**
 * Created by 张伟 on 2018/11/19.
 */
'use strict'


const ap=require('awesomeprint')
const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult
//require('../../../../server_common/function/assist/misc').genFinalReturnResult
// const article_logic=require('./article_logic')
// const article_comment_logic=require('./article_comment_logic')
// const article_upload_file_logic=require('./article_upload_file_logic')
// const likeDislike_logic=require('./liekDislike_logic')
const systemError=server_common_file_require.assistError.systemError

// const e_uploadFileType=nodeEnum.UploadFileType


const collection_dispatcher_async=require('./collection_dispatch').collection_dispatcher_async
// const article_comment_dispatch_async=require('../article_comment/article_comment_dispatch').comment_dispatcher_async
// const article_likeDislike_dispatcher_async=require(`./express/server/controller/articleLikeDislike`).article_likeDislike_dispatcher_async
// const articleUploadFile_dispatch_async=require(`.`).articleUploadFile_dispatch_async

/***    创建一个新的collection（其中article和topic都为空）   ***/
router.post('/',function(req,res,next){
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`create   collection   success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                ap.err('create   collection    fail:',err)
                // console.log(`create   recommend    fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})


/***    读取 单个collection的内容     ****/
router.get('/:collectionId',function(req,res,next){
    // ap.wrn('get collection content in')
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get collection success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get collection fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})

/***    读取 所有 level collection（以便页面一次显示所有collection，用户体验更好）     ****/
router.get('/all',function(req,res,next){
    // ap.wrn('get collection list in')
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all collection success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all collection fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    读取 top level collection     ****/
router.get('/top',function(req,res,next){
    // ap.wrn('get collection list in')
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all collection success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all collection fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    读取 2nd level collection     ****/
router.get('/nonTop',function(req,res,next){
    // ap.wrn('get collection list in')
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all collection success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all collection fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    删除 单个collection     ****/
router.delete('/',function(req,res,next){
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`delete collection success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`delete collection fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    更新collection非content（例如名称）    ****/
router.put('/name',function(req,res,next){
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update collection success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update collection fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))
        }
    )
})
/***    更新collection content（例如文档）    ****/
router.put('/content',function(req,res,next){
    collection_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update collection content success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update collection content fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))
        }
    )
})




router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})


// console.log('router',router)

module.exports={router}