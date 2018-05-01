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

const baseJSErrorCode=100450
const baseMongoErrorCode=200450

const admin_penalize= {
    creatorId: {
        [otherRuleFiledName.CHINESE_NAME]: '处罚人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '处罚人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '处罚人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '处罚人格式不正确'}, mongoError: {rc: baseMongoErrorCode+2, msg: '处罚人格式不正确'}} //server端使用
    },
    revokerId: {
        [otherRuleFiledName.CHINESE_NAME]: '撤销人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+4, msg: '撤销人不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '撤销人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+6, msg: '撤销人格式不正确'}, mongoError: {rc: baseMongoErrorCode+6, msg: '撤销人格式不正确'}} //server端使用
    },
    //CU的时候，自动根据duration计算（因为isExpire不支持查询，所以添加此字段作为查询条件）
    //applyRange和duration一致
    endDate:{
        [otherRuleFiledName.CHINESE_NAME]: '处罚结束日期',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.DATE,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+8, msg: '处罚结束日期不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '处罚结束日期不能为空'}},//duration=0的时候，无需设置endDate
        // [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        //[ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10098}, mongoError: {rc: 20098, msg: '撤销人格式不正确'}} //server端使用
    },

}

module.exports={
    admin_penalize,
}