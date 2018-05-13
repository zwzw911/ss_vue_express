/**
 * Created by wzhan039 on 2017-07-10.
 */
'use strict'
const regex=require('../../regex/regex').regex

const baseErrorCode=60000

const helperBaseErrorCode=baseErrorCode
const checkerBaseErrorCode=baseErrorCode+100
const preCheckBaseErrorCode=baseErrorCode+200
const dispatchBaseErrorCode=baseErrorCode+300
const resourceCheckBaseErrorCode=baseErrorCode+400
const inputValueLogicCheckError=baseErrorCode+500

const helper={
    /*              checkOptionPartExist            */
    optionPartCheckFail:{rc:helperBaseErrorCode,msg:{client:'输入数据错误',server:'req中，没有optionPart定义的part值'}},
    /*              validatePartFormat              */
    unknownPartInFormatCheck:{rc:helperBaseErrorCode+2,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},

    /*              validatePartValue              */
    undefinedBaseRuleType:{rc:helperBaseErrorCode+4,msg:{client:'参数错误',server:'非预定义的baseType'}},
    unknownPartInValueCheck:{rc:helperBaseErrorCode+6,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},





    /*            CRUDPreCheck                        */
    // undefinedUserState:{rc:60008,msg:{client:'内部错误',server:'非预定义的用户状态'}},


    /*            dispatcherPreCheck                        */
    methodPartMustExistInDispatcher:{rc:helperBaseErrorCode+12,msg:{client:'输入值格式错误',server:'dispatcher中必须有method'}},

    /*            chooseValidAdminUserForImpeach                        */
    noAnyAdminUserHasDefinedPriority({arr_adminPriority}){
     return {rc:helperBaseErrorCode+14,msg:{client:`暂时没有客服为您处理举报，请稍后再试。`,server:`没有任何管理员拥有对应的处理举报权限：${JSON.stringify(arr_adminPriority)}`}}
     },
    /*            uploadFileToTmpDir                        */
    uploadFileNameSanityFail:{rc:helperBaseErrorCode+16,msg:{client:'文件名称不正确',server:'uploadFileToTmpDir_async函数中，上传的文件名称没有通过sanity测试，可能包含有害内容'}},

    /*                  generateSugarAndhashPassword                */
    userTypeNotCorrect:{rc:helperBaseErrorCode+18,msg:{client:'用户类型不正确',server:'用户类型不正确，用户只能是管理员或者普通用户类型'}},

    /*                  set login info                              */
    userInfoUndefine:{rc:helperBaseErrorCode+20,msg:{client:'内部错误',server:'userInfo未定义'}},
    mandatoryFieldValueUndefine(fieldName){
        return {rc:helperBaseErrorCode+22,msg:{client:'内部错误',server:`userInfo中，必须字段${fieldName}未定义`}}
        },

    /*                  get login info                              */
    userInfoNotInSession:{rc:helperBaseErrorCode+24,msg:{client:'用户尚未登录',server:'userInfo未在session中找到'}},

    /*                  XSS check                              */
    XSSCheckFailed(fieldName){
        return {rc:helperBaseErrorCode+26,msg:{client:'输入有误',server:`字段${fieldName}的内容无法通过XSS检测`}}
    },

    /*                  calc exist resource                              */
    missParameter(parameterName){
        return {rc:helperBaseErrorCode+28,msg:{client:'输入有误',server:`缺少参数${parameterName}`}}
    },

    cantFindResourceFileOrNumNotMatch:{rc:helperBaseErrorCode+30,msg:{'client':"内部错误，请联系管理员",server:`查询得到的资源配置数量和代码中定义的不一致`}},

    /*                  checkEditSubFieldValue_async                    */
    // fromRecordIdNotExists:{rc:60030,msg:{'client':"数据不存在，无法操作",server:`editSubField中，from所指的记录不存在`}},
    // toRecordIdNotExists:{rc:60032,msg:{'client':"数据不存在，无法操作",server:`editSubField中，to所指的记录不存在`}},
    fkConfigUndefined:{rc:helperBaseErrorCode+32,msg:{'client':"内部错误，请联系管理员",server:`eleArray数据类型为objectId，但是没有对应的fkConfig`}},
    eleArrayLengthExceed:{rc:helperBaseErrorCode+34,msg:{'client':"要移动数据过多",server:`eleArray中包含的元素数量，超过字段array_max_length中定义`}},
    eleArrayContainDuplicateEle:{rc:helperBaseErrorCode+36,msg:{'client':"要移动数据有重复值",server:`eleArray中有重复数据`}},
    toIdNotExist:{rc:helperBaseErrorCode+38,msg:{'client':"数据错误",server:`to的id没有对应的记录`}},
    toRecordNotEnoughRoom:{rc:helperBaseErrorCode+40,msg:{'client':"要移动数据过多",server:`to对应的记录，无法容纳eleArray中的数据`}},
    eleArrayRecordIdNotExists:{rc:helperBaseErrorCode+42,msg:{'client':"数据不存在，无法操作",server:`editSubField中，eleArray所指的记录部分或者全部不存在`}},
    // fkConfigNotDefineOwnerField:{rc:60035,msg:{'client':"内部错误，请联系管理员",server:`fkConfig中，没有为ELE_ARRAY对应的coll，定义对应的owner的字段名称`}},
    notOwnerOfEleArray:{rc:helperBaseErrorCode+44,msg:{'client':"无权移动数据",server:`editSubField中，用户不是eleArray中数据的拥有者，无权移动`}},
    eleArrayNotObjectId:{rc:helperBaseErrorCode+46,msg:{'client':"内部错误，请联系管理员",server:`eleArray数据类型不是objectId，需要controllerHelper->checkEditSubFieldValue_async添加新代码处理`}},


    /*          checkInternalValue                  */
    undefinedMethod:{rc:helperBaseErrorCode+48,msg:{'client':"内部错误，请联系管理员",server:`不支持的method`}},

    /*      setSessionByServer_async                    */
    sessionNotSet:{rc:helperBaseErrorCode+50,msg:{client:`尚未登录，请登录后重试`,server:`session尚未设置，请重发请求`}},

    /*         getCaptchaAndCheck_async                 */
    captchaNotMatch:{rc:helperBaseErrorCode+52,msg:{client:`图形验证码错误`,server:`captcha和server端存储的内容不一致`}},
    captchaExpire:{rc:helperBaseErrorCode+54,msg:{client:`图形验证码超时`,server:`redis中没有capatcha`}},

}

