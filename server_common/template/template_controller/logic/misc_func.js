/**
 * Created by ada on 2017/9/1.
 */
'use strict'

const fs=require('fs')
const ap=require(`awesomeprint`)

const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


const server_common_file_require=require('../../../../server_common_file_require')
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const dataConvert=server_common_file_require.dataConvert

const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum

const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const gmImage=server_common_file_require.gmImage
const validateFormat=server_common_file_require.validateFormat
const validateValue=server_common_file_require.validateValue

const e_part=nodeEnum.ValidatePart
// const e_randomStringType=nodeEnum.RandomStringType
const e_userState=nodeEnum.UserState
const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit
const e_storePathUsage=mongoEnum.StorePathUsage
const e_gmCommand=nodeRuntimeEnum.GmCommand
const e_gmGetter=nodeRuntimeEnum.GmGetter
const e_env=nodeEnum.Env

// const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType
const e_docStatus=mongoEnum.DocStatus.DB

const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field

const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName


const userPhotoConfiguration=server_common_file_require.globalConfiguration.uploadFileDefine.user_thumb
const captchaIntervalConfiguration=server_common_file_require.globalConfiguration.intervalCheckConfiguration.captcha
const mailOption=server_common_file_require.globalConfiguration.mailOption
const currentEnv=server_common_file_require.appSetting.currentEnv

const dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

const controllerError=require('../admin_setting/admin_user_controllerError').controllerError

// const hash=server_common_file_require.crypt.hash
/*                      检查用户名/账号的唯一性                           */
async  function  uniqueCheck_async(req) {
    console.log(`admin user unique check values =========> ${JSON.stringify(req.body.values)} `)

    let collName=e_coll.ADMIN_USER

    let userLoginCheck={
        needCheck:false,
        // error:controllerError.userNotLoginCantCreateComment
    }
    let penalizeCheck={
        /*                penalizeType:e_penalizeType.NO_ARTICLE,
         penalizeSubType:e_penalizeSubType.CREATE,
         penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
    }
    let expectedPart=[e_part.SINGLE_FIELD]
    // console.log(`before precheck =====.`)
    await controllerHelper.preCheck_async({req:req,collName:collName,method:undefined,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
// console.log(`precheck done=====.`)

    /*                  logic               */
    let docValue = req.body.values[e_part.SINGLE_FIELD]
    /*              参数转为server格式（SINGLE_FIELD和RECORD_INFO格式一致）            */
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // dataConvert.constructCreateCriteria(docValue)
// console.log(`docValue ${JSON.stringify(docValue)}`)

    //读取字段名，进行不同的操作（userUnique或者passowrd格式,只支持一个field）
    let fieldName=Object.keys(docValue)[0]
    // let fieldValue=Object.values(docValue)[0]
    // let condition
    // let uniqueCheck_asynctmpResult
// console.log(`fieldName ${fieldName}`)
//     console.log(`fieldValue ${fieldValue}`)
//     console.log(`e_uniqueField[e_coll] ${JSON.stringify(e_uniqueField[e_coll.USER])}`)
    if(-1===e_uniqueField[e_coll.USER].indexOf(fieldName)){
        return Promise.reject(controllerError.fieldNotSupport)
    }
// console.log(`indexof check done`)
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        //unique check，还要考虑到DOC_STATUS为done（不为done的可以重复）
        let additionalCheckCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }


    return Promise.resolve({rc:0})

}

