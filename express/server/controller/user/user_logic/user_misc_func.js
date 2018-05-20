/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const fs=require('fs')
const ap=require(`awesomeprint`)
/**************  controller相关常量  ****************/
const controllerError=require('../user_setting/user_controllerError').controllerError
/**************  rule   ******************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule

/***************  数据库相关常量   ****************/
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const dbModel=require('../../../constant/genEnum/dbModel')

const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_randomStringType=nodeEnum.RandomStringType
const e_userState=nodeEnum.UserState
const e_env=nodeEnum.Env
const e_intervalCheckPrefix=nodeEnum.IntervalCheckPrefix

const mongoEnum=server_common_file_require.mongoEnum
const e_storePathUsage=mongoEnum.StorePathUsage
const e_docStatus=mongoEnum.DocStatus.DB

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit
const e_gmCommand=nodeRuntimeEnum.GmCommand
const e_gmGetter=nodeRuntimeEnum.GmGetter
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/**************  公共函数   ******************/
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const interval=server_common_file_require.interval
const dataConvert=server_common_file_require.dataConvert
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const gmImage=server_common_file_require.gmImage
const validateFormat=server_common_file_require.validateFormat
const validateValue=server_common_file_require.validateValue
const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType
const hash=server_common_file_require.crypt.hash
const valueTypeCheck=server_common_file_require.validateHelper.valueTypeCheck
const inputValueLogicValidCheck_async=server_common_file_require.controllerInputValueLogicCheck.inputValueLogicValidCheck_async
const redisOperation=server_common_file_require.redis_common_operation

/*************** 配置信息 *********************/
const e_uploadFileDefinitionFieldName=nodeEnum.UploadFileDefinitionFieldName
const userPhotoConfiguration=server_common_file_require.globalConfiguration.uploadFileDefine.user_photo
const userThumbImageType=server_common_file_require.globalConfiguration.uploadFileDefine.common.userPhotoType
const captchaIntervalConfiguration=server_common_file_require.globalConfiguration.intervalCheckConfiguration.captcha
const mailOption=server_common_file_require.globalConfiguration.mailOption
const mailAccount=server_common_file_require.globalConfiguration.mailAccount
const currentEnv=server_common_file_require.appSetting.currentEnv
const absolutePath=server_common_file_require.appSetting.absolutePath


const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject





/*                      检查用户名/账号的唯一性                           */
async  function  uniqueCheck_async({req}) {
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let collName=e_coll.USER
    let docValue = req.body.values[e_part.SINGLE_FIELD]

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    /********************************************************/
    /*************         接受的字段         ***************/
    /********************************************************/
    let fieldName=Object.keys(docValue)[0]
    if(-1===e_uniqueField[e_coll.USER].indexOf(fieldName)){
        return Promise.reject(controllerError.fieldNotSupport)
    }
    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    let singleUniqueAdditionalCondition
    //已经登录，unique检查需要排除自己的记录
    if(undefined!==userId){
        singleUniqueAdditionalCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE,[e_field.USER.ID]:{'$not':userId}}
    }else{
        singleUniqueAdditionalCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE}
    }
    let commonParam={docValue:docValue,userId:undefined,collName:collName}
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:false,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:false,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{true:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:singleUniqueAdditionalCondition}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.DISK_USAGE]:{flag:false,optionalParam:{resourceUsageOption:undefined}},
    }
    await inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    /*if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        //unique check，还要考虑到DOC_STATUS为done（不为done的可以重复）
        /!*                if(collName===e_coll.USER){
         condition[e_field.USER.DOC_STATUS]=e_docStatus.DONE
         }*!/
        let additionalCheckCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }*/

    // ap.inf(`indexof 111 check done`)
    return Promise.resolve({rc:0})

}

async function retrievePassword_async({req}){
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    //新产生的密码,账号对应的记录
    let tmpResult,newPwd,userId,newPwdType=e_randomStringType.NORMAL
    let condition={},condition1={}  //for account/ usedAccount
    /*          格式/值检查        */
/*    tmpResult=controllerHelper.nonCRUDPreCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.SINGLE_FIELD],
        collName:e_coll.USER,
        //e_coll:e_coll,
    })
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }*/


    /*                  logic               */
    let docValue = req.body.values[e_part.SINGLE_FIELD]
    /*              参数转为server格式（SINGLE_FIELD和RECORD_INFO格式一致）            */
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
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
        newPwd=misc.generateRandomString({len:6,type:newPwdType})
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
                newPwd=misc.generateRandomString({len:6,type:newPwdType})
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


}

