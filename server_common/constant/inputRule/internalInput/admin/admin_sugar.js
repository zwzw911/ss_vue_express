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

const admin_sugar= {
    userId:{
        [otherRuleFiledName.CHINESE_NAME]: '用户',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        //require=false：client无需此字段，server通过函数（必须有salt来sha密码）保证由此字段
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10030, msg: '用户不能为空'}, mongoError: {rc: 20030, msg: '用户不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '糖至少1个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 10, error: {rc: 10004}, mongoError: {rc: 20004, msg: '糖的长度不能超过10个字符'}},*/
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10032, msg: '用户id由24个字符组成'}, mongoError: {rc: 20032, msg: '用户id由24个字符组成'}} //server端使用
    },
    sugar: {
        [otherRuleFiledName.CHINESE_NAME]: '糖',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        //require=false：client无需此字段，server通过函数（必须有salt来sha密码）保证由此字段
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10034, msg: '糖不能为空'}, mongoError: {rc: 20034, msg: '糖不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10036}, mongoError: {rc: 20036, msg: '糖至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 10, error: {rc: 10038}, mongoError: {rc: 20038, msg: '糖的长度不能超过10个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.salt, error: {rc: 10040, msg: '糖必须由1-10个字符组成'}, mongoError: {rc: 20040, msg: '糖必须由1-10个字符组成'}} //server端使用
    },

}

module.exports={
    admin_sugar,
}