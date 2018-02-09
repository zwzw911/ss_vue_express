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

const user= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '用户名',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //只能在create和update的recordInfo中出现
        [otherRuleFiledName.PLACE_HOLDER]:['用户名，由2-20个字符组成'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10700, msg: '用户名不能为空'}, mongoError: {rc: 20700, msg: '用户名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        'minLength': {define: 2, error: {rc: 10702}, mongoError: {rc: 20702, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10704}, mongoError: {rc: 20704, msg: '用户名的长度不能超过20个字符'}},*/
        [ruleFiledName.FORMAT]: {define: regex.userName, error: {rc: 10706, msg: '用户名必须由2-20个字符组成'}, mongoError: {rc: 20706, msg: '用户名必须由2-20个字符组成'}} //server端使用
    },
    account: {
        [otherRuleFiledName.CHINESE_NAME]: '账号',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //可以修改（例如用户手机号换了）
        [otherRuleFiledName.PLACE_HOLDER]:['请输入您的手机号','请输入您的电子邮件地址'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10708, msg: '账号不能为空'}, mongoError: {rc: 20708, msg: '账号不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        'minLength': {define: 2, error: {rc: 10710}, mongoError: {rc: 20710, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10712}, mongoError: {rc: 20712, msg: '用户名的长度不能超过20个字符'}},*/
        [ruleFiledName.FORMAT]: {define: regex.account, error: {rc: 10714, msg: '账号必须是手机号或者email'}, mongoError: {rc: 20714, msg: '账号必须是手机号或者email'}} //server端使用
    },

    //此处是处理用户输入password
    password: {
        [otherRuleFiledName.CHINESE_NAME]: '密码',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //只能在create和update的recordInfo中出现
        [otherRuleFiledName.PLACE_HOLDER]:['密码，由6-20个字母、数字、特殊字符组成'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10716, msg: '密码不能为空'}, mongoError: {rc: 20716, msg: '密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        'minLength': {define: 6, error: {rc: 10718}, mongoError: {rc: 20718, msg: '密码至少6个字符'}},
        'maxLength': {define: 20, error: {rc: 10720}, mongoError: {rc: 20720, msg: '密码的长度不能超过20个字符'}},*/
        [ruleFiledName.FORMAT]: {define: regex.password, error: {rc: 10718, msg: '密码必须由6-20个字符组成'}, mongoError: {rc: 20718, msg: '密码必须由6-20个字符组成'}} //server端使用
    },



}

module.exports={
    user
}