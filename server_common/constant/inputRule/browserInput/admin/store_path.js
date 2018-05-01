/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const inputDataRuleType=require('../../../enum/inputDataRuleType')
const serverDataType=inputDataRuleType.ServerDataType
const ruleFiledName=inputDataRuleType.RuleFiledName
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const applyRange=inputDataRuleType.ApplyRange

const regex=require('../../../regex/regex').regex

/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../constant/genEnum//enumValue')

const baseJSErrorCode=100300
const baseMongoErrorCode=200300

/*          部分字段可以更新             */
const store_path= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '存储路径名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '存储路径名称不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '存储路径名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: baseJSErrorCode+2, msg: '存储路径名称至少1个字符'}, mongoError: {rc: baseMongoErrorCode+2, msg: '存储路径名称至少1个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: baseJSErrorCode+4, msg: '存储路径名称的长度不能超过50个字符'}, mongoError: {rc: baseMongoErrorCode+4, msg: '存储路径名称的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    path: {
        [otherRuleFiledName.CHINESE_NAME]: '存储路径',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.FOLDER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+6, msg: '存储路径不能为空'}, mongoError: {rc: baseMongoErrorCode+6, msg: '存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    usage: {
        [otherRuleFiledName.CHINESE_NAME]: '用途',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+8, msg: '存储路径用途不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '存储路径用途不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.StorePathUsage,error:{rc:baseJSErrorCode+10,msg:'储路径用途的类型不正确'},mongoError:{rc:baseMongoErrorCode+10,msg:'储路径用途的类型不正确'}},//server端使用
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    sizeInKb: {
        [otherRuleFiledName.CHINESE_NAME]: '容量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+12, msg: '容量不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '容量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN]: {define: 1, error: {rc: 10314}, mongoError: {rc: 20314, msg: '处罚时间最少1天'}},
        [ruleFiledName.MAX]: {define: 1000*1000, error: {rc: baseJSErrorCode+14, msg: '容量最多1000M'}, mongoError: {rc: baseMongoErrorCode+14, msg: '容量最多1000M'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    lowThreshold: {
        [otherRuleFiledName.CHINESE_NAME]: '容量下限值',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+16, msg: '容量下限值不能为空'}, mongoError: {rc: baseMongoErrorCode+16, msg: '容量下限值不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN]: {define: 50, error: {rc: baseJSErrorCode+18, msg: '容量下限值至少50%'}, mongoError: {rc: baseMongoErrorCode+18, msg: '容量下限值至少50%'}},
        [ruleFiledName.MAX]: {define: 80, error: {rc: baseJSErrorCode+20, msg: '容量门限报警值最多95%'}, mongoError: {rc: baseMongoErrorCode+20, msg: '容量门限报警值最多95%'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    highThreshold: {
        [otherRuleFiledName.CHINESE_NAME]: '容量上限值',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+22, msg: '容量上限值不能为空'}, mongoError: {rc: baseMongoErrorCode+22, msg: '容量上限值不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN]: {define: 60, error: {rc: baseJSErrorCode+24, msg: '容量上限值至少60%'}, mongoError: {rc: baseMongoErrorCode+24, msg: '容量上限值至少60%'}},
        [ruleFiledName.MAX]: {define: 95, error: {rc: baseJSErrorCode+26, msg: '容量上限值最多95%'}, mongoError: {rc: baseMongoErrorCode+26, msg: '容量上限值最多95%'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
}

module.exports={
    store_path
}