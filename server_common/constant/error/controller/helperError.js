/**
 * Created by wzhan039 on 2017-07-10.
 */
'use strict'

const helper={
    /*              validatePartFormat              */
    unknownPartInFormatCheck:{rc:50000,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},

    /*              validatePartValue              */
    undefinedBaseRuleType:{rc:50002,msg:{client:'参数错误',server:'非预定义的baseType'}},
    unknownPartInValueCheck:{rc:50004,msg:{client:'输入数据错误',server:'输入数据中有未知的part'}},

    /*              checkIfFkExist_async            */
    fkValueNotExist(chineseFieldName,fieldInputValue){
        return {rc:50005,msg:{client:`${chineseFieldName}不存在`, server:`字段:${chineseFieldName}  的外键值${fieldInputValue}不存在`}}
    },
/*    fkFileNotExist(coll,field,fkValue,relatedColl){
        return {rc:50006,msg:{client:`外键不存在`,server:`检查coll ${coll}中的字段${field}，其值${fkValue}在对应的coll ${relatedColl}没有对应的值`}}
    },*/

    /*            CRUDPreCheck                        */
    undefinedUserState:{rc:50008,msg:{client:'内部错误',server:'非预定义的用户状态'}},
    undefinedColl:{rc:50010,msg:{client:'内部错误',server:'非预定义的的集合'}},

    /*            dispatcherPreCheck                        */
    methodPartMustExistInDispatcher:{rc:50012,msg:{client:'输入值格式错误',server:'dispatcher中必须有method'}},

    /*            uploadFileToTmpDir                        */
    uploadFileNameSanityFail:{rc:50014,msg:{client:'文件名称不正确',server:'uploadFileToTmpDir_async函数中，上传的文件名称没有通过sanity测试，可能包含有害内容'}},

    /*                  generateSugarAndhashPassword                */
    userTypeNotCorrect:{rc:50016,msg:{client:'用户类型不正确',server:'用户类型不正确，用户只能是管理员或者普通用户类型'}},

    /*          unique check            */
    //collName和fieldName都根据constant/enum/DB_uniqueField而来
    fieldValueUniqueCheckError({collName,fieldName,fieldChineseName}){
        switch (collName){
            case "admin_user":
                switch (fieldName){
                    case "name":
                        return {rc:50100,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50102,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break
            case "category":
                switch (fieldName){
                    case "name":
                        return {rc:50110,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50112,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break
            case "store_path":
                switch (fieldName){
                    case "name":
                        return {rc:50120,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    case "path":
                        return {rc:50122,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50124,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "tag":
                switch (fieldName){
                    case "name":
                        return {rc:50130,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50132,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "public_group":
                switch (fieldName){
                    case "name":
                        return {rc:50140,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50142,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "sugar":
                switch (fieldName){
                    case "userId":
                        return {rc:50150,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50152,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "user":
                switch (fieldName){
                    case "name":
                        return {rc:50160,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    case "account":
                        return {rc:50162,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50164,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
                }
                break;
            case "user_input_keyword":
                switch (fieldName){
                    case "name":
                        return {rc:50170,msg:{client:`已经有相同的${fieldChineseName}存在`,server:`集合${collName}的字段${fieldName}是unique，其中已经有同样的值存在了`}}
                        break;
                    default:
                        return {rc:50172,msg:{client:'内部错误，请联系管理员',server:`集合${collName}中出现未知unique字段`}}
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
    helper
}