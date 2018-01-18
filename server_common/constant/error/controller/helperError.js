/**
 * Created by wzhan039 on 2017-07-10.
 */
'use strict'

const helper={
    /*              checkOptionPartExist            */
    optionPartCheckFail:{rc:60000,msg:{client:'输入数据错误',server:'req中，没有optionPart定义的part值'}},
    /*              validatePartFormat              */
    unknownPartInFormatCheck:{rc:60001,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},

    /*              validatePartValue              */
    undefinedBaseRuleType:{rc:60002,msg:{client:'参数错误',server:'非预定义的baseType'}},
    unknownPartInValueCheck:{rc:60004,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},

    /*              checkIfFkExist_async            */
    fkValueNotExist(chineseFieldName,fieldInputValue){
        return {rc:60005,msg:{client:`${chineseFieldName}不存在`, server:`字段:${chineseFieldName}  的外键值${fieldInputValue}不存在`}}
    },


    /*            CRUDPreCheck                        */
    undefinedUserState:{rc:60008,msg:{client:'内部错误',server:'非预定义的用户状态'}},
    undefinedColl:{rc:60010,msg:{client:'内部错误',server:'非预定义的的集合'}},

    /*            dispatcherPreCheck                        */
    methodPartMustExistInDispatcher:{rc:60012,msg:{client:'输入值格式错误',server:'dispatcher中必须有method'}},

    /*            chooseValidAdminUserForImpeach                        */
    noAnyAdminUserHasDefinedPriority({arr_adminPriority}){
     return {rc:60013,msg:{client:`暂时没有客服为您处理举报，请稍后再试。`,server:`没有任何管理员拥有对应的处理举报权限：${JSON.stringify(arr_adminPriority)}`}}
     },
    /*            uploadFileToTmpDir                        */
    uploadFileNameSanityFail:{rc:60014,msg:{client:'文件名称不正确',server:'uploadFileToTmpDir_async函数中，上传的文件名称没有通过sanity测试，可能包含有害内容'}},

    /*                  generateSugarAndhashPassword                */
    userTypeNotCorrect:{rc:60016,msg:{client:'用户类型不正确',server:'用户类型不正确，用户只能是管理员或者普通用户类型'}},

    /*                  set login info                              */
    userInfoUndefine:{rc:60018,msg:{client:'内部错误',server:'userInfo未定义'}},
    mandatoryFieldValueUndefine(fieldName){
        return {rc:60020,msg:{client:'内部错误',server:`userInfo中，必须字段${fieldName}未定义`}}
        },

    /*                  get login info                              */
    userInfoNotInSession:{rc:60022,msg:{client:'内部错误',server:'userInfo未在session中找到'}},

    /*                  XSS check                              */
    XSSCheckFailed(fieldName){
        return {rc:60024,msg:{client:'输入有误',server:`字段${fieldName}的内容无法通过XSS检测`}}
    },

    /*                  calc exist resource                              */
    missParameter(parameterName){
        return {rc:60026,msg:{client:'输入有误',server:`缺少参数${parameterName}`}}
    },

    cantFindResourceFileOrNumNotMatch:{rc:60028,msg:{'client':"内部错误，请联系管理员",server:`查询得到的资源配置数量和代码中定义的不一致`}},

    /*                  checkEditSubFieldValue_async                    */
    // fromRecordIdNotExists:{rc:60030,msg:{'client':"数据不存在，无法操作",server:`editSubField中，from所指的记录不存在`}},
    // toRecordIdNotExists:{rc:60032,msg:{'client':"数据不存在，无法操作",server:`editSubField中，to所指的记录不存在`}},
    fkConfigUndefined:{rc:60030,msg:{'client':"内部错误，请联系管理员",server:`eleArray数据类型为objectId，但是没有对应的fkConfig`}},
    eleArrayLengthExceed:{rc:60031,msg:{'client':"要移动数据过多",server:`eleArray中包含的元素数量，超过字段array_max_length中定义`}},
    eleArrayContainDuplicateEle:{rc:60032,msg:{'client':"要移动数据有重复值",server:`eleArray中有重复数据`}},
    toIdNotExist:{rc:60033,msg:{'client':"数据错误",server:`to的id没有对应的记录`}},
    toRecordNotEnoughRoom:{rc:60034,msg:{'client':"要移动数据过多",server:`to对应的记录，无法容纳eleArray中的数据`}},
    eleArrayRecordIdNotExists:{rc:60035,msg:{'client':"数据不存在，无法操作",server:`editSubField中，eleArray所指的记录部分或者全部不存在`}},
    // fkConfigNotDefineOwnerField:{rc:60035,msg:{'client':"内部错误，请联系管理员",server:`fkConfig中，没有为ELE_ARRAY对应的coll，定义对应的owner的字段名称`}},
    notOwnerOfEleArray:{rc:60036,msg:{'client':"无权移动数据",server:`editSubField中，用户不是eleArray中数据的拥有者，无权移动`}},
    eleArrayNotObjectId:{rc:60040,msg:{'client':"内部错误，请联系管理员",server:`eleArray数据类型不是objectId，需要controllerHelper->checkEditSubFieldValue_async添加新代码处理`}},


    /*          checkInternalValue                  */
    undefinedMethod:{rc:60050,msg:{'client':"内部错误，请联系管理员",server:`不支持的method`}},
}

