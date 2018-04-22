/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 * 拆分辅助函数，合并路由函数（几个coll的路由过程都是类似的）
 */
'use strict'
const fs=require('fs')
const ap=require('awesomeprint')

// const server_common_file_require=require('../')
const validateHelper=require('../function/validateInput/validateHelper')
const validateFormat=require('../function/validateInput/validateFormat')
const validateValue=require('../function/validateInput/validateValue')
const dataConvert=require('./dataConvert')

const misc=require('../function/assist/misc')
const arr=require('../function/assist/array')

const ifPenalizeOngoing_async=require(`./controllerChecker`).ifPenalizeOngoing_async


const nodeEnum=require('../constant/enum/nodeEnum')
const e_part=nodeEnum.ValidatePart
const e_inputFieldCheckType=nodeEnum.InputFieldCheckType
const e_method=nodeEnum.Method
const e_resourceFieldName=nodeEnum.ResourceFieldName
const e_partValueToVarName=nodeEnum.PartValueToVarName
const e_subField=nodeEnum.SubField
const e_findEleInArray=nodeEnum.FindEleInArray

const mongoEnum=require('../constant/enum/mongoEnum')
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_storePathStatus=mongoEnum.StorePathStatus.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB
const e_userType=mongoEnum.UserType.DB
const e_resourceType=mongoEnum.ResourceType.DB

const nodeRuntimeEnum=require('../constant/enum/nodeRuntimeEnum')
const e_hashType=nodeRuntimeEnum.HashType
const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit
const e_userInfoField=nodeRuntimeEnum.UserInfoField

const e_serverDataType=require(`../constant/enum/inputDataRuleType`).ServerDataType
const e_serverRuleType=require(`../constant/enum/inputDataRuleType`).ServerRuleType
const e_applyRange=require(`../constant/enum/inputDataRuleType`).ApplyRange
const e_otherRuleFiledName=require(`../constant/enum/inputDataRuleType`).OtherRuleFiledName


const e_dbModel=require('../constant/genEnum/dbModel')
const e_coll=require('../constant/genEnum/DB_Coll').Coll
const e_field=require('../constant/genEnum/DB_field').Field
const e_internal_field=require('../constant/genEnum/DB_internal_field').Field


const calcResourceCriteria=require(`../constant/define/calcResourceConfig`).calcResourceCriteria
/*                      error               */
const helperError=require('../constant/error/controller/helperError').helper


const common_operation_model=require('../model/mongo/operation/common_operation_model')
const common_operation_helper=require('../model/mongo/operation/common_operation_helper')

// const misc=require('../function/assist/misc')
const hash=require('../function/assist/crypt').hash


const browserInputRule=require('../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../constant/inputRule/inputRule').inputRule

const fkConfig=require('../model/mongo/fkConfig').fkConfig



const handleSystemError=require('../function/assist/system').handleSystemError
const systemError=require('../constant/error/systemError').systemError

// const e_iniSettingObject=require('../constant/genEnum/initSettingObject').iniSettingObject
const uploadFile=require('../function/assist/upload')
const convertFileSize=require('../function/assist/misc').convertFileSize
const sanityHtml=require('../function/assist/sanityHtml').sanityHtml

const regex=require('../constant/regex/regex').regex
const currentAppSetting=require('../constant/config/appSetting').currentAppSetting
const globalConfiguration=require('../constant/config/globalConfiguration')


const  redisOperation=require(`../model/redis/operation/redis_common_operation`)

const captcha_async=require('../function/assist/awesomeCaptcha').captcha_async


// const complicatedCheckInterval_async=redisCommonScript.complicatedCheckInterval_async
/*  根据findType，在req中检测是否存在optionPart中定义的part
* @req
* @optionPart；候选的part，是否在req中存在
* @findType：optionPart中，多少part必须在req中
* @expectedPart: 指定的part加入到expectedPart中，进行下一步检测
* */
function checkOptionPartExist({req,optionPart,findType,expectedPart}){
    let result=false
    let reqValue=req.body.values
    switch (findType){
        case e_findEleInArray.AT_LEAST_ONE:
            //至少一个，最多全部
            for(let singlePartName of optionPart){
                if(undefined!==reqValue[singlePartName]){
                    expectedPart.push(singlePartName)
                    result=true
                }
            }
            break;
        default:
    }
    if(false===result){
        return helperError.optionPartCheckFail
    }
    return {rc:0}
}











/*          预检method是否正确，以便后续能使用正确的method调用不同的CRUD方法            */
function checkMethod({req}){
    // console.log(`CRUDPreCheckFormat in=========>`)
    // console.log(`req.body in=========>${JSON.stringify(req.body)}`)
    let result=validateFormat.validateReqBody(req.body)
    // console.log(`req.body result=========>${JSON.stringify(result)}`)
    if(result.rc>0){return result}
    // console.log(`validateReqBody result ${JSON.stringify(result)}`)
    // let validateAllExpectedPart=true  //只对expectedPart中定义的part进行检查
    let expectedPart=[e_part.METHOD]
    // console.log(`ready to validatePartFormat`)
    //为了能够调用validatePartFormat来检测method only，需要自己构造一个只包含了method的对象
    let methodPart
    if(undefined===req.body.values[e_part.METHOD]){
        return helperError.methodPartMustExistInDispatcher
    }else{
        methodPart={method:req.body.values[e_part.METHOD]}
    }
// console.log(`methodPart=====>${JSON.stringify(methodPart)}`)
    // 检查method的数据类型（validateFormat中validatePartFormat中METHOD部分 ）
    let methodCheckResult=validateFormat.validatePartValueFormat({part:e_part.METHOD,partValue:req.body.values[e_part.METHOD]})
    // console.log(`methodCheckResult=======>${JSON.stringify(methodCheckResult)}`)
    if(methodCheckResult.rc>0){
        return methodCheckResult
    }
    result=validateValue.validateMethodValue(methodPart[e_part.METHOD])
    return result
}





/*//没有method
function nonCRUDPreCheck({req,expectPart,collName}){
    let result
    // console.log(`recordInfoBaseRule ${JSON.stringify(recordInfoBaseRule)}`)
    //检查参数
/!*    if(-1===Object.values(e_userState).indexOf(expectUserState)){
        return helperError.undefinedUserState
    }*!/
    if(-1===Object.values(e_coll).indexOf(collName)){
        return helperError.undefinedColl
    }



    //检查输入参数中part的格式和值

    result = inputCommonCheck(req, expectPart)
    // console.log(`common check result is ${JSON.stringify(result)}`)
    if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    }


//检查输入参数格式是否正确
    result = validatePartValueFormat({
        req: req,
        expectedPart: expectPart,
        collName: collName,
        inputRule: inputRule,
        fkConfig: fkConfig,

    })
    // console.log(`format check result is ${JSON.stringify(result)}`)
    if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    }


    result = validatePartValue({
        req: req,
        expectedPart: expectPart,
        collName: collName,
        inputRule: browserInputRule,
        // recordInfoBaseRule:recordInfoBaseRule,
        fkConfig: fkConfig,
    })
    // console.log(` check result is ${JSON.stringify(result)}`)
    return result
    // }
}*/