const checker={




    'adminUserPriorityCantBeEmpty':{rc:checkerBaseErrorCode+6,msg:{client:`待检测的用户权限不能为空`,server:`待检测的用户权限不能为空`}},
    'adminUserCantBeEmpty':{rc:checkerBaseErrorCode+8,msg:{client:`待检测的用户不能为空`,server:`待检测的用户不能为空`}},

    'userInfoUndefined':{rc:checkerBaseErrorCode+10,msg:{client:`用户尚未登录`,server:`检测用户类型，但是用户尚未登录`}},
    'userTypeNotExpected':{rc:checkerBaseErrorCode+12,msg:{client:`用户类型不正确`,server:`用户类型不正确，无法执行对应的操作`}},

    /*          unique check            */
    //collName和fieldName都根据constant/enum/DB_uniqueField而来
    /*fieldValueUniqueCheckError({collName,fieldName,fieldChineseName,fieldValue}){
        switch (collName){
            case "admin_user":
                switch (fieldName){
                    case "name":
                        return {rc:checkerBaseErrorCode+14,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+16,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break
            case "category":
                switch (fieldName){
                    case "name":
                        return {rc:checkerBaseErrorCode+18,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+20,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break
            case "store_path":
                switch (fieldName){
                    case "name":
                        return {rc:checkerBaseErrorCode+22,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    case "path":
                        return {rc:checkerBaseErrorCode+24,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+26,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break;
            case "tag":
                switch (fieldName){
                    case "name":
                        return {rc:checkerBaseErrorCode+28,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+30,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break;
            case "public_group":
                switch (fieldName){
                    case "name":
                        return {rc:checkerBaseErrorCode+32,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+34,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break;
            case "sugar":
                switch (fieldName){
                    case "userId":
                        return {rc:checkerBaseErrorCode+36,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+38,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break;
            case "user":
                switch (fieldName){
                    case "name":
                        return {rc:checkerBaseErrorCode+40,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    case "account":
                        let accountChineseName=`未知类型的账号已经存在`
                        if(true===regex.mobilePhone.test(fieldValue)){
                            accountChineseName=`手机号已经存在`
                        }
                        if(true===regex.email.test(fieldValue)){
                            accountChineseName=`邮件地址已经存在`
                        }
                        return {rc:checkerBaseErrorCode+42,msg:{client:`${accountChineseName}`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+44,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break;
            case "user_input_keyword":
                switch (fieldName){
                    case "name":
                        return {rc:checkerBaseErrorCode+46,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        // break;
                    default:
                        return {rc:checkerBaseErrorCode+48,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                // break;

        }
        return {rc:0}
    },*/

    /*          compound field unique check                 */
    compoundFieldHasMultipleDuplicateRecord({collName,arr_compoundField}){
        return {rc:checkerBaseErrorCode+50,msg:{client:`内部错误，请联系管理员`,server:`表${collName}的复合字段${arr_compoundField.join('+')}存在多个重复记录`}}
    },

    /*      ifFileSuffixMatchContentType_async          */
    uploadFileHasNoSuffix:{rc:checkerBaseErrorCode+52,msg:{client:`上传文件没有后缀，无法区分文件类型`}},

}

