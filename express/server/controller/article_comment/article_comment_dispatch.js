/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




/****************   内置lib和第三方lib   ******************/
const ap=require('awesomeprint')
/*                          server common                       */
const server_common_file_require=require('../../../server_common_file_require')
/****************   公共函数   ******************/
const controllerPreCheck=server_common_file_require.controllerPreCheck
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const crypt=server_common_file_require.crypt
/****************   公共常量   ******************/
const dispatchError=server_common_file_require.helperError.dispatch

const nodeEnum=server_common_file_require.nodeEnum
const e_uploadFileType=nodeEnum.UploadFileType
const e_part=nodeEnum.ValidatePart

const mongoEnum=server_common_file_require.mongoEnum
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

const e_field=require(`../../constant/genEnum/DB_field`).Field
const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll

const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/**************  rule  ****************/
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
/**************  controller相关常量  ****************/
const controllerError=require('./article_comment_setting/article_comment_controllerError').controllerError
const controllerSetting=require('../article_comment/article_comment_setting/article_comment_setting').setting



/*                          controller                          */
const createArticleComment_async=require('./article_comment_logic/create_article_comment').createArticleComment_async
// const update_async=require('./article_logic/update_article').updateArticle_async
// const delete_async=require('./article_logic/delete_impeach').deleteImpeach_async









//对CRUD（输入参数带有method）操作调用对应的函数
async function comment_dispatcher_async({req}){

    /***   初始化参数   ***/
    let userLoginCheck={
        //needCheck:true,
        // error:controllerError.userNotLoginCantCreateComment
    }
    let penalizeCheck={
        /*        penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
    }
    let arr_currentSearchRange=[e_searchRange.ALL]
    let originalUrl=req.originalUrl
    let baseUrl=req.baseUrl
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let expectedPart
    let result=dispatchError.common.unknownRequestUrl
    let tmpResult
    let applyRange
    // ap.inf('originalUrl',originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body',req.body)
    // ap.inf('req.params',req.params)
    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req:req,collName:collName})
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'post':
            if (baseUrl === '/article_comment' || baseUrl === '/article_comment/') {
                applyRange=e_applyRange.CREATE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.post.notLoginCantCreateComment
                }
                penalizeCheck={
                    penalizeType:e_penalizeType.NO_ARTICLE_COMMENT,
                    penalizeSubType:e_penalizeSubType.CREATE,
                    penalizeCheckError:controllerError.dispatch.post.userInPenalizeCantCreateComment
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('create use userStateCheck_async done')
                expectedPart=[e_part.RECORD_INFO]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName]})
                // ap.inf('after check',req.body.values)
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})
                // ap.inf('after decrypt',req.body.values)
                //对输入值进行检测（此时objectId已经解密）
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createArticleComment_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break;
        default:
    }

}










module.exports={
    comment_dispatcher_async,
    // controllerError
}