/*
* @ usage: storePath的用途
* */
async function chooseStorePath_async({usage}){
    let choosenStorePathRecord,tmpResult,condition={}
    //根据usage，查询status是read_write的记录，且以usedSize排序
// console.log(`usage ${JSON.stringify(usage)}`)
    condition[e_field.STORE_PATH.USAGE]=usage
    condition[e_field.STORE_PATH.STATUS]=e_storePathStatus.READ_WRITE
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.store_path,condition:condition,options:{sort:{usedSize:1}}})
    if(0===tmpResult.length){
        handleSystemError({error:systemError.noDefinedStorePath})
        return Promise.reject(systemError.noDefinedStorePath)
    }
    // console.log(`all store path===>${JSON.stringify(tmpResult)}`)

    //选择存储路径，并判断是否达到上限
    for(let singleRec of tmpResult){
        // console.log(`singleRec['percentage'] ${singleRec['percentage']}`)
        // console.log(`singleRec[e_field.STORE_PATH.HIGH_THRESHOLD] ${singleRec[e_field.STORE_PATH.HIGH_THRESHOLD]}`)
        if(singleRec['percentage']<singleRec[e_field.STORE_PATH.HIGH_THRESHOLD]){
            choosenStorePathRecord=singleRec
            break;
        }
    }
    // console.log(`choosenStorePathRecord===>${JSON.stringify(choosenStorePathRecord)}`)
    if(undefined===choosenStorePathRecord){
        handleSystemError({error:systemError.noAvailableStorePathForUerPhoto})
        return Promise.reject(systemError.noAvailableStorePathForUerPhoto)
    }

    return Promise.resolve(choosenStorePathRecord)
}




/*  不用virtual method，因为如果使用virtual，需要引用mongo enum文件
* @originalStorePathRecord: 原始的storePath记录
* @updateValue:将要更新到originalStorePath对应记录的数据，一般为{usedSize:xxxxxx}
*
* result: 如果usedSize/size超过highThreshold，updateValue设为read only
* */
function setStorePathStatus({originalStorePathRecord, updateValue}){
    // console.log(`originalStorePathRecord===>${JSON.stringify(originalStorePathRecord)}`)
    // console.log(`updateValue===>${JSON.stringify(updateValue)}`)
    if((updateValue[e_field.STORE_PATH.USED_SIZE]/originalStorePathRecord[e_field.STORE_PATH.SIZE])*100>originalStorePathRecord[e_field.STORE_PATH.HIGH_THRESHOLD]){
        updateValue[e_field.STORE_PATH.STATUS]=e_storePathStatus.READ_ONLY
    }
}

/*
* 步骤：
* 1. 根据权限选择管理员集合
* 2. 产生一个随机数
* 3. 随机数和管理员集合数量相乘，向下取整，得到index，并返回对应的record
* */
async function chooseProperAdminUser_async({arr_priorityType}){
    let condition={
        [e_field.ADMIN_USER.USER_PRIORITY]:{'$all':arr_priorityType}
    }
    // console.log(`condition++++++++++>${JSON.stringify(condition)}`)
    let arr_adminUser=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user,condition:condition})
    // console.log(`arr_adminUser++++++++++>${JSON.stringify(arr_adminUser)}`)
    // console.log(`arr_priorityType++++++++++>${JSON.stringify(arr_priorityType)}`)
    let int_adminUserLength=arr_adminUser.length
    if(0===int_adminUserLength){
        return Promise.reject(helperError.noAnyAdminUserHasDefinedPriority(arr_priorityType))
    }

    let idx=Math.floor(int_adminUserLength*Math.random())
    // console.log(`idx=============>${idx}`)
    // console.log(`arr_adminUser[idx]=============>${arr_adminUser[idx]}`)

    return Promise.resolve(arr_adminUser[idx])
}

/*  对内部产生的值进行format和value的检测
*
*  @method：用来产生applyRange,给validateScalarInputValue用
* */
function checkInternalValue({internalValue,collInputRule,collInternalRule,method}){

        let tmpResult

        let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue =============> ${JSON.stringify(newDocValue)}`)
        tmpResult=validateFormat.validateCURecordInfoFormat(newDocValue,collInputRule)
    // console.log(`internal check format=============> ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return tmpResult
        }

        let applyRange
        switch (method){
            case e_method.CREATE:
                applyRange=e_applyRange.CREATE
                break;
            case e_method.UPDATE:
                applyRange=e_applyRange.UPDATE_SCALAR  //本函数内只对recordInfo进行检查，所以只能使用UPDATE_SCALAR
                break;
            case e_method.UPLOAD:
                applyRange=e_applyRange.CREATE  //上传文件相当于新建一个记录
                break;
            default:
                return helperError.undefinedMethod
        }
        tmpResult=validateValue.validateScalarInputValue({inputValue:newDocValue,collRule:collInternalRule,p_applyRange:applyRange})
    // console.log(`internal check format=============> ${JSON.stringify(tmpResult)}`)
        for(let singleFieldName in tmpResult){
            if(tmpResult[singleFieldName]['rc']>0){
                tmpResult['rc']=99999
                return tmpResult
            }
        }
        tmpResult['rc']=0
        return tmpResult
    // }
}


/*
* @docValue: client的输入（recordInfo）
* @collInternalFieldEnum: array. coll中那些字段是内部字段
* @collBrowserInputRule: 判断字段是否也位于client（某些字段，例如user的password，即可以位于client输入，也位于internal，所以不能删除）
* */
function deleteInternalField({docValue,collInternalFieldEnum,collBrowserInputRule}){
    if(collInternalFieldEnum.length>0){
        for(let singleFieldName of collInternalFieldEnum){
            if(false===singleFieldName in collBrowserInputRule){
                if(undefined!==docValue[singleFieldName]){
                    delete docValue[singleFieldName]
                }
            }

        }
    }
}