/*  以dataUrl方式保存头像
* */
async function uploadDataUrlPhoto_async({req}){
    // ap.inf('uploadDataUrlPhoto_async in')
    /*             检查用户是否在更新 自己 的头像           */
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    let tmpResult
    if(undefined===req.body.values[e_part.SINGLE_FIELD][e_field.USER.PHOTO_DATA_URL]){
        return Promise.reject(controllerError.uploadUserPhoto.expectedFieldValueUndefined)
    }
    //转换成文件，以便gm读取解析度
    let dataUrl=req.body.values[e_part.SINGLE_FIELD][e_field.USER.PHOTO_DATA_URL]
    let fileNameWithoutExtension=`${userId}_${Date.now()}`
    let filePath=absolutePath.tmpImage
    // ap.inf('uploadPhoto_async in')
    let fileAbsPath=await misc.dataUrl2File_returnFileAbsPath_async({dataUrl:dataUrl,fileNameWithoutExtension:fileNameWithoutExtension,filePath:filePath})
    // ap.inf('fileAbsPath',fileAbsPath)

    let inst=gmImage.initImage(fileAbsPath)
    // ap.inf('inst done')
    //检查size(width&&height)不符合，直接返回错误（而不是试图转换）,因为在client已经确保了height和width的正确
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.SIZE)
    // ap.inf('size',tmpResult)
    if(tmpResult.width>userPhotoConfiguration.maxWidth || tmpResult.height>userPhotoConfiguration.maxHeight){
        fs.unlinkSync(fileAbsPath)
        return Promise.reject(controllerError.uploadUserPhoto.imageSizeInvalid)
    }
// ap.inf('size done')
    //检查文件大小
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.FILE_SIZE)
    let tmpSize=tmpResult.sizeNum,tmpUnit=tmpResult.sizeUnit
    tmpResult=misc.convertFileSize({num:tmpSize,unit:tmpUnit,newUnit:undefined})
    if(tmpResult.msg>userPhotoConfiguration.maxSizeInByte){
        fs.unlinkSync(fileAbsPath)
        return Promise.reject(controllerError.uploadUserPhoto.imageSizeInvalid)
    }
    // ap.inf('file size done')
    //格式不同，返回错误
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.FORMAT)
    // console.log(`tmpResult ==== ${JSON.stringify(tmpResult)}`)
    if(-1===userThumbImageType.indexOf(tmpResult)){
        fs.unlinkSync(fileAbsPath)
        return Promise.reject(controllerError.uploadUserPhoto.imageFormatInvalid)
    }


    fs.unlinkSync(fileAbsPath)
    // ap.inf('format done')

    //存储到db中

// console.log(`updateFieldsValueForModel ${JSON.stringify(updateFieldsValueForModel)}`)
//     ap.inf('updateFieldsValueForModel',updateFieldsValueForModel)
//     ap.inf('userId',userId)
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.user,id:userId,updateFieldsValue:{[e_field.USER.PHOTO_DATA_URL]:dataUrl}})
    // console.log(`type ====>${JSON.stringify(type)}`)
    // ap.inf('save to db done')

    return Promise.resolve({rc:0})
}


