/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




const fs=require('fs')

const e_userState=require('../../constant/enum/node').UserState
const e_part=require('../../constant/enum/node').ValidatePart
const e_method=require('../../constant/enum/node').Method
const e_randomStringType=require('../../constant/enum/node').RandomStringType
// const e_method=require('../../constant/enum/node').Method

const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_accountType=require('../../constant/enum/mongo').AccountType.DB
const e_articleStatus=require('../../constant/enum/mongo').ArticleStatus.DB

const currentEnv=require('../../constant/config/appSetting').currentEnv

const e_dbModel=require('../../model/mongo/dbModel')
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const helper=require('../helper')
const common_operation_model=require('../../model/mongo/operation/common_operation_model')
const hash=require('../../function/assist/crypt').hash

const misc=require('../../function/assist/misc')
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/

const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule

const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=require('../../constant/regex/regex').regex

const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount

/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */
const gmImage=require('../../function/assist/gmImage')
const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
const uploadFile=require('../../function/assist/upload')

/*         generate captcha         */
const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const controllerError={
    /*          common              */
    fieldAlreadyExist(chineseFieldName,fieldInputValue){return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},
    /*          create new article              */
    userNotLoginCantCreate:{rc:50201,msg:`用户尚未登录，无法新建文档`},

    /*          update article              */
    userNotLoginCantUpdate:{rc:50202,msg:`用户尚未登录，无法新建文档`},
    notAuthorized:{rc:50202,msg:`无权更改次文档`},
    notAuthorizedFolder:{rc:50204,msg:`无权在目录中添加文档`},
}


//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher_async(req){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let expectUserState,expectedPart,collName=e_coll.ARTICLE,result

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    result=helper.dispatcherPreCheck({req:req})
    if(result.rc>0){
        return Promise.reject(result)
    }


    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]


    switch (method){
        case e_method.CREATE: //create
            /*      检测用户是否登录        */
            if(undefined===req.session.userId){
                return Promise.reject(controllerError.userNotLoginCantCreate)
            }
            // console.log(`create in`)
            //首先检查method是否存在，且格式/值是否正确。不同的method可能对应不同的参数配置

            expectedPart=[]//无需任何part
            //因为dispatch而已经检查过req的总体结构，所以无需再次检查，而直接检查partValueFormat+partValueCheck
            // result=helper.CRUDPreCheck({req:req,expectUserState:expectUserState,expectedPart:expectedPart,collName:collName,method:method})
            result=helper.CRUDPreCheck({req:req,expectedPart:expectedPart,collName:collName,method:method})
            // console.log(`create preCheck result ====》${JSON.stringify(result)}`)
            if(result.rc>0){
                return Promise.reject(result)
            }
            result=await createArticle_async(req)

            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            /*      检测用户是否登录        */
            if(undefined===req.session.userId){
                return Promise.reject(controllerError.userNotLoginCantUpdate)
            }
            /*      检测输入的format和value是否正确        */
            expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]//无需method
            //因为dispatch而已经检查过req的总体结构，所以无需再次检查，而直接检查sess+partValueFormat+partValueCheck
            result=helper.CRUDPreCheck({req:req,expectUserState:expectUserState,expectedPart:expectedPart,collName:collName,method:method})
            // console.log(`create preCheck result ${JSON.stringify(result)}`)
            if(result.rc>0){
                return Promise.reject(result)
            }

            /*      执行逻辑                */
            result=await updateArticle_async(req)
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            // console.log(`req.session login is ${JSON.stringify(req.session)}`)
            expectUserState=e_userState.NO_SESS
            expectedPart=[e_part.RECORD_INFO]
            result=helper.CRUDPreCheck({req:req,expectUserState:expectUserState,expectedPart:expectedPart,collName:collName,method:method})
            // console.log(`match CRUDPreCheck ${JSON.stringify(result)}`)
            if(result.rc>0){
                return Promise.reject(result)
            }
            result=await login_async(req)
            // console.log(`match result ${JSON.stringify(result)}`)
    }
    
    return Promise.resolve(result)
}