/*
* 0. check user login(optional)
* 1. check robot(mandatory but not archive)
* 2. penalize(mandatory)
* 3. delete internal field(mandatory)
* 4. CRUDPreCheck
* @userLoginCheck: 对象。包含2个字段：needCheck，是否检测用户登录；error：检测到未登录时返回的错误
* @penalizeCheck:对象，默认是需要检查的。包含3个字段： penalizeType,penalizeSubType,penalizeCheckError
* @expectedPart: 期望的part
* @reqTypePrefix: 用来检测intervalCheck的prefix
* //@searchSetting:{maxSearchKeyNum,maxSearchPageNum}  //每次搜索最多几个关键字,每次搜索最多显示几页
* //@dbMetaInfo: {e_field,e_coll,e_internal_field}
* //@allRule: {browserInputRule,internalInputRule,inputRule}
* */
/*async function preCheck_async({req,collName,method,userLoginCheck={needCheck:false},penalizeCheck,expectedPart,reqTypePrefix}){
    let tmpResult

// ap.inf('1. req.body.values',req.body.values)
    /!*              检查用户是否登录            *!/
    let {needCheck,error}=userLoginCheck
    if(true===needCheck){
        if(undefined===error){
            ap.err(`need to check **user login**, but not supply related error`)
        }
        if(undefined===req.session.userInfo){
            return Promise.reject(error)
        }
        // console.log(`====user login check done====`)
    }

    /!*        检查用户是否被处罚                                 *!/
    // console.log(`create in with robot check result =======> ${result}`)
    let {penalizeType,penalizeSubType,penalizeCheckError}=penalizeCheck
    // console.log(`penalizeCheck===============================================>${JSON.stringify(penalizeCheck)}`)
    if(undefined!==req.session.userInfo && undefined!==req.session.userInfo.userId){
        // console.log(`penalize check in 0 ==========================================>`)
        if(undefined!==penalizeType && undefined!==penalizeSubType){
            // console.log(`penalize check in 1 ==========================================>`)
            if(undefined===penalizeCheckError){
                ap.err(`need to check **penalize**, but not supply related error`)
            }
// console.log(`penalize check in 2 ==========================================>`)
            tmpResult=await ifPenalizeOngoing_async({userId:req.session.userInfo.userId, penalizeType:penalizeType,penalizeSubType:penalizeSubType})
            // console.log(`preCheck_async penalize ongoing check result====>${JSON.stringify(tmpResult)}`)
            // return false
            if(true===tmpResult){
                return Promise.reject(penalizeCheckError)
            }
            // console.log(`====penalize check done====`)
        }
    }
    // ap.inf('penalize done')


    // ap.inf('2. req.body.values',req.body.values)
    // if(expectedPart.length>0){
    /!*              如果带method，根据method的不同，选择不同的inputRule（Create还是update）
                    不带，直接检查expectPart
     *!/
    //因为dispatch而已经检查过req的总体结构(method必定存在)，所以无需再次检查，而直接检查partValueFormat+partValueCheck
    // console.log(`pmethod====>${method}`)
    // console.log(`expectedPart====>${JSON.stringify(expectedPart)}`)
    // console.log(`req.body.values====>${JSON.stringify(req.body.values)}`)
    if(undefined!==method){
        tmpResult=CRUDPreCheck({req:req,expectedPart:expectedPart,collName:collName,method:method})
    }
    else
    {
        tmpResult=nonCRUDPreCheck({req:req,expectPart:expectedPart,collName:collName})
        // return Promise.reject(`method not define in preCheck_async`)
        // tmpResult=nonCRUDPreCheck({req:req,expectedPart:expectedPart,collName:collName})
    }
    // ap.inf('CRUDPreCheck result',tmpResult)

    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    // ap.inf('3. req.body.values',req.body.values)
    /!*              删除内部字段值                     *!/
    // 删除内部字段（RECORD_INFO）
    if(expectedPart.length>0 && -1!==expectedPart.indexOf(e_part.RECORD_INFO)){
        let docValue=req.body.values[e_part.RECORD_INFO]
        // console.log(`before delete internal field for RECORD_INFO=========>${JSON.stringify(docValue)}`)
        deleteInternalField({docValue:docValue,collInternalFieldEnum:e_internal_field[collName],collBrowserInputRule:browserInputRule[collName]})
        // console.log(`after delete internal field for RECORD_INFO=========>${JSON.stringify(docValue)}`)
    }

    //恢复method，保证checkInternal能使用method
    req.body.values[e_part.METHOD]=method


    return Promise.resolve({rc:0})
}*/



/*      使用multiPart获得并保存上传的文件
*
* @maxFileSizeInByte:提供被multipart使用，限制最大文件size
* @fileSizeUnit; 最终size被转换成的单位
* return： 返回文件原始名称和size
* */
async function uploadFileToTmpDir_async({req,uploadTmpDir,maxFileSizeInByte,fileSizeUnit=e_fileSizeUnit.MB}){
    let tmpResult
    /*              设置multiPart参数           */
    // tmpResult=await common_operation_model.find({dbModel:dbModel.store_path,condition:{usage:e_storePathUsage.UPLOAD_TMP}})
    let uploadOption={
        // maxFilesSize:2097152,
        maxFilesSize:maxFileSizeInByte,//300k   头像文件大小100k
        maxFileNumPerTrans:1,//每次只能上传一个头像文件
        // maxFields:1,
        name:'file',
        uploadDir:uploadTmpDir
    }
    //检查上传参数设置的是否正确
    tmpResult=uploadFile.checkOption(uploadOption)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //读取上传的文件，获得文件信息
    tmpResult=await uploadFile.formParse_async(req,uploadOption)

    let {originalFilename,path,size}=tmpResult.msg[0]

    //检测原始文件名
    if(sanityHtml(originalFilename)!==originalFilename){
        return Promise.reject(helperError.uploadFileNameSanityFail)
    }
    //转换size
    tmpResult=convertFileSize({num:size,newUnit:fileSizeUnit})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    // console.log(`convert size===${tmpResult}`) //byte
    return Promise.resolve({originalFilename:originalFilename,path:path,size:tmpResult.msg})
    // uploadedFileSizeInKb=tmpResult.msg
}


/*如果client输入的字段包含用户输入，需要进行XSS检查
* @content;要进行检查的content
* @error；如果检查失败，要返回的错误
* */
async function contentXSSCheck_async({content,fieldName}){
    //
    if(sanityHtml(content)!==content){
        return Promise.reject(helperError.XSSCheckFailed(fieldName))
    }
}

/*      对输入的doc中，期望的字段进行XSS检测
* @docValue:client 输入的字段
* @collName:告知在那个coll的rule中查找field
* @expectedXSSCheckField： docValue中期望进行XSS检测的字段名
* */
async function inputFieldValueXSSCheck({docValue,collName,expectedXSSCheckField}){

    // console.log(`expectedXSSCheckField========================>${JSON.stringify(expectedXSSCheckField)}`)
    // console.log(`collName========================>${JSON.stringify(collName)}`)
    // console.log(`browserInputRule[collName]========================>${JSON.stringify(browserInputRule[collName])}`)
    for(let singleXssFieldName of expectedXSSCheckField){
        if(undefined!==docValue[singleXssFieldName] && null!==docValue[singleXssFieldName]){
            //是array，则要对值遍历检查XSS
            // console.log(`singleXssFieldName========================>${JSON.stringify(singleXssFieldName)}`)
            // console.log(`browserInputRule[collName][singleXssFieldName]========================>${JSON.stringify(browserInputRule[collName][singleXssFieldName])}`)
            // console.log(`browserInputRule[collName][singleXssFieldName][\`type\`] instanceof Array========================>${JSON.stringify(browserInputRule[collName][singleXssFieldName][`type`] instanceof Array)}`)
            if( browserInputRule[collName][singleXssFieldName][e_otherRuleFiledName.DATA_TYPE] instanceof Array && docValue[singleXssFieldName].length>0){
                docValue[singleXssFieldName].forEach(async function(ele){
                    await contentXSSCheck_async({content:ele,fieldName:singleXssFieldName})
                })
            }else{
                // console.log(`docValue[singleXssFieldName]===================>${JSON.stringify(docValue[singleXssFieldName])}`)
                await contentXSSCheck_async({content:docValue[singleXssFieldName],fieldName:singleXssFieldName})
            }
        }
    }
}
/*/!* content中不能有dataUrl，防止用户传入外部图片*!/
function removeImageDataUrl({content}){
    return content.replace(regex.imageDataUrl,'')
}*/