const checker={
    'collRuleNotDefinedCantCheckEnumArray':{rc:61000,msg:{client:'内部错误',server:'collRule未定义，无法检测对应的collValue中是否有enum array'}},
    containDuplicateValue({fieldName}){
        return {rc:61002,msg:{client:`${fieldName}的值有重复`,server:`${fieldName}的值有重复`}}
    },

    'adminUserPriorityCantBeEmpty':{rc:61002,msg:{client:`待检测的用户权限不能为空`,server:`待检测的用户权限不能为空`}},
    'adminUserCantBeEmpty':{rc:61004,msg:{client:`待检测的用户不能为空`,server:`待检测的用户不能为空`}},

    'userInfoUndefined':{rc:61006,msg:{client:`用户尚未登录`,server:`检测用户类型，但是用户尚未登录`}},
    'userTypeNotExpected':{rc:61006,msg:{client:`用户类型不正确`,server:`用户类型不正确，无法执行对应的操作`}},

    /*          unique check            */
    //collName和fieldName都根据constant/enum/DB_uniqueField而来
    fieldValueUniqueCheckError({collName,fieldName,fieldChineseName}){
        switch (collName){
            case "admin_user":
                switch (fieldName){
                    case "name":
                        return {rc:61100,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61102,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break
            case "category":
                switch (fieldName){
                    case "name":
                        return {rc:61110,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61112,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break
            case "store_path":
                switch (fieldName){
                    case "name":
                        return {rc:61120,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    case "path":
                        return {rc:61122,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61124,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "tag":
                switch (fieldName){
                    case "name":
                        return {rc:61130,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61132,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "public_group":
                switch (fieldName){
                    case "name":
                        return {rc:61140,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61142,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "sugar":
                switch (fieldName){
                    case "userId":
                        return {rc:61150,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61152,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "user":
                switch (fieldName){
                    case "name":
                        return {rc:61160,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    case "account":
                        return {rc:61162,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61164,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "user_input_keyword":
                switch (fieldName){
                    case "name":
                        return {rc:61170,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:61172,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;

        }
        return {rc:0}
    },

    /*          compound field unique check                 */
    compoundFieldHasMultipleDuplicateRecord({collName,arr_compoundField}){
        return {rc:61200,msg:{client:`内部错误，请联系管理员`,server:`表${collName}的复合字段${arr_compoundField.join('+')}存在多个重复记录`}}
    },

    /*      ifFileSuffixMatchContentType_async          */
    uploadFileHasNoSuffix:{rc:61202,msg:{client:`上传文件没有后缀，无法区分文件类型`}},


}

/*admin_user:["name",],
    category:["name",],
    store_path:["name","path",],
    tag:["name",],
    public_group:["name",],
    sugar:["userId",],
    user:["name","account",],
    user_input_keyword:["name",],*/
module.exports={
    helper,
    checker,
}