/*              新article无任何输入，所有的值都是内部产生                */
async  function createArticle_async(req){

/*                      logic                               */
    //直接产生内部数据
    let tmpResult,userId,docValue

    userId=req.session.userId
    console.log(`userId ====>${userId}`)
    /*                  添加内部产生的值（name && status && authorId && folderId）                  */
    docValue={}
    docValue[e_field.ARTICLE.NAME]="新建文档"
    docValue[e_field.ARTICLE.AUTHOR_ID]=req.session.userId
    docValue[e_field.ARTICLE.STATUS]=e_articleStatus.EDITING
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.folder,condition:{authorId:userId,name:'我的文档'}})
    docValue[e_field.ARTICLE.FOLDER_ID]=tmpResult.msg[0]['id']
console.log(`docValue is ====>${JSON.stringify(docValue)}`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        let newDocValue=dataConvert.addSubFieldKeyValue(docValue)
        //检查格式
        tmpResult=validateCURecordInfoFormat(newDocValue,inputRule[e_coll.ARTICLE])
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
        //检查数据
        tmpResult=validateCreateRecorderValue(newDocValue,internalInputRule[e_coll.ARTICLE])
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }


    //插入db
    tmpResult= await common_operation_model.create({dbModel:e_dbModel.article,value:docValue})
    console.log(`create result is ====>${JSON.stringify(tmpResult)}`)
    return Promise.resolve({rc:0,msg:tmpResult.msg})
}