/*async function retrievePassword_async(req){
    //新产生的密码,账号对应的记录
    let tmpResult,newPwd,userId,newPwdType=e_randomStringType.NORMAL

    let condition={},condition1={}  //for account/ usedAccount
    /!*          格式/值检查        *!/
    tmpResult=controllerHelper.nonCRUDPreCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.SINGLE_FIELD],
        collName:e_coll.USER,
        //e_coll:e_coll,
    })
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }


    /!*                  logic               *!/
    let docValue = req.body.values[e_part.SINGLE_FIELD]
    /!*              参数转为server格式（SINGLE_FIELD和RECORD_INFO格式一致）            *!/
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
// console.log(`docValue ${JSON.stringify(docValue)}`)

    //读取字段名，进行不同的操作（userUnique或者password格式）
    let fieldName=Object.keys(docValue)[0]
    let fieldValue=Object.values(docValue)[0]


    condition[e_field.USER.ACCOUNT]=fieldValue
    condition[e_field.USER.DOC_STATUS]=e_docStatus.DONE
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:dbModel.user,condition:condition})
    // console.log(`retrieve ped: find current account=====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.length>1){
        return Promise.reject(controllerError.accountNotUnique)
    }
    if(tmpResult.length===1){
        userId=tmpResult[0]['id']
        newPwd=misc.generateRandomString(6,newPwdType)
    }
    //继续在usedAccount中查找
    if(tmpResult.length===0){
        condition1[e_field.USER.USED_ACCOUNT]=fieldValue
        condition1[e_field.USER.DOC_STATUS]=e_docStatus.DONE
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:dbModel.user,condition:condition1})
        // console.log(`retrieve ped: find used account=====>${JSON.stringify(tmpResult)}`)
        switch (tmpResult.length){
            case 0:
                return {rc:0}
            case 1:
                userId=tmpResult[0]['id']
                newPwd=misc.generateRandomString(6,newPwdType)
                break
            default:
                return Promise.reject(controllerError.accountNotUnique)
        }
    }
    // console.log(`retrieve ped: ready to hash new pwd ${JSON.stringify(newPwd)}`)
    // console.log(`userId ${JSON.stringify(userId)}`)
    //hash密码，保存到db，并发送给用户，并返回通知
    tmpResult=hash(newPwd,e_hashType.SHA256)
    if(tmpResult.rc>0){return Promise.reject(tmpResult)}

    let hashedPassword=tmpResult.msg
    // console.log(`hashedPassword ${JSON.stringify(hashedPassword)}`)
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.user,id:userId,updateFieldsValue:{'password':hashedPassword}})
    // console.log(`update pwd tmpResult ${JSON.stringify(tmpResult)}`)
    if(regex.email.test(fieldValue)){
        //通过mail发送新密码
        let message={}
        message['from']=mailAccount.qq
        message['to']=mailAccount.qq  //fieldValue
        message['subject']='iShare重置密码'
        message['text']= `iShare为您重新设置了密码：${newPwd}。\r\n此邮件为自动发送，请勿回复。`
        message['html']=`<p>iShare为您重新设置了密码：${newPwd}。</p><p>此邮件为自动发送，请勿回复。</p>`
        tmpResult=await misc.sendVerificationCodeByEmail_async(message,mailOption)
        return Promise.resolve(tmpResult)
    }
    if(regex.mobilePhone.test(fieldValue)){
        //通过手机发送新密码

    }


}*/


