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
    fkFileNotExist(coll,field,fkValue,relatedColl){
        return {rc:50006,msg:{client:`外键不存在`,server:`检查coll ${coll}中的字段${field}，其值${fkValue}在对应的coll ${relatedColl}没有对应的值`}}
    },

    /*            CRUDPreCheck                        */
    undefinedUserState:{rc:50008,msg:{client:'内部错误',server:'非预定义的用户状态'}},
    undefinedColl:{rc:50010,msg:{client:'内部错误',server:'非预定义的的集合'}},

    /*            dispatcherPreCheck                        */
    methodPartMustExistInDispatcher:{rc:50012,msg:{client:'输入值格式错误',server:'dispatcher中必须有method'}},
}

module.exports={
    helper
}