const preCheck={
    userStateCheck:{
        demandUserLoginCheckButWithoutRelatedError:{rc:preCheckBaseErrorCode,msg:{client:`内部错误，请联系管理员`,server:`userStateCheck_async中，参数userLoginCheck中，needCheck=true，但是对应的error没有设置，以便检测到用户未登录时，返回此错误`}},
        penalizeCheckParamMissError:{rc:preCheckBaseErrorCode+2,msg:{client:`内部错误，请联系管理员`,server:`userStateCheck_async中，设置了penalize检测的参数，penalizeType和penalizeSubType，但是没有设置Error，以便penalize检测不通过是返回此error`}},
        demandPenalizeCheckButUserNotLogin:{rc:preCheckBaseErrorCode+4,msg:{client:`内部错误，请联系管理员`,server:`userStateCheck_async中，设置了penalize检测的参数，但是用户未登录，无法检测penalize，请检查是否需要将userLoginCheck.needCheck设成true`}}
    },
    inputPreCheck:{
        undefinedColl:{rc:preCheckBaseErrorCode+6,msg:{client:'内部错误',server:'非预定义的集合'}},
    }
}

const dispatch={
    common:{
        unknownRequestRul:{rc:dispatchBaseErrorCode,msg:{client:'网页不存在',server:'URL没有匹配的处理函数'}}
    }
}