/*
async function uploadPhoto_async(req){
    /!*             检查用户是否在更新 自己 的头像           *!/
    // console.log(`uploadPhoto_async in`)
    if(undefined===req.session.userId){
        return Promise.reject(controllerError.notLogin)
    }
// console.log(`req.session ====>${JSON.stringify(req.session)}`)
    let userId=req.session.userId
    /!*    if(req.session.userId!==userId){
     return Promise.reject(controllerError.cantUpdateOwnProfile)
     }*!/

// console.log(`before upload photo ========> `)
// console.log(`e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path ========> ${e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path}`)
// console.log(`serPhotoConfiguration.maxSizeInByte ========> ${userPhotoConfiguration.maxSizeInByte}`)
// console.log(`e_fileSizeUnit.KB ========> ${JSON.stringify(e_fileSizeUnit)}`)

    let tmpResult
    tmpResult=await controllerHelper.uploadFileToTmpDir_async({req:req,uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path,maxFileSizeInByte:userPhotoConfiguration.maxSizeInByte,fileSizeUnit:e_fileSizeUnit.KB})
// console.log(`after upload photo result ========> ${JSON.stringify(tmpResult)}`)
    // let path=tmpResult.msg['filePath']
    let {originalFilename,path,size}=tmpResult.msg
    // console.log(`file path ========> ${JSON.stringify(path)}`)
    // console.log(`multipart size===${size}`)

    //检查size(width&&height)不符合，直接返回错误（而不是试图转换）,因为在client已经确保了height和width的正确
    let inst=gmImage.initImage(path)
    // console.log(`inst ====>${JSON.stringify(inst)}`)
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.SIZE)
// console.log(`gm size ====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.msg.width>userPhotoConfiguration.maxWidth || tmpResult.msg.height>userPhotoConfiguration.maxHeight){
        fs.unlinkSync(path)
        return Promise.reject(controllerError.imageSizeInvalid)
    }

    /!*              选择存储路径               *!/
    //读取所有avaliable的存储路径，挑选usedSize最小的那个
    let choosenStorePathRecord
    tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.DB.USER_PHOTO})
// console.log(`choosen tmpResult ====> ${JSON.stringify(tmpResult)}`)
    choosenStorePathRecord=misc.objectDeepCopy(tmpResult)
     // console.log(`choosen store path recorder ====> ${JSON.stringify(choosenStorePathRecord)}`)


    /!*              将文件从临时目录转移（转换）到选择的路径                *!/
    //保存到指定位置
// console.log(`originalFilename ==== ${originalFilename}`)
    let md5NameWithoutSuffix=hash(`${originalFilename}${Date.now()}`,e_hashType.MD5)
    let finalFileName=`${md5NameWithoutSuffix.msg}.${userPhotoConfiguration.imageType[0].toLowerCase()}`

    let finalPath=choosenStorePathRecord.path+finalFileName

 // console.log(`path ==== ${path}`)
    // console.log(`finalPath ==== ${finalPath}`)
    //格式不同，直接转换到指定位置
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.FORMAT)
    // console.log(`tmpResult ==== ${JSON.stringify(tmpResult)}`)
    if(-1===userPhotoConfiguration.imageType.indexOf(tmpResult.msg)){
        // console.log(`path ==== ${path}`)
        await gmImage.gmCommand_async(inst,e_gmCommand.CONVERT_FILE_TYPE,finalPath)
        let newInst=gmImage.initImage(finalPath)
        // console.log(`finalPath ====》 ${finalPath}`)
        tmpResult=await  gmImage.getImageProperty_async(newInst,e_gmGetter.FILE_SIZE)
        let tmpSize=tmpResult.msg.sizeNum,tmpUnit=tmpResult.msg.sizeUnit

        tmpResult=misc.convertFileSize({num:tmpSize,unit:tmpUnit,newUnit:e_fileSizeUnit.KB})
        size=tmpResult.msg
        // console.log(`conveter size ====》 ${size}`)
        fs.unlinkSync(path)
    }
    //格式符合，移动指定位置
    else{
        fs.renameSync(path,finalPath)
    }
    // console.log(`final size========>${JSON.stringify(size)}`)



    /!*          获得原始user记录，来对比原始文件size和当前文件size，并获得原始文件地址来删除文件，         *!/
    //获得2个数据：populateUserRec（原始用户数据），sizeToBeAddInDB（新文件和就文件的size差值）
 // console.log(`userId===>${JSON.stringify(userId)}`)
    let oldPhotoFile,originalUserInfo,originalStorePath
    tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:dbModel.user,id:userId})
    originalUserInfo=misc.objectDeepCopy(tmpResult)
    // console.log(`originalUserInfo=======> ${JSON.stringify(originalUserInfo)}`)
    // mongoose 4.11.4 has issue about populate
    /!*
     // console.log(`user info===>${JSON.stringify(tmpResult)}`)
     let populateUserRec=await populateSingleDoc_async(originalUserInfo,mongoConfiguration.populateOpt[e_coll.USER],mongoConfiguration.populatedFields[e_coll.USER])
     oldPhotoFile=populateUserRec.msg[e_field.STORE_PATH.PATH]+populateUserRec.msg[e_field.USER.PHOTO_HASH_NAME]
     console.log(`populated User info===>${JSON.stringify(populateUserRec)}`)
     *!/
    //有原始的头像，那么要先删除
    if(undefined!==originalUserInfo[e_field.USER.PHOTO_PATH_ID]){
        // console.log(`photoPathId===>${JSON.stringify(originalUserInfo['photoPathId'])}`)
        tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:dbModel.store_path,id:originalUserInfo['photoPathId']})
        originalStorePath=misc.objectDeepCopy(tmpResult)
        // console.log(`originalStorePath===>${JSON.stringify(originalStorePath)}`)
        oldPhotoFile=originalStorePath[e_field.STORE_PATH.PATH]+originalUserInfo[e_field.USER.PHOTO_HASH_NAME]
        // console.log(`oldPhotoFile===>${JSON.stringify(oldPhotoFile)}`)
        fs.unlinkSync(oldPhotoFile)
    }


    /!*                  更新db                    *!/
    //如果原来的存储目录存在，且选择的存储目录和原来的存储目录不一致，那么，首先在原始存储路径的usedSize减去originalFileSize，然后在新存储路径的usedSize加上uploadFileSize
    if(undefined!==originalUserInfo[e_field.USER.PHOTO_PATH_ID] && originalUserInfo[e_field.USER.PHOTO_PATH_ID]!==choosenStorePathRecord['_id']){
        // console.log(`in====>`)
        let updateValues={usedSize:originalStorePath[e_field.STORE_PATH.USED_SIZE]-originalUserInfo[e_field.USER.PHOTO_SIZE]}
        //如果有原始storePath，那么删除后要重新计算，是否可以再次使用
        controllerHelper.setStorePathStatus({originalStorePathRecord:originalStorePath,updateValue:updateValues,e_field:e_field})
        // console.log(`new update Values========>${JSON.stringify(updateValues)}`)
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.store_path,id:originalUserInfo[e_field.USER.PHOTO_PATH_ID],updateFieldsValue:updateValues})
        updateValues={usedSize:choosenStorePathRecord[e_field.STORE_PATH.USED_SIZE]+size}
        //新选择的storePath，是否超出了门限
        controllerHelper.setStorePathStatus({originalStorePathRecord:originalStorePath,updateValue:updateValues,e_field:e_field})
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.store_path,id:choosenStorePathRecord['_id'],updateFieldsValue:updateValues})
    }
    //如果原先没有存储路径或者选择的存储目录和原来的存储目录一致，那么只要更新原始存储路径的usedSize
    if(undefined===originalUserInfo[e_field.USER.PHOTO_PATH_ID] || originalUserInfo[e_field.USER.PHOTO_PATH_ID]===choosenStorePathRecord['_id']){
        // console.log(`update just choosen store path`)
        // console.log(`in1====>`)
        let originalPhotoSize=(undefined===originalUserInfo[e_field.USER.PHOTO_SIZE])? 0:originalUserInfo[e_field.USER.PHOTO_SIZE]
        let updateValues={usedSize:choosenStorePathRecord[e_field.STORE_PATH.USED_SIZE]-originalPhotoSize+size}
        //新选择的storePath，是否超出了门限
        controllerHelper.setStorePathStatus({originalStorePathRecord:choosenStorePathRecord,updateValue:updateValues})
        // console.log(`new update Values========>${JSON.stringify(updateValues)}`)
        // console.log(`updateValues===>${JSON.stringify(updateValues)}`)
        // console.log(`id===>${JSON.stringify(choosenStorePathRecord['_id'])}`)
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.store_path,id:choosenStorePathRecord['_id'],updateFieldsValue:updateValues})
    }
    //最后更新user的PHOTO_PATH_ID/PHOTO_HASH_NAME/PHOTO_SIZE
    // console.log(`finalFileName===>${JSON.stringify(finalFileName)}`)
    // console.log(`size===>${JSON.stringify(size)}`)
    // console.log(`choosenStorePathRecord['_id']===>${JSON.stringify(choosenStorePathRecord['_id'])}`)

    let  updateFieldsValueForModel={photoHashName:finalFileName,photoSize:size,photoPathId:choosenStorePathRecord['_id']}//实际update
    // console.log(`updateFieldsValueForModel===>${JSON.stringify(updateFieldsValueForModel)}`)
// console.log(`updateFieldsValueForModel===>${JSON.stringify(updateFieldsValueForModel)}`)
//     console.log(`currentEnv ${currentEnv}`)
    if(e_env.DEV===currentEnv){
        let newDocValue=dataConvert.addSubFieldKeyValue(updateFieldsValueForModel)
        // console.log(`newDocValue===>${JSON.stringify(newDocValue)}`)
        tmpResult=validateFormat.validateCURecordInfoFormat(newDocValue,inputRule[e_coll.USER])
        // console.log(`tmpResult===>${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            // console.log(`internal check value=============> ${JSON.stringify(docValue)}`)
            return Promise.reject(tmpResult)
        }
        // console.log(`newDocValue===>${JSON.stringify(newDocValue)}`)
        // console.log(`internalInputRule[e_coll.USER]===>${JSON.stringify(internalInputRule[e_coll.USER])}`)
        tmpResult=validateValue.validateUpdateRecorderValue(newDocValue,internalInputRule[e_coll.USER])
        // console.log(`internal check=============> ${JSON.stringify(tmpResult)}`)
        // tmpResult=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:user_internalInputRule,method:e_method.CREATE})
        // console.log(`updateFieldsValue   ${JSON.stringify(updateFieldsValue)}`)
        // console.log(`internalInputRule   ${JSON.stringify(internalInputRule[e_coll.USER][e_field.USER.PHOTO_DATA_URL])}`)
        // console.log(`internal check  tmpResult   ${JSON.stringify(internalInputRule[e_coll.USER][e_field.USER.PHOTO_DATA_URL]['format']['define'].test(finalFileName))}`)
        // console.log(`internal check  ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }

    }

    //存储到db中

// console.log(`updateFieldsValueForModel ${JSON.stringify(updateFieldsValueForModel)}`)
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.user,id:userId,updateFieldsValue:updateFieldsValueForModel})
    // console.log(`type ====>${JSON.stringify(type)}`)

    return Promise.resolve({rc:0})
}
*/

