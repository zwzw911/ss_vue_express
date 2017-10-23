/**
 * Created by wzhan039 on 2017-07-10.
 */
'use strict'

const helper={
    /*              validatePartFormat              */
    unknownPartInFormatCheck:{rc:60000,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},

    /*              validatePartValue              */
    undefinedBaseRuleType:{rc:60002,msg:{client:'参数错误',server:'非预定义的baseType'}},
    unknownPartInValueCheck:{rc:60004,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},

    /*              checkIfFkExist_async            */
    fkValueNotExist(chineseFieldName,fieldInputValue){
        return {rc:60005,msg:{client:`${chineseFieldName}不存在`, server:`字段:${chineseFieldName}  的外键值${fieldInputValue}不存在`}}
    },
/*    fkFileNotExist(coll,field,fkValue,relatedColl){
        return {rc:60006,msg:{client:`外键不存在`,server:`检查coll ${coll}中的字段${field}，其值${fkValue}在对应的coll ${relatedColl}没有对应的值`}}
    },*/

    /*            CRUDPreCheck                        */
    undefinedUserState:{rc:60008,msg:{client:'内部错误',server:'非预定义的用户状态'}},
    undefinedColl:{rc:60010,msg:{client:'内部错误',server:'非预定义的的集合'}},

    /*            dispatcherPreCheck                        */
    methodPartMustExistInDispatcher:{rc:60012,msg:{client:'输入值格式错误',server:'dispatcher中必须有method'}},

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