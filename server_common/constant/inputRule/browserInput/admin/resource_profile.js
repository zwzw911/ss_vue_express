/**
 * Created by ada on 2017-06-09.
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
const enumValue=require('../../../../constant/genEnum/enumValue')

const baseJSErrorCode=100500
const baseMongoErrorCode=200500

/*                  资源配置是通过直接db操作完成，而不是API；不能修改配置的参数，而用新创建一个来代替                */
const resource_profile= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '资源配置名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,], //只能create，不能update
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '资源配置名称不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '资源配置名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: baseJSErrorCode+2, msg: '资源配置名称至少2个字符'}, mongoError: {rc: baseMongoErrorCode+2, msg: '资源配置名称至少2个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: baseJSErrorCode+4, msg: '资源配置名称的长度不能超过50个字符'}, mongoError: {rc: baseMongoErrorCode+4, msg: '资源配置名称的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    range: {
        [otherRuleFiledName.CHINESE_NAME]: '资源配置范围',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,], //只能create，不能update
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+6, msg: '资源配置范围不能为空'}, mongoError: {rc: baseMongoErrorCode+6, msg: '资源配置范围不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.ResourceRange,error:{rc:baseJSErrorCode+8,msg:'资源配置范围的类型不正确'},mongoError:{rc:baseMongoErrorCode+8,msg:'资源配置范围的类型不正确'}},//server端使用
    },
    type: {
        [otherRuleFiledName.CHINESE_NAME]: '资源配置类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,], //只能create，不能update
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+10, msg: '资源配置类型不能为空'}, mongoError: {rc: baseMongoErrorCode+10, msg: '资源配置类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.ResourceType,error:{rc:baseJSErrorCode+12,msg:'资源配置类型的值类型不正确'},mongoError:{rc:baseMongoErrorCode+12,msg:'资源配置类型的值类型不正确'}},//server端使用
    },
    maxNum: {
        [otherRuleFiledName.CHINESE_NAME]: '最大文件数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,], //只能create，不能update
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+14, msg: '最大文件数量不能为空'}, mongoError: {rc: baseMongoErrorCode+14, msg: '最大文件数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'max': {define: 1000*1000, error: {rc: 10071}, mongoError: {rc: 20071, msg: '容量最多1000M'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    maxDiskSpaceInMb: {
        [otherRuleFiledName.CHINESE_NAME]: '最大存储空间',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,], //只能create，不能update
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+16, msg: '最大存储空间不能为空'}, mongoError: {rc: baseMongoErrorCode+16, msg: '最大存储空间不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10314}, mongoError: {rc: 20314, msg: '处罚时间最少1天'}},
        // 'max': {define: 1000*1000, error: {rc: 10071}, mongoError: {rc: 20071, msg: '容量最多1000M'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },

}

module.exports={
    resource_profile
}