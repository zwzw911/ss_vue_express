/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'
const server_common_file_include=require('../../../server_common_file_require')

const nodeEnum=server_common_file_include.nodeEnum
const controllerHelper=server_common_file_include.controllerHelper
// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method
const e_coll=require('../../constant/genEnum/DB_Coll').Coll

const controllerError=require(`./user_logic/user_controllerError`).controllerError
const createUser_async=require('./user_logic/create_user').createUser_async
const updateUser_async=require('./user_logic/update_user').updateUser_async
const userLogin_async=require('./user_logic/user_login').login_async
//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher_async(req){
    //检查格式
    // console.log(`req is ${JSON.stringify(req.body)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.USER,tmpResult

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    // console.log(   `checkMethod Result===========>${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }


    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            // console.log(`create in`)

            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
/*                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`precheck done=====.`)

            tmpResult=await createUser_async(req)
            // console.log(`create  tmpResult ${JSON.stringify(tmpResult)}`)
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantUpdate
            }
            penalizeCheck={
                /*                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
         //    console.log(`req.session indisp ${JSON.stringify(req.session)}`)
            tmpResult=await updateUser_async(req)
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
                /*                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            //update的时候，userId直接保存在session中，无需通过client传入
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            tmpResult=await userLogin_async(req)
            break;
        default:
            console.log(`======>ERR:Wont in cause method check before`)
            // console.log(`match tmpResult ${JSON.stringify(tmpResult)}`)
    }
    
    return Promise.resolve(tmpResult)
}


module.exports={
    dispatcher_async,
    // login_async,
    // uniqueCheck_async,
    // retrievePassword_async,
    // uploadPhoto_async,
    // generateCaptcha_async,
    // controllerError
}