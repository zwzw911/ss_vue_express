/**
 * Created by wzhan039 on 2017/9/1.
 */
'use strict'



async function login_async(req){
    /*                              logic                                   */
    /*              略有不同，需要确定字段有且只有账号和密码                */
    // let usedColl=e_coll.USER
    let docValue = req.body.values[e_part.RECORD_INFO]
    /*              参数转为server格式            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // dataConvert.constructCreateCriteria(docValue)

    let expectedField = [e_field.USER.ACCOUNT, e_field.USER.PASSWORD]
    if(Object.keys(docValue).length!==expectedField.length){
        return Promise.reject(controllerError.loginFieldNumNotExpected)
    }
    for (let singleInputFieldName of expectedField) {
        if (false === singleInputFieldName in docValue) {
            return Promise.reject(controllerError.loginMandatoryFieldNotExist(singleInputFieldName))
        }
    }

//    读取sugar，并和输入的password进行运算，得到的结果进行比较
    let condition={account:docValue[e_field.USER.ACCOUNT]}
    let userTmpResult = await common_operation_model.find_returnRecords_async({dbModel: dbModel.user,condition:condition})
    // if(userTmpResult.rc>0){
    //     return Promise.reject(userTmpResult)
    // }
    if(0===userTmpResult.length){
        return Promise.reject(controllerError.accountNotExist)
    }
// console.log(`userTmpResult ${JSON.stringify(userTmpResult)}`)
    condition={userId:userTmpResult[0]['id']}
    let sugarTmpResult = await common_operation_model.find_returnRecords_async({dbModel: dbModel.sugar,condition:condition})
    /*    if(sugarTmpResult.rc>0){
     return Promise.reject(sugarTmpResult)
     }*/
// console.log(`password ====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
// console.log(`sugar====> ${JSON.stringify(sugarTmpResult[0][e_field.SUGAR.SUGAR])}`)

    let encryptPassword=hash(`${docValue[e_field.USER.PASSWORD]}${sugarTmpResult[0][e_field.SUGAR.SUGAR]}`,e_hashType.SHA256)
// console.log(`encryptPassword======> ${JSON.stringify(encryptPassword)}`)
    if(encryptPassword.rc>0){
        return Promise.reject(encryptPassword)
    }

    // console.log(`user/pwd  ${docValue[e_field.USER.ACCOUNT]}///${encryptPassword.msg}`)
    if(userTmpResult[0][e_field.USER.PASSWORD]!==encryptPassword['msg']){
        return Promise.reject(controllerError.accountPasswordNotMatch)
    }

    /*
     *  需要设置session，并设lastSignInDate为当前日期
     * */
    // console.log(`userTmpResult.msg[0]['id'] ${JSON.stringify(userTmpResult.msg[0]['id'])}`)
    req.session.userId=userTmpResult[0]['id']
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.user,id:userTmpResult[0]['id'],updateFieldsValue:{'lastSignInDate':Date.now()}})
    return Promise.resolve({rc:0})
}

module.exports={
    login_async,
}