/*      只能用在update中，因为函数需要使用recordId获得imageRecord，然后和content中img DOM进行比较
        如果用户在client删除了图片，不会直接通知server，而是要在server端，通过比较content中image和db（自己和关联，例如article和article_image）中，决定是否要删除（磁盘文件）和db内容
*@content：输入的内容
* @recordId：要更新的记录，例如articleId/impeachId
* @collConfig: 对象，content所在的coll。fkFieldName:存储image的field
 *              {collName:article, fkFieldName:e_field.ARTICLE.innerAttachmentId}
* @collImageName：对象content中，image存储在那个coll，格式同collConfig。 fkFieldName：字段名，此image存储在哪个article/image中
*               {collName:e_coll.INNER_IMAGE, fkFieldName:e_field.INNER_IMAGE.articleId}
*@resourceType:如果需要对user_resource_static进行更新，需要设置resourceType
*
* return: 处理过的content，删除了dataUrl，和content中存在，但是db中没有的IMG DOM
* */
async function contentDbDeleteNotExistImage_async({content,recordId,collConfig,collImageConfig,resourceType}){
    let tmpResult,validMd5ImageNameInContent={}
    //获得所有<img/>DOM
    let innerImageInContent=content.match(regex.imageDOM)
// console.log(`innerImageInContent==========>${JSON.stringify(innerImageInContent)}`)


    //IMG DOM中，scr的domain必须是本站地址，且文件名为md5
    //转换成正则格式（.=====>\.）
    let convertedHostDomain=currentAppSetting['hostDomain'].replace('.',`\.`)
    let srcReg=new RegExp(`src="https?://${convertedHostDomain}/.*([0-9a-f]{32}\.(jpg|jpeg|png))"`)
// console.log(`convertedHostDomain==========>${JSON.stringify(convertedHostDomain)}`)
    if(null!==innerImageInContent){
        for(let singleImageDOM of innerImageInContent){
            //如果DOM中，src不是本站地址，且文件图片不是md5，删除
            let tmpMatchResult=singleImageDOM.match(srcReg)
            // console.log(`tmpMatchResult==========>${JSON.stringify(tmpMatchResult)}`)
            if(null===tmpMatchResult){
                content=content.replace(singleImageDOM,'')
                continue
            }

            //获得本站 md5图片名称，用对象表示，格式=>md5：DOM   方便直接删除content
            validMd5ImageNameInContent[tmpMatchResult[1]]=singleImageDOM

        }
    }

// console.log(`afte r delete not own image==============>${JSON.stringify(content)}`)
    /*          检查md5是否在collImage中存在            */
    //获得当前article/impeach/impeachComment的所有image记录
    let imageSearchCondition={}
    imageSearchCondition[collImageConfig.fkFieldName]=recordId
    // console.log(`collImageConfig.collName ====${JSON.stringify(collImageConfig.collName)}`)
    // console.log(`imageSearchCondition ====${JSON.stringify(imageSearchCondition)}`)

    let imageRecordInDB=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collImageConfig.collName],condition:imageSearchCondition,populateOpt:collImageConfig.storePathPopulateOpt})
// console.log(   `tmpresult is ===============>${JSON.stringify(tmpResult)}`)
    //对比db和content中的image
    //db中没有任何image信息，则把content中所有image DOM删除
    if(imageRecordInDB.length===0){
        // let convertedContent=
        // console.log(   `convert result  is ===============>${JSON.stringify(convertedContent)}`)
        return Promise.resolve(content.replace(regex.imageDOM,''))
    }
    //以db为基准,db中有image，进行比较。如果db中的记录，在content中不存在，说明image已经被删除，那么清理db
    let deletedImageId=[],deletedImageMd5Name=[],notDeletedMd5Name=[],deletedImageRecord=[]//记录content中删除的image，用于fs.unlink删除文件，已经更新user_resource_static
    for(let singleRecord of imageRecordInDB){
        let md5Name=singleRecord[collImageConfig.imageHashFieldName]

        if(-1===Object.keys(validMd5ImageNameInContent).indexOf(md5Name)){
            deletedImageId.push(singleRecord['_id'])
            deletedImageMd5Name.push(md5Name)
            deletedImageRecord.push(singleRecord)
            continue
        }

        notDeletedMd5Name.push(md5Name)
    }