/*  以文件的格式保存头像
* */
async function uploadFilePhoto_async({req}){
    /*             检查用户是否在更新 自己 的头像           */
    // ap.inf('req method',req.body.values.method)
    // console.log(`uploadPhoto_async in`)
    // console.log(`uploadPhoto_async req.body====>${JSON.stringify(req.param)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId


    let tmpResult
    tmpResult=await controllerHelper.uploadFileToTmpDir_async({req:req,uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path,maxFileSizeInByte:userPhotoConfiguration.maxSizeInByte,fileSizeUnit:e_fileSizeUnit.KB})
// console.log(`after upload photo result ========> ${JSON.stringify(tmpResult)}`)
    // let path=tmpResult.msg['filePath']
    let {originalFilename,path,size}=tmpResult
    // console.log(`file path ========> ${JSON.stringify(path)}`)
    // console.log(`multipart size===${size}`)

    //检查size(width&&height)不符合，直接返回错误（而不是试图转换）,因为在client已经确保了height和width的正确
    let inst=gmImage.initImage(path)
    // console.log(`inst ====>${JSON.stringify(inst)}`)
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.SIZE)
// console.log(`gm size ====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.width>userPhotoConfiguration.maxWidth || tmpResult.height>userPhotoConfiguration.maxHeight){
        fs.unlinkSync(path)
        return Promise.reject(controllerError.imageSizeInvalid)
    }

    /*              选择存储路径               */
    //读取所有avaliable的存储路径，挑选usedSize最小的那个
    let choosenStorePathRecord
    tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.DB.USER_PHOTO})
// ap.inf('chooseStorePath_async result',tmpResult)
    choosenStorePathRecord=misc.objectDeepCopy(tmpResult)
    // console.log(`choosen store path recorder ====> ${JSON.stringify(choosenStorePathRecord)}`)


    /*              将文件从临时目录转移（转换）到选择的路径                */
    //保存到指定位置
// console.log(`originalFilename ==== ${originalFilename}`)
    let md5NameWithoutSuffix=hash(`${originalFilename}${Date.now()}`,e_hashType.MD5)
    let finalFileName=`${md5NameWithoutSuffix.msg}.${userThumbImageType[0].toLowerCase()}`

    let finalPath=choosenStorePathRecord.path+finalFileName
// ap.inf('finalPath',finalPath)
    // console.log(`path ==== ${path}`)
    // console.log(`finalPath ==== ${finalPath}`)
    //格式不同，直接转换到指定位置
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.FORMAT)
    // console.log(`tmpResult ==== ${JSON.stringify(tmpResult)}`)
    if(-1===userThumbImageType.indexOf(tmpResult)){
        // console.log(`path ==== ${path}`)
        await gmImage.gmCommand_async({gmInst:inst, command:e_gmCommand.CONVERT_FILE_TYPE,savePath:finalPath,sizeParameter:undefined})
        let newInst=gmImage.initImage(finalPath)
        // console.log(`finalPath ====》 ${finalPath}`)
        tmpResult=await  gmImage.getImageProperty_async(newInst,e_gmGetter.FILE_SIZE)
        let tmpSize=tmpResult.sizeNum,tmpUnit=tmpResult.sizeUnit

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
    // ap.inf('final size',size)


    /*          获得原始user记录，来对比原始文件size和当前文件size，并获得原始文件地址来删除文件，         */
    //获得2个数据：populateUserRec（原始用户数据），sizeToBeAddInDB（新文件和就文件的size差值）
    // console.log(`userId===>${JSON.stringify(userId)}`)
    let oldPhotoFile,originalUserInfo,originalStorePath
    tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:dbModel.user,id:userId})
    originalUserInfo=misc.objectDeepCopy(tmpResult)
    // ap.inf('originalUserInfo',originalUserInfo)
    // console.log(`originalUserInfo=======> ${JSON.stringify(originalUserInfo)}`)
    // mongoose 4.11.4 has issue about populate
    /*
     // console.log(`user info===>${JSON.stringify(tmpResult)}`)
     let populateUserRec=await populateSingleDoc_async(originalUserInfo,mongoConfiguration.populateOpt[e_coll.USER],mongoConfiguration.populatedFields[e_coll.USER])
     oldPhotoFile=populateUserRec.msg[e_field.STORE_PATH.PATH]+populateUserRec.msg[e_field.USER.PHOTO_HASH_NAME]
     console.log(`populated User info===>${JSON.stringify(populateUserRec)}`)
     */
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


    /*                  更新db                    */
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
        // ap.inf('updateFieldsValueForModel',updateFieldsValueForModel)
        // let newDocValue=dataConvert.addSubFieldKeyValue(updateFieldsValueForModel)
        // ap.inf('newDocValue',newDocValue)
        // console.log(`newDocValue===>${JSON.stringify(newDocValue)}`)
        tmpResult=validateFormat.validateCURecordInfoFormat(newDocValue,inputRule[e_coll.USER])
        // console.log(`tmpResult===>${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            // console.log(`internal check value=============> ${JSON.stringify(docValue)}`)
            return Promise.reject(tmpResult)
        }
        // console.log(`newDocValue===>${JSON.stringify(newDocValue)}`)
        // console.log(`internalInputRule[e_coll.USER]===>${JSON.stringify(internalInputRule[e_coll.USER])}`)
        // tmpResult=validateValue.validateUpdateRecorderValue(newDocValue,internalInputRule[e_coll.USER])
        /*        let applyRange,method=req.body.values.method
                switch (method){
                    case e_method.CREATE:
                        applyRange=e_applyRange.CREATE
                        break;
                        case e_method.UPDATE
                }
                if(method===e_method){

                }*/