/*          产生captcha           */
// @captcha:
//      firstTime:session中，第一次产生captcha的时间,
//      lastTime：session中，最近一次产生的时间，
//      firstTimeInDuration: duration中，第一次captcha的时间
//      numberInDuration:在定义的时间段中，产生的次数
async function generateCaptcha_async(req){
    //第一次产生，记录产生时间
    if(undefined===req.session.captcha ){
        // console.log(`captcha not generate captcha`)
        req.session.captcha={firstTime:Date.now(),lastTime:Date.now(),numberInDuration:1,firstTimeInDuration:Date.now()}

    }
    // else if(undefined===req.session.captcha.firstTime){
    //     req.session.captcha.firstTime=Date.now()
    // }
    else{
        // req.session.captcha.numberInDuration+=1
        //2次间隔是否大于预定义
        if(captchaIntervalConfiguration.expireTimeBetween2Req>(Date.now()-req.session.captcha.lastTime)){
            return Promise.reject(controllerError.intervalBetween2CaptchaTooShort)
        }
        //单位时间内请求次数是否达到门限值
        //没有进入duration，则设置duration的第一次时间
        if(undefined===req.session.captcha.firstTimeInDuration){
            req.session.captcha.lastTime=Date.now()
            req.session.captcha.firstTimeInDuration=Date.now()
            req.session.captcha.numberInDuration=1
        }else{
            //1. duration已经超出，重新开始周期
            if((Date.now()-req.session.captcha.firstTimeInDuration)>captchaIntervalConfiguration.duration*1000){
                req.session.captcha.lastTime=Date.now()
                req.session.captcha.firstTimeInDuration=Date.now()
                req.session.captcha.numberInDuration=1
            }else{
                //   duration没有超出，比较次数是否超出定义
                //次数超出，报错
                if((req.session.captcha.numberInDuration+1)>=captchaIntervalConfiguration.numberInDuration){
                    return Promise.reject(controllerError.captchaReqNumInDurationExceed)
                }else{
                    //次数没有超出，number+1
                    req.session.captcha.lastTime=Date.now()
                    req.session.captcha.numberInDuration+=1
                }
            }
        }
    }

    let captchaString=misc.generateRandomString()
    req.session.captcha.captcha=captchaString

    //产生dataURL并返回
    return Promise.resolve({rc:0,msg:captchaString})

}

module.exports={
    uniqueCheck_async,
/*    retrievePassword_async,
    uploadPhoto_async,*/
    generateCaptcha_async,
}