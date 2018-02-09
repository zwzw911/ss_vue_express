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

/*              只能create，不能update*/
const user_resource_profile= {
    userId: {
        [otherRuleFiledName.CHINESE_NAME]: '用户',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10760, msg: '用户不能为空'}, mongoError: {rc: 20760, msg: '用户不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        'minLength': {define: 2, error: {rc: 10702}, mongoError: {rc: 20702, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10704}, mongoError: {rc: 20704, msg: '用户名的长度不能超过20个字符'}},*/
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10762, msg: '用户格式不正确'}, mongoError: {rc: 20762, msg: '用户格式不正确'}} //server端使用
    },
    resource_profile_id: {
        [otherRuleFiledName.CHINESE_NAME]: '资源配置',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10764, msg: '资源配置不能为空'}, mongoError: {rc: 20764, msg: '资源配置不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        'minLength': {define: 2, error: {rc: 10710}, mongoError: {rc: 20710, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10712}, mongoError: {rc: 20712, msg: '用户名的长度不能超过20个字符'}},*/
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10766, msg: '资源配置格式不正确'}, mongoError: {rc: 20766, msg: '资源配置格式不正确'}} //server端使用
    },



    duration:{
        [otherRuleFiledName.CHINESE_NAME]: '资源配置有效期',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10768, msg: '资源配置有效期不能为空'}, mongoError: {rc: 20768, msg: '资源配置有效期不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN]: {define: 0, error: {rc: 10770, msg: '源配置有效期最短1天'}, mongoError: {rc: 20770, msg: '源配置有效期最短1天'}},
        [ruleFiledName.MAX]: {define: 365, error: {rc: 10772, msg: '源配置有效期最长1年'}, mongoError: {rc: 20772, msg: '源配置有效期最长1年'}},
},


}

module.exports={
    user_resource_profile,
}