// console.log(`deletedImageId============>${JSON.stringify(deletedImageId)}`)
    //如果比较结果，content中无，而db中有（用户在client删除了image），则对db进行删除操作
    if(deletedImageId.length>0){
        let conditionForImageColl={'_id':{$in:deletedImageId}}
        let conditionForReferenceColl={'_id':recordId}
        // console.log(`collConfig.collName ======> ${JSON.stringify(collConfig.collName)}`)
        // console.log(`conditionForReferenceColl ======> ${JSON.stringify(conditionForReferenceColl)}`)
        // console.log(`collConfig.fkFieldName ======> ${JSON.stringify(collConfig.fkFieldName)}`)
        // console.log(`deletedImageId ======> ${JSON.stringify(deletedImageId)}`)
        await  common_operation_model.deleteMany_async({dbModel:e_dbModel[collImageConfig.collName],condition:conditionForImageColl})

        await  common_operation_model.deleteArrayFieldValue_async({dbModel:e_dbModel[collConfig.collName],condition:conditionForReferenceColl,arrayFieldName:collConfig.fkFieldName,arrayFieldValue:deletedImageId})
        let deletedFileNum=0,deletedFileSize=0
        for(let singleDeletedImageRecord of deletedImageRecord){
            fs.unlink(singleDeletedImageRecord[collImageConfig.storePathPopulateOpt[0][`path`]][collImageConfig.storePathPopulateOpt[0][`select`]])
            deletedFileNum+=1
            deletedFileSize+=singleDeletedImageRecord[collImageConfig.sizeFieldName]
        }
        //更改user_resource_static
        if(undefined!==resourceType){
            await e_dbModel.user_resource_static.update({
                [e_field.USER_RESOURCE_STATIC.USER_ID]:userId,
                [e_field.USER_RESOURCE_STATIC.RESOURCE_TYPE]:resourceType
            },{
                $inc:{
                    [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:-deletedFileNum,
                    [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:-deletedFileSize,
                }
            })
        }

    }

    //以content的image为基准，如果db中没有，直接从content中删除
    for(let singleMd5InContent in validMd5ImageNameInContent){
        if(-1===notDeletedMd5Name.indexOf(singleMd5InContent)){
            content.replace(validMd5ImageNameInContent[singleMd5InContent],'')
        }
    }

    return Promise.resolve(content)
}



/*/!*          根据resourceProfileRange，resourceColl，从预定义的对象中获得对应的fieldName和grougby的设置，统计使用的资源数
* @resourceProfileRange: PER_PERSON/PER_ARTICLE/PER_IMPEACH，此函数只是作为key，从fieldsValueToFilterGroup获得对应的groupby字段设置
* @resourceFileFieldName: 实际储存文件的（单个）coll（IMAGE/ATTACHMENT）所需要的字段名定义
* @fieldsValueToFilterGroup： 实际储存文件的（单个）coll中，PER_PERSON/PER_ARTICLE/PER_IMPEACH组合，设定的group过滤字段+参数
*
* return：对象，当前resourceColl下资源的统计（size，type）
* *!/
async function calcExistResource_async({resourceProfileRange,resourceFileFieldName,fieldsValueToFilterGroup}){
    /!*              计算当前（每个）资源总数               *!/
    //设置分组条件
    // console.log(`fieldsValueToFilterGroup =================> ${JSON.stringify(fieldsValueToFilterGroup)}`)
    let fileCollName = resourceFileFieldName['fileCollName']
    let sizeFieldName = resourceFileFieldName['sizeFieldName']
    let fkFileOwnerFieldName = resourceFileFieldName['fkFileOwnerFieldName']

    let fieldsFilterGroupReallyUse=fieldsValueToFilterGroup[resourceProfileRange]
    //fieldsValueToFilterGroup中的objetid需要转换成真正的ObjectId
    let match=misc.objectDeepCopy(fieldsFilterGroupReallyUse)
    for(let singleFilterKey in match){
        match[singleFilterKey]=dataConvert.convertToObjectId(match[singleFilterKey])
    }
    // match['dDate']={$exists:0}  //file未被删除
    //从fieldsFilterGroupReallyUse抽取出groupby的字段
    let groupByFields={}
// console.log(`befroe set ===========> ${JSON.stringify(groupByFields)}`)
    for(let singleFieldName in fieldsFilterGroupReallyUse){
        groupByFields[singleFieldName]=`$${singleFieldName}`
    }

    let group = {
        _id: groupByFields,
        totalSizeInMb: {$sum: `$${sizeFieldName}`},
        totalFileNum: {$sum: 1}
    }
    let tmpResult = await common_operation_model.group_async({
        dbModel: e_dbModel[fileCollName],
        match: match,
        group: group
    })

    let result={
        totalSizeInMb:tmpResult.msg[0].totalSizeInMb,
        totalFileNum:tmpResult.msg[0].totalFileNum,
    }
    return Promise.resolve(result)
}*/


/*          根据resourceProfileRange，从e_resourceProfileRange获得对应的fieldName和grougby的设置，统计使用的资源数
 * @resourceProfileRange: IMAGE_PER_PERSON等，作为e_resourceProfileRange的key，获得对应的group/match设置
 * @userId/articleId/impeachId/impeachCommentId: 作为match的条件
 *
 * return：对象，当前resourceColl下资源的统计（size，type）
 * */
async function calcExistResource_async({resourceProfileRange,userId,articleId,impeach_comment_id,arr_impeach_and_comment_id}){
    /*          检查对应的参数是否都存在            */

    switch (resourceProfileRange) {
        case e_resourceProfileRange.IMAGE_PER_ARTICLE:
            if(undefined===articleId || null===articleId){return Promise.reject(helperError.missParameter(`articleId`))}
            break;
        case e_resourceProfileRange.ATTACHMENT_PER_ARTICLE:
            if(undefined===articleId || null===articleId){return Promise.reject(helperError.missParameter(`articleId`))}
            break;
        case e_resourceProfileRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE:
            if(undefined===userId || null===userId){return Promise.reject(helperError.missParameter(`userId`))}
            break;
/*        case e_resourceProfileRange.ATTACHMENT_PER_PERSON_FOR_ALL_ARTICLE:
            if(undefined===userId || null===userId){return Promise.reject(helperError.missParameter(`userId`))}
            break;*/
        case e_resourceProfileRange.IMAGE_PER_IMPEACH_OR_COMMENT:
            if(undefined===impeach_comment_id || null===impeach_comment_id){return Promise.reject(helperError.missParameter(`impeach_comment_id`))}
            break;
/*        case e_resourceProfileRange.IMAGE_PER_COMMENT:
            // if(undefined===impeachCommentId || null===impeachCommentId){return Promise.reject(helperError.missParameter(`impeachCommentId`))}
            break;*/
        case e_resourceProfileRange.IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH:
            if(undefined===userId || null===userId){return Promise.reject(helperError.missParameter(`userId`))}
            if(undefined===arr_impeach_and_comment_id || null===arr_impeach_and_comment_id){return Promise.reject(helperError.missParameter(`arr_impeach_and_comment_id`))}
            break;
        default:
            return Promise.reject(helperError.missParameter('resourceProfileRange'))
    }

    let calcResourceConfig=calcResourceCriteria[resourceProfileRange]
    let calcResult={
        [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:0,
        [e_resourceFieldName.MAX_FILE_NUM]:0
    }
    //calcResourceConfig都是数组（因为某些resourceRange可能需要多次查询，例如WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE，需要同时计算所有的image和attachment）
    for(let singleCalcResourceCriteria of calcResourceConfig){
        let tmpResult = await common_operation_model.group_async({
            dbModel: e_dbModel[singleCalcResourceCriteria[`collName`]],
            match: singleCalcResourceCriteria[`match`],
            group: singleCalcResourceCriteria[`group`],
        })
        calcResult[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]+=tmpResult.msg[0][e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]
        calcResult[e_resourceFieldName.MAX_FILE_NUM]+=tmpResult.msg[0][e_resourceFieldName.MAX_FILE_NUM]
    }

    return Promise.resolve(calcResult)
}
/*                  根据用户的类型（普通用户，还是管理员用户），生成sugar，并hash输入的密码                        */
function generateSugarAndHashPassword({ifAdminUser,ifUser,password}){
    let randomStringLength,hashType
    //根据用户类型确定参数
    if(true===ifAdminUser && false===ifUser){
        randomStringLength=10
        hashType=e_hashType.SHA512
    }
    if(false===ifAdminUser && true===ifUser){
        randomStringLength=5
        hashType=e_hashType.SHA256 //SHA1已经被破解
    }
    if(undefined===randomStringLength || undefined===hashType){
        return helperError.userTypeNotCorrect
    }

    let sugar=misc.generateRandomString(randomStringLength)
    let hashedPassword=hash(`${password}${sugar}`,hashType)
    if(hashedPassword.rc>0){return hashedPassword}
    return {rc:0,msg:{sugar:sugar,hashedPassword:hashedPassword.msg}}
}

/*          保存登录用户的信息    采用async方式，方便处理返回值
* @userInfo:{userId,collName,userType}   保存userId，user位于哪个coll，用户类型
*
* */
async function setLoginUserInfo_async({req,userInfo}){
    // console.log(`setLoginUserInfo in==========>`)
    if(undefined===userInfo){
        return Promise.reject(helperError.userInfoUndefine)
    }
    let mandatoryFields=[e_userInfoField.USER_ID,e_userInfoField.USER_COLL_NAME,e_userInfoField.USER_TYPE]
    for(let singleMandatoryField of mandatoryFields){
        if(undefined===userInfo[singleMandatoryField]){
            return Promise.reject(helperError.mandatoryFieldValueUndefine(singleMandatoryField))
        }
    }
    //保存信息到session中
    // console.log(`userInfo to be saved into session==========>${JSON.stringify(userInfo)}`)
    req.session.userInfo=userInfo
    return Promise.resolve()
}

async function getLoginUserInfo_async({req}){
    // console.log(`req.session===========》${JSON.stringify(req.session)}`)
    // console.log(`req.session.userInfo===========.${JSON.stringify(req.session.userInfo)}`)
    if(undefined===req.session || undefined===req.session.userInfo){
        return Promise.reject(helperError.userInfoNotInSession)
    }
    return Promise.resolve(req.session.userInfo)
}

//update中，根据输入的update值和原始的文档进行比较，如果字段的值不变，直接删除。以便见效mongodb更新的数据量
function deleteNotChangedValue({inputValue,originalValue}){
    for(let singleFieldName in inputValue){
        if(inputValue[singleFieldName]===originalValue[singleFieldName]){
            delete inputValue[singleFieldName]
        }
    }
}

/*  根据profileRange和userId，为普通用户，选择最近一个active的resourceProfile。
 * @ resourceProfileRange: perArticle/perPerson
 *
 * return: 返回合适的记录
 * */
async function chooseLastValidResourceProfile_async({resourceProfileRange,userId}){
    // console.log(`chooseLastValidResourceProfile_async in ===========>`)
    let resourceProfileIdInUse,tmpResult,condition={},options={}
    //根据resourceProfileRange，查找对应的resource_profile的objectID
    condition[e_field.RESOURCE_PROFILE.RANGE]=resourceProfileRange
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:condition})
    // console.log(`resourceProfileRange result ===========>${JSON.stringify(tmpResult)}`)
    if(0===tmpResult.length){
        handleSystemError({error:systemError.noDefinedResourceProfile})
        return Promise.reject(systemError.noDefinedResourceProfile)
    }
    let resourceProfileIfMatchRange=[]
    for(let singleRecord of tmpResult){
        // console.log(`singleRecord result ===========>${JSON.stringify(singleRecord)}`)
        resourceProfileIfMatchRange.push(singleRecord[e_field.RESOURCE_PROFILE.ID])
    }
    // console.log(`resourceProfileIfMatchRange result ===========>${JSON.stringify(resourceProfileIfMatchRange)}`)
    //根据resource_profile_id和userId，在user_resource_profile中查找

    //获取用户最新的resource_profile设置
    condition={}
    condition[e_field.USER_RESOURCE_PROFILE.DURATION]={$gt:0}
    condition[e_field.USER_RESOURCE_PROFILE.USER_ID]=userId
    condition[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]={$in:resourceProfileIfMatchRange}
    options['sort']={'cDate':-1}
    options['limit']=1
    // console.log(`condition result ===========>${JSON.stringify(condition)}`)
    // console.log(`options result ===========>${JSON.stringify(options)}`)
    //selectedFields必须包含cDate，否则无法执行virtual方法
    let selectedFields=`${e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID} ${e_field.USER_RESOURCE_PROFILE.DURATION} cDate`
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_resource_profile,condition:condition,options:options,selectedFields:selectedFields})
// console.log(`duration>0 result ===========>${JSON.stringify(tmpResult)}`)
    //1. duration>0的最近一条记录（是否active）
    if(tmpResult.length>0){
        if(true===tmpResult[0]['isActive']){
            resourceProfileIdInUse=tmpResult[0][e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]
        }
    }
    //如果duration》0的记录没有找到，或者找到但是已经超期
    if(undefined===resourceProfileIdInUse){
        //如果duration>0的resource_profile没有找到，那么查找duration=0（无时间限制）的记录
        condition[e_field.USER_RESOURCE_PROFILE.DURATION]={$eq:0}
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_resource_profile,condition:condition,selectedFields:selectedFields})
        // console.log(`duration===0 result ===========>${JSON.stringify(tmpResult)}`)
        if(tmpResult.length===0){
            handleSystemError({error:systemError.userNoDefaultResourceProfile})
            return Promise.reject(systemError.userNoDefaultResourceProfile)
        }

        resourceProfileIdInUse=tmpResult[0][e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]
    }

    // console.log(`choose resourceProfileIdInUse===========>${JSON.stringify(resourceProfileIdInUse)}`)
    // 将resource_profile_id转换成resource_profile
    tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.resource_profile,id:resourceProfileIdInUse})
    // console.log(`active resource_profile===========>${JSON.stringify(tmpResult.msg)}`)
    return Promise.resolve(tmpResult)
}