/*
* 更新文档
* 1. 需要当前用户是否有权修改文档（为文档作者）
* 2. 需要检查html中的image是否在磁盘上存在
* 3. 检查tag(传入为字符)是否存在，不存在，在coll tag中新建记录，最终用objectId替换字符
* 4. 检查是否选择了folder（输入为objectId），如果选择了，folder是否为当前用户所有
* */
async function updateArticle_async(req){
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*                  用户有权修改文档否                            */
    let tmpResult
    let userId=req.session.userId
    let articleId=req.body.values[e_part.RECORD_ID]
    let originalArticle
    //查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改
    let condition={}
    condition['_id']=articleId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
    tmpResult=await  common_operation_model.find({dbModel:e_dbModel.article,condition:condition})
    if(tmpResult.msg.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    originalArticle=misc.objectDeepCopy({},tmpResult.msg[0])

    /*              client数据转换                  */
    let docValue=req.body.values[e_part.RECORD_INFO]
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[e_coll.USER])

    // let result=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=result.msg[e_field.USER.]

    /*              剔除value没有变化的field            */
    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)
    // console.log(`originUserInfo value ${JSON.stringify(originUserInfo)}`)
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]===originalArticle[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }


    /*              检测某些字段                  */
    //1. content中包含的图片是否已经被删除，删除的话，需要同时在磁盘上删除对应的文件，以便节省空间
    let htmlContent=req.body.values[e_field.ARTICLE.HTML_CONTENT]
    let innerImageInArticle=htmlContent.match(regex.hashImageName)
    let articleImageCondition={}
    articleImageCondition[e_field.ARTICLE_IMAGE.ARTICLE_ID]=articleId
    //读取article的所有图片文件信息
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.article_image,condition:articleImageCondition})
    if(innerImageInArticle.length>0){

    }
    //2. 如果有tag，检测是否已经在coll中存在。存在：从字符转换成objectId，不存在，coll tag中创建一个新的，并获得objectId
    if(undefined!==docValue[e_field.ARTICLE.TAGS_ID]){
        for(let idx in docValue[e_field.ARTICLE.TAGS_ID]){
            let tmpCondition={}
            tmpCondition[e_field.TAG.NAME]=docValue[e_field.ARTICLE.TAGS_ID][idx]
            tmpResult=await common_operation_model.find({dbModel:e_dbModel.tag,condition:tmpCondition})
            //tag已经存在，用objectId替换掉原来的字符
            if(tmpResult.msg.length===1){
                docValue[e_field.ARTICLE.TAGS_ID][idx]=tmpResult.msg[0]['_id']
            }else{
            //tag 不存在，创建一个新的tag，并保存返回的objectId
                tmpResult=await common_operation_model.create({dbModel:e_dbModel.tag,value:{name:docValue[e_field.ARTICLE.TAGS_ID][idx]}})
                docValue[e_field.ARTICLE.TAGS_ID][idx]=tmpResult.msg['_id']
            }
        }

    }
    //3. 如果有folder，检测folder的owner是否为当前用户
    if(undefined!==docValue[e_field.ARTICLE.FOLDER_ID]){
        condition={}
        condition[e_field.FOLDER.AUTHOR_ID]=userId
        condition['_id']=docValue[e_field.ARTICLE.FOLDER_ID]
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.folder,condition:condition})
        if(tmpResult.msg.length!==1){
            return Promise.reject(controllerError.notAuthorizedFolder)
        }
    }

    /*              获得internal field，并进行检查                  */
    let internalValue=docValue[e_field.ARTICLE.TAGS_ID]
    if(e_env.DEV===currentEnv){
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[e_coll.ARTICLE],collInternalRule:internalInputRule[e_coll.ARTICLE]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    // Object.assign(docValue,internalValue)


    /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[e_coll.ARTICLE]){
        for(let singleFieldName in docValue){
            if(-1!==e_uniqueField[e_coll.ARTICLE].indexOf(singleFieldName)){
                let ifExist=await helper.ifFieldValueExistInColl_async({dbModel:e_dbModel.article,fieldName:singleFieldName,fieldValue:docValue[singleFieldName]})
// console.log(`singleFieldName: ${singleFieldName}===fieldValue: ${docValue[singleFieldName]}===ifExist ${ifExist}`)
                if(true===ifExist.msg){
                    let chineseName=inputRule[e_coll.ARTICLE][singleFieldName]['chineseName']
                    let fieldInputValue=docValue[singleFieldName]
                    return Promise.reject(controllerError.fieldAlreadyExist(chineseName,fieldInputValue))
                }
            }
        }
    }


    /*              更新数据            */
    tmpResult=await common_operation_model.update({dbModel:e_dbModel[e_coll.ARTICLE],id:articleId,values:docValue})
    return Promise.resolve({rc:0})

}









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
    let userResult = await common_operation_model.find({dbModel: dbModel.user,condition:condition})
    // if(userResult.rc>0){
    //     return Promise.reject(userResult)
    // }
    if(0===userResult.rc && 0===userResult.msg.length){
        return Promise.reject(controllerError.accountNotExist)
    }
    // console.log(`userResult ${JSON.stringify(userResult)}`)
    condition={userId:userResult.msg[0]['id']}
    let sugarResult = await common_operation_model.find({dbModel: dbModel.sugar,condition:condition})
    if(sugarResult.rc>0){
        return Promise.reject(sugarResult)
    }
    // console.log(`sugarResult ${JSON.stringify(sugarResult)}`)

    let encryptPassword=hash(`${docValue[e_field.USER.PASSWORD]}${sugarResult.msg[0][e_field.SUGAR.SUGAR]}`,e_hashType.SHA256)
    // console.log(`encryptPassword ${JSON.stringify(encryptPassword)}`)
    if(encryptPassword.rc>0){
        return Promise.reject(encryptPassword)
    }

    // console.log(`user/pwd  ${docValue[e_field.USER.ACCOUNT]}///${encryptPassword.msg}`)
    if(userResult.msg[0][e_field.USER.PASSWORD]!==encryptPassword['msg']){
        return Promise.reject(controllerError.accountPasswordNotMatch)
    }

    /*
    *  需要设置session
    * */
    // console.log(`userResult.msg[0]['id'] ${JSON.stringify(userResult.msg[0]['id'])}`)
    req.session.userId=userResult.msg[0]['id']

    return Promise.resolve({rc:0})
}



