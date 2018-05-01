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
//const enumValue=require('../../../../model/mongo/structure/enumValue')
const enumValue=require('../../../../constant/genEnum/enumValue')

const baseJSErrorCode=100400
const baseMongoErrorCode=200400

const admin_penalize= {
    punishedId: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [otherRuleFiledName.PLACE_HOLDER]:['受罚人账号，手机号或者邮件地址'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '受罚人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '受罚人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '受罚人格式不正确'}, mongoError: {rc: baseMongoErrorCode+2, msg: '受罚人格式不正确'}} //server端使用
    },

    reason: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚原因',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [otherRuleFiledName.PLACE_HOLDER]:['受罚原因，至少15个字符'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '受罚原因不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '受罚原因不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: baseJSErrorCode+6, msg: '受罚原因至少15个字符'}, mongoError: {rc: baseMongoErrorCode+6, msg: '受罚原因至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 1000, error: {rc: baseJSErrorCode+8, msg: '受罚原因的字数不能超过1000个字符'}, mongoError: {rc: baseMongoErrorCode+8, msg: '受罚原因的字数不能超过1000个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.password, error: {rc: 10012}, mongoError: {rc: 20012, msg: '密码必须由6-20个字符组成'}} //server端使用
    },

    //user type
    penalizeType: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+10, msg: '受罚类型不能为空'}, mongoError: {rc: baseMongoErrorCode+10, msg: '受罚类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.PenalizeType,error:{rc:baseJSErrorCode+12,msg:'受罚类型不正确'},mongoError:{rc:baseMongoErrorCode+12,msg:'受罚类型不正确'}},//server端使用
    },
    penalizeSubType: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚子类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+14, msg: '受罚子类型不能为空'}, mongoError: {rc: baseMongoErrorCode+14, msg: '受罚子类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.PenalizeSubType,error:{rc:baseJSErrorCode+16,msg:'受罚子类型不正确'},mongoError:{rc:baseMongoErrorCode+16,msg:'受罚子类型不正确'}},//server端使用
    },
    //user priority
    duration: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚时长',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+18, msg: '受罚时长不能为空'}, mongoError: {rc: baseMongoErrorCode+18, msg: '受罚时长不能为空'}},//用户权限初始可以为空，以后ROOT用户进行分配
        [ruleFiledName.MIN]: {define: 0, error: {rc: baseJSErrorCode+20, msg: '受罚时长至少1天'}, mongoError: {rc: baseMongoErrorCode+20, msg: '受罚时长至少1天'}},
        [ruleFiledName.MAX]: {define: 30, error: {rc: baseJSErrorCode+22, msg: '受罚时长最长30天'}, mongoError: {rc: baseMongoErrorCode+22, msg: '受罚时长最长30天'}},
    },
    //撤销理由，只在delete的时候才使用，create的时候要在code中删除
    revokeReason:{
        [otherRuleFiledName.CHINESE_NAME]: '撤销原因',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.DELETE], //只能在update的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.DELETE]:true}, error: {rc: baseJSErrorCode+24, msg: '撤销原因不能为空'}, mongoError: {rc: baseMongoErrorCode+24, msg: '撤销原因不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: baseJSErrorCode+26, msg: '撤销原因至少15个字符'}, mongoError: {rc: baseMongoErrorCode+26, msg: '撤销原因至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 1000, error: {rc: baseJSErrorCode+28, msg: '撤销原因原因的字数不能超过1000个字符'}, mongoError: {rc: baseMongoErrorCode+28, msg: '撤销原因原因的字数不能超过1000个字符'}},
    },
}

module.exports={
    admin_penalize
 }