/*  根据传入的resourceProfileRange,直接在admin的resource_profile 中查找到对应的记录。适用于common的resource查询
* @arr_resourceProfileRange:数组，要查询的resourceRange
* */
async function findResourceProfileRecords_async({arr_resourceProfileRange}){
    let condition={"$or":[]}
    for(let singleResourceProfileRange of arr_resourceProfileRange){
        condition.push({[e_field.RESOURCE_PROFILE.RANGE]:singleResourceProfileRange})
    }
    condition['dDate']={"$exists":false}
    let resourceResult=common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:condition})
    if(null===resourceResult || arr_resourceProfileRange.length!==resourceResult.length){
        return Promise.reject(helperError.cantFindResourceFileOrNumNotMatch)
    }

    return Promise.resolve(resourceResult)
}

/*  对于某些可有可无的part（例如EDIT_SUB_FIELD），如果req中有对应的值，那么加入到expectedPart进行检查
*   @req
*   @arr_optionalPart: 需要检测的可有可无的part
*   @arr_expectedPart：如果optionalPart在req中存在，push进去
* */
function pushOptionalPartIntoExpectedPart_noReturn({req,arr_optionalPart,arr_expectedPart}){
    //arr_optionalPart没有设置
    if(undefined===arr_optionalPart || 0===arr_optionalPart.length){
        return
    }
    //如果arr_optionalPart中的part在req中有值，则此part被push到arr_expectedPart
    for(let singleOptionalPart of arr_optionalPart){
        if(undefined!==req.body.values[singleOptionalPart] && null!==req.body.values[singleOptionalPart]){
            arr_expectedPart.push(singleOptionalPart)
        }
    }
}

/*  将arr_expectedPart中part的value从req中提取出来，直接返回
*
*
* */
function getPartValue({req,arr_expectedPart}){
    let result={}
    for(let singlePart of arr_expectedPart){
        if(undefined!==req.body.values[singlePart]){
            result[e_partValueToVarName[singlePart]]=req.body.values[singlePart]
        }
    }

    return result
}