//对controller->resourceCheck设定error
const resourceCheck={
    findValidResourceProfiles_async:{
        userHasNoProfileForProFileRange({profileRange}){
            return {rc:resourceCheckBaseErrorCode,msg:{client:'内部错误，请联系管理员',server:`资源范围${profileRange}没有查找到可用的profile记录`}}
        },

    },
    calcArticleResourceUsage_async:{
        articleNotExistCantCalcResource:{rc:resourceCheckBaseErrorCode+2,msg:{client:'文档不存在',server:'文档不存在，无法计算文档的资源使用情况'}},
        unknownResourceProfileRange:{rc:resourceCheckBaseErrorCode+4,msg:{client:'内部错误，请联系管理员',server:'未知的资源范围'}},
    },
    calcUserTotalResourceUsage_async:{
        userNotExistCantGetUsage:{rc:resourceCheckBaseErrorCode+6,msg:{client:'内部错误，请联系管理员',server:'无法查找到用户的资源使用记录'}},
    },
    ifEnoughResource_async:{
        articleAttachmentDiskUsageExceed({resourceProfileRangeSizeInMb}){
            return {rc:resourceCheckBaseErrorCode+8,msg:{client:`文档最多容纳${resourceProfileRangeSizeInMb}MB的附件，剩余空间无法存储当前上传的文件`}}
        },
        articleAttachmentNumExceed({resourceProfileNum}){
            return {rc:resourceCheckBaseErrorCode+10,msg:{client:`文档最多容纳${resourceProfileNum}个附件，当前上传的附件的数量大于剩余文件数量`}}
        },
        articleImageDiskUsageExceed({resourceProfileRangeSizeInMb}){
            return {rc:resourceCheckBaseErrorCode+12,msg:{client:`文档最多容纳${resourceProfileRangeSizeInMb}MB的图片，剩余空间无法存储当前上传的图片`}}
        },
        articleImageNumExceed({resourceProfileNum}){
            return {rc:resourceCheckBaseErrorCode+14,msg:{client:`文档最多容纳${resourceProfileNum}个图片，当前上传的图片的数量大于剩余文件数量`}}
        },
        userTotalDiskUsageExceed({resourceProfileRangeSizeInMb}){
            return {rc:resourceCheckBaseErrorCode+16,msg:{client:`您的总存储空间为${resourceProfileRangeSizeInMb}MB，剩余空间无法存储当前上传的文件`}}
        },
        userTotalFileNumExceed({resourceProfileNum}){
            return {rc:resourceCheckBaseErrorCode+18,msg:{client:`您的总存储文件数量为${resourceProfileNum}，当前上传的文件的数量大于剩余文件数量`}}
        },

        totalFolderNumExceed({resourceProfileNum}){
            return {rc:resourceCheckBaseErrorCode+18,msg:{client:`您已达到最大可以创建的目录数量${resourceProfileNum}，无法新建目录`}}
        },
    }
}

const inputValueLogicCheck={
    getFieldDataTypeInfo:{
        dataTypeUndefined({collName,fieldName}) {
            return {rc:inputValueLogicCheckError,msg:{client:`内部错误，请联系管理员`, server:`无法获得表${collName}的字段${fieldName}的数据类型`}}
        }
    },
    /*              checkIfFkExist_async            */
    ifFkValueExist_And_FkHasPriority_async:{
        fkValueNotExist(chineseFieldName,fieldInputValue){
            return {rc:inputValueLogicCheckError+8,msg:{client:`${chineseFieldName}不存在`, server:`字段:${chineseFieldName}  的外键值${fieldInputValue}不存在`}}
        },
        notHasPriorityForFkField(chineseFieldName,fieldInputValue){
            return {rc:inputValueLogicCheckError+10,msg:{client:`无权对${chineseFieldName}的值进行操作`, server:`当前用户无权对外键字段:${chineseFieldName}  的值${fieldInputValue}所对应的记录进行操作`}}
        },
    },

    ifEnumHasDuplicateValue:{
        // 'collRuleNotDefinedCantCheckEnumArray':{rc:checkerBaseErrorCode,msg:{client:'内部错误',server:'collRule未定义，无法检测对应的collValue中是否有enum array'}},
        containDuplicateValue({fieldName}){
            return {rc:inputValueLogicCheckError+2,msg:{client:`${fieldName}的值有重复`,server:`${fieldName}的值有重复`}}
        },
/*        fieldInValueNoMatchedRule({fieldName}){
            return {rc:inputValueLogicCheckError+4,msg:{client:`未知字段${fieldName}`,server:`${fieldName}在对应的collRule中没有对应的rule`}}
        },*/
    },
    ifSingleFieldValueUnique_async:{
        fieldValueNotUnique({collName,fieldName,fieldChineseName,fieldValue}){
            return {rc:inputValueLogicCheckError+26,msg:{client:`${fieldChineseName} ${fieldValue}已经存在`,server:`集合${collName}的字段${fieldName}，值${fieldValue}已经存在`}}
        }
    },
    ifValueXSS:{
        fieldValueXSS({fieldName}){
            return {rc:inputValueLogicCheckError+2,msg:{client:`${fieldName}的值包含有害内容`,server:`${fieldName}的值有XSS内容`}}
        }
    },
}
module.exports={
    helper,
    checker,
    preCheck,
    dispatch,
    resourceCheck,
    inputValueLogicCheck,
}