// ap.inf('start to validate')
        tmpResult=validateValue.validateScalarInputValue({inputValue:newDocValue,collRule:internalInputRule[e_coll.USER],p_applyRange:e_applyRange.UPDATE_SCALAR})

        // ap.inf('validate result',tmpResult)       // console.log(`internal check=============> ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }

    }

    //存储到db中

// console.log(`updateFieldsValueForModel ${JSON.stringify(updateFieldsValueForModel)}`)
//     ap.inf('updateFieldsValueForModel',updateFieldsValueForModel)
//     ap.inf('userId',userId)
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.user,id:userId,updateFieldsValue:updateFieldsValueForModel})
    // console.log(`type ====>${JSON.stringify(type)}`)

    return Promise.resolve({rc:0})
}
/*          产生captcha           */
/*  使用的key
	1. sessionId.captcha: lastOkRequestTime。list，记录最近合格的请求的时间，TTL=duration
*/
/*@captcha:
     @firstTime:session中，第一次产生captcha的时间,
     @lastTime：session中，最近一次产生的时间，

     @firstTimeInDuration: duration中，第一次captcha的时间


     @expireTimeOfRejectTimes：rejectTimes的存在时间
     @rejectTimesThreshold；最多有几次rejectTimes之后，要设置rejectFlag，并加上对应的处罚时间

中间值：
    rejectFlag：当用户请求 在 expireTimeOfRejectTimes 时间段内 rejectTimes达到rejectTimesThreshold后，设置，以便检测时直接
    rejectTimes：

    1. 检测是否为第一次请求，如果是，初始化对应的数据，并直接返回，继续下一步
        如果不是第一次请求，
    2. 检测reject flag是否存在，存在，直接报错，并返回报错
    3. 如果reject flag不存在，检测当前请求是否要reject
        3.1 当前请求距离上次请求是否超出expireTimeBetween2Req，超出，reject
        3.2 当前duration内，请求次数+1是否超出numberInDuration，超出，reject
    4. 产生了reject
        4.1 如果rejectTimes不存在，直接设置为1，并设置ttl为[10,30,60,300,600]中的最小值10，并返回报错
        4.2 如果rejectTimes存在
            4.2.1 首先rejectTimes+1，然后检测rejectTimes超出rejectTimesThreshold的次数，如果此处小于等于0，index为0，然后根据index从数组中获得对应的ttl，重置rejectFlag和rejectTimes的ttl，然后返回报错

     */
async function generateCaptcha_async({req}){
    // ap.inf('generateCaptcha_async in ')
    //首先检查是否可以处理req
    //captcha为constant/config/globalConfiguration下intervalCheckConfiguration的一个键值
    // await interval.checkInterval_async({req:req,reqTypePrefix:e_intervalCheckPrefix.CPATCHA})
// ap.inf('checkInterval_async pass')
    let result=await controllerHelper.genCaptchaAdnSave_async({req:req,params:{height:33},db:2})
    // ap.inf('genCaptchaAdnSave_async result',result)
    return Promise.resolve({rc:0,msg:result})
    // return Promise.resolve({rc:0,msg:'test'})
}