/*          检测singleEditSubFieldValue中的from/to：1.是否存在，2. 对应的owner是否为当前用户
* @convertedNoSql; 通过dataConvert.convertEditSubFieldValueToNoSql转换后的数据，合并了form/to的id，可以减少db处理
* @fromToAdditionCondition：查找from/to需要的额外条件
* @collNam: from/to 所在的coll
* @recordOwnerFieldName： from/to所在coll中，记录owner的field
* @userId： 当前用户userId
* @error: 发生错误对应的error
* */
async function checkEditSubFieldFromTo_async({convertedNoSql,fromToAdditionCondition,collName,recordOwnerFieldName,userId,error}){
    // let collFkConfig
    let tmpResult
    // for(let singleFieldName in editSubFieldValue){
    // let fromRecord,toRecord
    let condition
    // ap.print('convertedNoSql',convertedNoSql)
    for(let singleRecordId in convertedNoSql){
        // ap.print('singleRecordId',singleRecordId)
        condition={"dDate":{$exists:false},"_id":singleRecordId}
        if(undefined!==fromToAdditionCondition){
            condition=Object.assign(condition,fromToAdditionCondition)
        }
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
        if(1!==tmpResult.length){
            return Promise.reject(error.fromToRecordIdNotExists)
        }

        // ap.print('tmpResult',tmpResult)
        // ap.print('tmpResult[0][recordOwnerFieldName]',tmpResult[0][recordOwnerFieldName])
        // ap.print('userId',userId)
        if(tmpResult[0][recordOwnerFieldName].toString()!==userId){
            return Promise.reject(error.notOwnFromToRecordId)
        }
    }

    return Promise.resolve()

}
/*async function checkEditSubFieldFromTo_async({singleEditSubFieldValue,fromToAdditionCondition,collName,recordOwnerFieldName,userId,error}){
    // let collFkConfig
    let tmpResult
    // for(let singleFieldName in editSubFieldValue){
    let fromRecord,toRecord
    let condition
    //检测from recordId是否存在，且是否为当前用户所有
    if(undefined!==singleEditSubFieldValue[e_subField.FROM]){
        condition={"dDate":{$exists:false},"_id":singleEditSubFieldValue[e_subField.FROM]}
        if(undefined!==fromToAdditionCondition){
            condition=Object.assign(condition,fromToAdditionCondition)
        }
        fromRecord=common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
        //因为condition限定了_id，所以结果只能为0或者1
        if(1!==fromRecord.length){
            return Promise.reject(error.fromRecordIdNotExists)
        }
        if(fromRecord[0][recordOwnerFieldName]!==userId){
            return Promise.reject(error.notOwnFromRecordId)
        }
    }

        //检测to recordId是否存在，且是否为当前用户所有
    if(undefined!==singleEditSubFieldValue[e_subField.TO]){
        condition={"dDate":{$exists:false},"_id":singleEditSubFieldValue[e_subField.TO]}
        if(undefined!==fromToAdditionCondition){
            condition=Object.assign(condition,fromToAdditionCondition)
        }
        toRecord=common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
        //因为condition限定了_id，所以结果只能为0或者1
        if(1!==toRecord.length){
            return Promise.reject(error.toRecordIdNotExists)
        }
        if(toRecord[0][recordOwnerFieldName]!==userId){
            return Promise.reject(error.notOwnToRecordId)
        }
    }

    return Promise.resolve()

}*/


/*    检测singleEditSubFieldValue中的eleArray：如果是objectId  1.fk是否存在，2. eleArray中元素数量符合字段定义的数量（预见） 3.元素没有重复  4. To如果存在，add后满足数量要求否  5. eleArray中每个记录是否存在  6.（额外）其中每个记录，用户是否有权操作
* @singleEditSubFieldValue:part中某个字段的值
* @collName: from/to 所在的coll
* @fieldName: from/to对应的字段
* @fkRecordOwnerFieldName: 直接从fkConfig中获取
* @eleAdditionalCondition: 检测eleArray是否存在，需要的额外条件
* @userId:当前用户id
* */
async function checkEditSubFieldEleArray_async({singleEditSubFieldValue,eleAdditionalCondition,collName,fieldName,userId}){
    //如果eleArray是objectId，需要检测
    // 1. fkConfig是否存在
    // 2. eleArray中元素数量符合字段定义的数量（预检）
    // 3. 元素没有重复
    // 4. To如果存在，满足数量要求否
    // 5. eleArray中每个记录是否存在
    // 6. （额外）其中每个记录，用户是否有权操作
// ap('singleEditSubFieldValue',singleEditSubFieldValue)
//     try{
        let condition,tmpResult
        // ap.print('browserInputRule[collName][fieldName][`type`][0]',browserInputRule[collName][fieldName][`type`][0])
        if(browserInputRule[collName][fieldName][e_otherRuleFiledName.DATA_TYPE][0]===e_serverDataType.OBJECT_ID ){
            //1. fkConfig是否存在
            if(undefined===fkConfig[collName][fieldName]){
                return Promise.reject(helperError.fkConfigUndefined)
            }
            //获得eleArray的field对应的collName，以及ownerFieldName
            // ap.print('fkConfig[collName][fieldName]',fkConfig[collName][fieldName])
            let fkCollName=fkConfig[collName][fieldName][`relatedColl`]
            // ap.print('fkCollName',fkCollName)
            // let fkRecordOwnerFieldName=
            // ap.print('fkRecordOwnerFieldName',fkRecordOwnerFieldName)
            //获得要转移（加入）的数量
            let eleArrayLength=singleEditSubFieldValue[e_subField.ELE_ARRAY].length
            //获得rule定义的最大arrayLength
            let ruleDefineArrayMaxLength=browserInputRule[collName][fieldName][e_serverRuleType.ARRAY_MAX_LENGTH]['define']
// ap.print('eleArrayLength',eleArrayLength)
            // 2. eleArray中元素数量符合字段定义的数量（预检）
            if(eleArrayLength>ruleDefineArrayMaxLength){
                return Promise.reject(helperError.eleArrayLengthExceed)
            }

            //3. 元素没有重复
            if(true===arr.ifArrayHasDuplicate(singleEditSubFieldValue[e_subField.ELE_ARRAY])){
                return Promise.reject(helperError.eleArrayContainDuplicateEle)
            }
            // ap.print('misc.ifArrayHasDuplicate(singleEditSubFieldValue[e_subField.ELE_ARRAY]',misc.ifArrayHasDuplicate(singleEditSubFieldValue[e_subField.ELE_ARRAY]))
            //4. 如果有to，需要测算对应recordId的容量是否够
            tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[collName],id:singleEditSubFieldValue[e_subField.TO]})
            //需要预防from/to对应的id不存在（eleArray先于from/to进行检测）
            if(null===tmpResult){
                return Promise.reject(helperError.toIdNotExist)
            }

            //相加之后和rule中定义数量比较
            // ap.print('eleArrayLength',eleArrayLength)
            // ap.print('tmpResult[fieldName].length',tmpResult[fieldName].length)
            // ap.print('ruleDefineArrayMaxLength',ruleDefineArrayMaxLength)
            if(eleArrayLength+tmpResult[fieldName].length>ruleDefineArrayMaxLength){
                return Promise.reject(helperError.toRecordNotEnoughRoom)
            }
            // ap.print('de[]')
            // 5. eleArray中每个记录是否存在
            condition={'dDate':{$exists:false}}
            if(undefined!==eleAdditionalCondition){
                condition=Object.assign(condition,eleAdditionalCondition)
            }

            for(let singleEle of singleEditSubFieldValue[e_subField.ELE_ARRAY]){
                // 5. eleArray中每个记录是否存在
                condition['_id']=singleEle
                // ap.print('condition',condition)
                tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[fkCollName],condition:condition})
                if(1!==tmpResult.length){
                    return Promise.reject(helperError.eleArrayRecordIdNotExists)
                }
                // ap.print('tmpResult',tmpResult)
                /*                if(undefined!==fkConfig[collName][fieldName][`fkCollOwnerField`]){
                                return Promise.reject(helperError.fkConfigNotDefineOwnerField)
                            }*/
                //6. （额外）其中每个记录，用户是否有权操作
                //如果fk中有定义，才需要检测权限
                // ap.print('fkCollName[collName][fkCollName][`fkCollOwnerField`]',fkConfig[collName][fieldName][`fkCollOwnerField`])
                if(undefined!==fkConfig[collName][fieldName][`fkCollOwnerField`]){
                    let fkRecordOwnerFieldName=fkConfig[collName][fieldName][`fkCollOwnerField`]
                    if(tmpResult[0][fkRecordOwnerFieldName]!==userId){
                        return Promise.reject(helperError.notOwnerOfEleArray)
                    }
                }
            }
        }else{
            return Promise.reject(helperError.eleArrayNotObjectId)
        }

        return Promise.resolve({rc:0})

}