/*                      检查用户名/账号的唯一性                           */
async  function  uniqueCheck_async(req) {
    // console.log(`unique check is ${JSON.stringify(req.body.values)} `)


    let result=helper.nonCRUDreCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.SINGLE_FIELD],
        collName:e_coll.USER
    })
    // console.log(`precheck result is ${JSON.stringify(result)}`)
    if(result.rc>0){
        return Promise.reject(result)
    }


    /*                  logic               */
    let docValue = req.body.values[e_part.SINGLE_FIELD]
    /*              参数转为server格式（SINGLE_FIELD和RECORD_INFO格式一致）            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // dataConvert.constructCreateCriteria(docValue)
// console.log(`docValue ${JSON.stringify(docValue)}`)

    //读取字段名，进行不同的操作（userUnique或者passowrd格式）
    let fieldName=Object.keys(docValue)[0]
    let fieldValue=Object.values(docValue)[0]
    // let condition
    // let uniqueCheck_asyncResult
// console.log(`fieldName ${fieldName}`)
//     console.log(`fieldValue ${fieldValue}`)
//     console.log(`e_uniqueField[e_coll] ${JSON.stringify(e_uniqueField[e_coll.USER])}`)
    if(-1===e_uniqueField[e_coll.USER].indexOf(fieldName)){
        return Promise.reject(controllerError.fieldNotSupport)
    }
// console.log(`indexof check done`)
    let ifAlreadyExist=await helper.ifFieldValueExistInColl_async({dbModel:dbModel[e_coll.USER],fieldName:fieldName,fieldValue:fieldValue})
    // console.log(`ifAlreadyExist ${ifAlreadyExist}`)
    if(true===ifAlreadyExist.msg){
        switch (fieldName) {
            case e_field.USER.NAME:
                return Promise.reject(controllerError.nameAlreadyExists)
            case e_field.USER.ACCOUNT:
                return Promise.reject(controllerError.accountAlreadyExists)
        }
    }


    return Promise.resolve({rc:0})

}

async function retrievePassword_async(req){
    //新产生的密码,账号对应的记录
    let result,newPwd,userId,newPwdType=e_randomStringType.NORMAL

    let condition={},condition1={}  //for account/ usedAccount
    /*          格式/值检查        */
    result=helper.nonCRUDreCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.SINGLE_FIELD],
        collName:e_coll.USER
    })
    if(result.rc>0){
        return Promise.reject(result)
    }


    /*                  logic               */
    let docValue = req.body.values[e_part.SINGLE_FIELD]
    /*              参数转为server格式（SINGLE_FIELD和RECORD_INFO格式一致）            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
// console.log(`docValue ${JSON.stringify(docValue)}`)

    //读取字段名，进行不同的操作（userUnique或者password格式）
    let fieldName=Object.keys(docValue)[0]
    let fieldValue=Object.values(docValue)[0]


    condition[e_field.USER.ACCOUNT]=fieldValue
    condition[e_field.USER.DOC_STATUS]=e_docStatus.DONE
    result=await common_operation_model.find({dbModel:dbModel.user,condition:condition})
    // console.log(`retrieve ped: find current account=====>${JSON.stringify(result)}`)
    if(result.msg.length>1){
        return Promise.reject(controllerError.accountNotUnique)
    }
    if(result.msg.length===1){
        userId=result.msg[0]['id']
        newPwd=generateRandomString(6,newPwdType)
    }
    //继续在usedAccount中查找
    if(result.msg.length===0){
        condition1[e_field.USER.USED_ACCOUNT]=fieldValue
        condition1[e_field.USER.DOC_STATUS]=e_docStatus.DONE
        result=await common_operation_model.find({dbModel:dbModel.user,condition:condition1})
        // console.log(`retrieve ped: find used account=====>${JSON.stringify(result)}`)
        switch (result.msg.length){
            case 0:
                return {rc:0}
            case 1:
                userId=result.msg[0]['id']
                newPwd=generateRandomString(6,newPwdType)
                break
            default:
                return Promise.reject(controllerError.accountNotUnique)
        }
    }
    // console.log(`retrieve ped: ready to hash new pwd ${JSON.stringify(newPwd)}`)
    // console.log(`userId ${JSON.stringify(userId)}`)
    //hash密码，保存到db，并发送给用户，并返回通知
    result=hash(newPwd,e_hashType.SHA256)
    if(result.rc>0){return Promise.reject(result)}

    let hashedPassword=result.msg
    // console.log(`hashedPassword ${JSON.stringify(hashedPassword)}`)
    result=await common_operation_model.findByIdAndUpdate({dbModel:dbModel.user,id:userId,updateFieldsValue:{'password':hashedPassword}})
    // console.log(`update pwd result ${JSON.stringify(result)}`)
    if(regex.email.test(fieldValue)){
        //通过mail发送新密码
        let message={}
        message['from']=mailAccount.qq
        message['to']=mailAccount.qq  //fieldValue
        message['subject']='iShare重置密码'
        message['text']= `iShare为您重新设置了密码：${newPwd}。\r\n此邮件为自动发送，请勿回复。`
        message['html']=`<p>iShare为您重新设置了密码：${newPwd}。</p><p>此邮件为自动发送，请勿回复。</p>`
        result=await sendVerificationCodeByEmail_async(message)
        return Promise.resolve(result)
    }
    if(regex.mobilePhone.test(fieldValue)){
        //通过手机发送新密码

    }


}


async function uploadPhoto_async(req){
    /*             检查用户是否在更新自己的头像           */
    let userId=req.session.userId
    if(undefined===req.session.userId){
        return Promise.reject(controllerError.notLogin)
    }
    if(req.session.userId!==userId){
        return Promise.reject(controllerError.cantUpdateOwnProfile)
    }

    let tmpResult
    let uploadOption={
        // maxFilesSize:2097152,
        maxFilesSize:userPhotoConfiguration.size,//300k   头像文件大小100k
        maxFileNumPerTrans:1,//每次只能上传一个头像文件
        // maxFields:1,
        name:'file',
        uploadDir:userPhotoConfiguration.tmpSaveDir
    }
    //检查上传参数设置的是否正确
    tmpResult=uploadFile.checkOption(uploadOption)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //读取上传的文件，获得文件按信息
    tmpResult=await uploadFile.formParse_async(req,uploadOption)
    let {originalFilename,path,size}=tmpResult.msg[0]
    // console.log(`originalFilename===${originalFilename}`)
    // console.log(`path===${path}`)
    // console.log(`size===${size}`)

    // fs.unlinkSync(path)
    //size(width&&height)不符合，直接返回错误（而不是试图转换）,因为在client已经确保了height和width的正确
    let inst=gmImage.initImage(path)
    // console.log(`inst ====>${JSON.stringify(inst)}`)
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.SIZE)
    // console.log(`size ====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.msg.width>userPhotoConfiguration.maxWidth || tmpResult.msg.height>userPhotoConfiguration.maxHeight){
        fs.unlinkSync(originalFilename)
        return Promise.reject(controllerError.imageSizeInvalid)
    }

    //保存到指定位置
    let md5NameWithoutSuffix=hash(originalFilename,e_hashType.MD5)
    let finalFileName=`${md5NameWithoutSuffix.msg}.${userPhotoConfiguration.imageType[0].toLowerCase()}`
    let finalPath=userPhotoConfiguration.saveDir+finalFileName
    // console.log(`path ==== ${path}`)
    // console.log(`finalPath ==== ${finalPath}`)
    //格式不同，直接转换到指定位置
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.FORMAT)
    // console.log(`tmpResult ==== ${JSON.stringify(tmpResult)}`)
    if(-1===userPhotoConfiguration.imageType.indexOf(tmpResult.msg)){
        // console.log(`in ==== in}`)
        await gmImage.gmCommand_async(inst,e_gmCommand.CONVERT_FILE_TYPE,finalPath)
    }
    //格式符合，移动指定位置
    else{
        fs.renameSync(path,finalPath)
    }

    let updateFieldsValue={photoDataUrl:{value:finalFileName}},updateFieldsValueForModel={photoDataUrl:finalFileName}
    if(e_env.DEV===currentEnv){
        tmpResult=validateUpdateRecorderValue(updateFieldsValue,internalInputRule[e_coll.USER])
        // console.log(`internal check=============> ${JSON.stringify(result)}`)
        // result=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:user_internalInputRule,method:e_method.CREATE})
        // console.log(`updateFieldsValue   ${JSON.stringify(updateFieldsValue)}`)
        // console.log(`internalInputRule   ${JSON.stringify(internalInputRule[e_coll.USER][e_field.USER.PHOTO_DATA_URL])}`)
        // console.log(`internal check  result   ${JSON.stringify(internalInputRule[e_coll.USER][e_field.USER.PHOTO_DATA_URL]['format']['define'].test(finalFileName))}`)
        // console.log(`internal check  ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(result)
        }
    }
    //存储到db中
    await common_operation_model.findByIdAndUpdate({dbModel:dbModel.user,id:userId,updateFieldsValue:updateFieldsValueForModel})
    // console.log(`type ====>${JSON.stringify(type)}`)
    return Promise.resolve({rc:0})
}

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

    let captchaString=generateRandomString()
    req.session.captcha.captcha=captchaString

    //产生dataURL并返回
    return Promise.resolve({rc:0,msg:captchaString})

}





module.exports={
    dispatcher_async,
    login_async,
    uniqueCheck_async,
    retrievePassword_async,
    uploadPhoto_async,
    generateCaptcha_async,
    controllerError
}