/*async function checkCaptcha_async({req}){
    await controllerHelper.getCaptchaAndCheck_async({req:req})
/!*    let clientInputCaptcha=req.body.values[e_part.CAPTCHA]
    let serverCaptcha=*!/
}*/
/*
* 输入只能包含RECORD_INFO，RECORD_INFO中只能包含oldPassword/newPassword
*
* */
async function changePassword_async({req}){
    /********************************************************/
    /***                自定义 对 RECORD_INFO 检查        ***/
    /********************************************************/
    //检查需要的部分是否存在：recordInfo
    let inputValue=req.body.values
    if(undefined===req.body.values
        || undefined===req.body.values[e_part.RECORD_INFO]
        || undefined===req.body.values[e_part.RECORD_INFO]['oldPassword']
        || undefined===req.body.values[e_part.RECORD_INFO]['newPassword']
    ){
        return Promise.reject(controllerError.changePasswordInputRecordInfoFormatInCorrect)
    }

    //提取需要的部分
    let expectValue={
        // [e_part.METHOD]:e_method.UPDATE,
        [e_part.RECORD_INFO]:{
            'oldPassword':req.body.values[e_part.RECORD_INFO]['oldPassword'],
            'newPassword':req.body.values[e_part.RECORD_INFO]['newPassword'],
        }
    }

    //判断输入是否只包含了需要的部分
    if(JSON.stringify(req.body.values) !== JSON.stringify(expectValue)){
        return Promise.reject(controllerError.changePasswordInputFormatNotExpected)
    }

    //判断字段的值是否符合格式
    let allFieldsName=['oldPassword','newPassword']
    let docValue=req.body.values[e_part.RECORD_INFO]
    for(let singleInputFieldName of allFieldsName){
        //1. 是否require
        if(undefined===docValue[singleInputFieldName]|| null===docValue[singleInputFieldName]){
            return Promise.reject(controllerError.missMandatoryField)
        }
        //2. 检查类型
        let dataType=browserInputRule.user.password.dataType
        let fieldValue=docValue[singleInputFieldName]
        if(true!==valueTypeCheck(fieldValue,dataType)){
            return Promise.reject(controllerError.fieldValueTypeIncorrect)
        }
        //3. 检查格式
        let fieldPattern=browserInputRule.user.password.format.define
        if(false===fieldPattern.test(fieldValue)){
            return Promise.reject(controllerError.fieldValueFormatIncorrect)
        }
    }
    //比较输入新旧password，如果一样，直接返回(非正常从client输入，尽早返回)
    if(docValue['oldPassword']===docValue['newPassword']){
        return Promise.resolve({rc:0})
    }

    /**********************************************/
    /********            业务逻辑        *********/
    /*********************************************/
    //检查oldPassword是否正确
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority}=userInfo
    //查找hash过的password和salt
    let userRecord=await common_operation_model.findById_returnRecord_async({dbModel:dbModel.user,id:userId})
    let userSaltRecord=await common_operation_model.find_returnRecords_async({dbModel:dbModel.sugar,condition:{[e_field.SUGAR.USER_ID]:userId}})

    let hashedInputOldPassword=hash(`${docValue['oldPassword']}${userSaltRecord[0][e_field.SUGAR.SUGAR]}`,e_hashType.SHA256)

    if(hashedInputOldPassword.rc>0){
        return Promise.reject(hashedInputOldPassword)
    }
    // ap.inf('hashedInputOldPassword',hashedInputOldPassword)
    // ap.inf('userRecord[0][e_field.USER.PASSWORD]',userRecord)
    //比较输入的hash和db中的hash
    if(hashedInputOldPassword.msg!==userRecord[e_field.USER.PASSWORD]){
        return Promise.reject(controllerError.oldPasswordIncorrect)
    }



    //hash输入的新密码，并写入db
    let hashedInputNewPassword=hash(`${docValue['newPassword']}${userSaltRecord[0][e_field.SUGAR.SUGAR]}`,e_hashType.SHA256)
    if(hashedInputNewPassword.rc>0){
        return Promise.reject(hashedInputNewPassword)
    }
    let result=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:dbModel.user,id:userId,updateFieldsValue:{[e_field.USER.PASSWORD]:hashedInputNewPassword.msg}})
    return Promise.resolve({rc:0})
}
module.exports={
    uniqueCheck_async,
    retrievePassword_async,
    uploadDataUrlPhoto_async,
    uploadFilePhoto_async,

    generateCaptcha_async,
    // checkCaptcha_async,

    changePassword_async,
}