/*  如果req不带任何cookie（sessionId），server对每个req自动生成新的session，导致同一client的请求产生过多session
*   因此，如果出现以上情况，先在server产生一个session（设置req.session.field），然后传递给client，以便client保存到cookie中
*   client收到后，自动重发req（带sessionId）
* */
async function setSessionByServer_async({req}){
    return new Promise(function(resolve, reject){
        // ap.inf('setSessionByServer_async in')
        let field='req1'
        // ap.inf('session id',req.session.id)
        if(undefined===req.session[field]){
            req.session[field]=1
            // return Promise.reject(helperError.sessionNotSet)
            // ap.inf('helperError.sessionNotSet',helperError.sessionNotSet)
            reject(misc.genFinalReturnResult(helperError.sessionNotSet))
        }
        //一定要返回一个resolve，否则app.js中的调用会无法继续
        else{
            resolve('1')
        }
    })
}

/*  产生captcha，并保存到redis
* */
async  function genCaptchaAdnSave_async({req,params}){
    // await controllerChecker.checkInterval_async({req:req,reqTypePrefix:'captcha'})

// ap.inf('interval done')
    let captchaString=misc.generateRandomString()
    // ap.inf('captchaString',captchaString)
    //获得session或者ip
    let userIdentify=await misc.getIdentify_async({req:req})
    // ap.inf('userIdentify for setCaptcha_async',userIdentify)
    //获得captcha expire time
    // ap.inf('globalConfiguration.defaultSetting.miscellaneous.captchaExpire.value',globalConfiguration.defaultSetting)
    let expireTime=globalConfiguration.defaultSetting.miscellaneous.captchaExpire.value

    // ap.inf('expireTime',expireTime)
    await redisOperation.set_async({db:2,key:`${userIdentify[0]}:captcha`,value:captchaString,expireTime:expireTime,expireUnit:'s'})

    // await misc.setCaptcha_async({req:req,captchaString:captchaString})
    // ap.inf('save captchaString to db done')
    //产生dataURL并返回
    let dataURL=await captcha_async({params:params,captchaString:captchaString})
    return Promise.resolve(dataURL)
}

/*  从req中提取captcha并和redis中的比较       */
async function getCaptchaAndCheck_async({req}){
    let clientCaptcha=req.body.values[e_part.CAPTCHA]

    //获得session或者ip
    let userIdentify=await misc.getIdentify_async({req:req})

    let serverCaptcha= await redisOperation.get_async({db:2,key:`${userIdentify[0]}:captcha`})
    // ap.inf('serverCaptcha',serverCaptcha)
    if(null===serverCaptcha){
        return Promise.reject(helperError.captchaExpire)

    }
    if(clientCaptcha.toLowerCase()!==serverCaptcha.toLowerCase()){
        return Promise.reject(helperError.captchaNotMatch)
    }else{
        //验证成功，立刻删除，防止复用
        // ap.inf('readt to del')
        await redisOperation.del_async({db:2,key:`${userIdentify[0]}:captcha`})
        return Promise.resolve(0)
    }
    // ap.inf('serverCaptcha',serverCaptcha)
}




module.exports= {
    checkOptionPartExist,//检查option中那些part是存在
    // inputCommonCheck,//每个请求进来是，都要进行的操作（时间间隔检查等）
    // validatePartValueFormat,
    // validatePartValue,//对每个part的值进行检查

    checkMethod,
    // CRUDPreCheck,
    // nonCRUDPreCheck,//inputCommonCheck+validatePartValueFormat+validatePartValue

    // covertToServerFormat,//将req中诸如RECORD_INFO/SINGLE_FIELD的值转换成server的格式，并去除不合格字段值（create：控制

    // checkIfFkExist_async,//检测doc中外键值是否在对应的coll中存在



    chooseStorePath_async,//根据某种算法（平均法），选择合适的storePath来存储文件
    chooseLastValidResourceProfile_async,//查找最近可用的resourceProfile
    setStorePathStatus,//根据原始storePath和新的usedSize，判断是否需要设置status为read only

    chooseProperAdminUser_async,//根据权限选择合适的adminUser
    // chooseValidAdminUserForImpeach,

    checkInternalValue,//


    // ifFkValueExist_async_old,

    deleteInternalField,//检查client端输入的值（recordInfo），如果其中包含了internalField，直接删除
    //preCheck_async,//user login+robot+penalize+delete internal+ CRUD

    uploadFileToTmpDir_async,

    contentXSSCheck_async,//如果输入的html，要进行XSS检查
    inputFieldValueXSSCheck,
    // removeImageDataUrl,//删除content中的dataUrl图片，防止未经授权的图片
    contentDbDeleteNotExistImage_async,

    calcExistResource_async,//根据resourceProfileRange，resourceProfileType，从预定义的对象中获得对应的fieldName和grougby的设置

    generateSugarAndHashPassword,//根据用户类型，生成sugar和hash过得密码

    setLoginUserInfo_async,
    getLoginUserInfo_async,

    deleteNotChangedValue,

    findResourceProfileRecords_async,

    pushOptionalPartIntoExpectedPart_noReturn,

    getPartValue,

    checkEditSubFieldFromTo_async,//判断editSubField中from/to的值
    checkEditSubFieldEleArray_async, //判断editSubField中eleArray的值

    setSessionByServer_async,

    genCaptchaAdnSave_async,
    getCaptchaAndCheck_async,


}


// chooseLastValidResourceProfile_async({resourceProfileRange:e_resourceProfileRange.DB.PER_ARTICLE, userId:'598a60bcdf548d0b3c2a7cd6'})