/**
 * Created by 张伟 on 2018/9/28.
 */
'use strict'
const ap=require('awesomeprint')
const server_common_file_require=require('./server_common_file_require')
const controllerPreCheck=server_common_file_require.controllerPreCheck
async function router_only_dispatcher_async({req}) {
    /***   初始化参数   ***/
    let userLoginCheck = {
        //needCheck:true,
        // error:controllerError.userNotLoginCantCreateComment
    }
    let penalizeCheck = {
        /*        penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
    }

    let originalUrl = req.originalUrl
    let baseUrl = req.baseUrl
    ap.inf('req.baseUrl', req.baseUrl)
    ap.inf('originalUrl',originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body', req.body)
    ap.inf('req.path', req.path)
    /***   1. interval和robot检测   ***/
    // await controllerPreCheck.commonPreCheck_async({req: req, collName: collName})

    switch (req.route.stack[0].method) {
        case 'get':
            if (originalUrl === '/userCenter' || originalUrl === '/userCenter/') {
                userLoginCheck = {
                    needCheck: true,
                    error: {rc:99998,msg:'not login'}
                    // error: controllerError.dispatch.get.notLoginCantGetArticle
                }
                // penalizeCheck = {
                //     penalizeType: e_penalizeType.NO_ARTICLE,
                //     penalizeSubType: e_penalizeSubType.READ,
                //     penalizeCheckError: controllerError.dispatch.get.userInPenalizeCantGetArticle
                // }
                let result=await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                ap.inf('result',result)
                return Promise.resolve(result)
            }
    }
}

module.exports={
    router_only_dispatcher_async
}