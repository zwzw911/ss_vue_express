/**
 * Created by wzhan039 on 2017-07-10.
 */
'use strict'

const helper={
    wrongMethodTypeForRecordInfo:{rc:50000,msg:{client:'参数错误',server:'recordInfo只能出现在create或者update操作中'}},

    /*              checkIfFkExist_async            */
    fkFileNotExist(coll,field,fkValue,relatedColl){
        return {rc:50002,msg:{client:`外键不存在`,server:`检查coll ${coll}中的字段${field}，其值${fkValue}在对应的coll ${relatedColl}没有对应的值`}}
    }
}

module.exports={
    helper
}