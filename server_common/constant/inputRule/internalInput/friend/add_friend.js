/**
 * Created by ada on 2017-12-24.
 *  用户对应的inputRule（后台自动产生的数据）
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
/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').maxNumber

const add_friend= {
    originator: {
        [otherRuleFiledName.CHINESE_NAME]: '发起人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10448}, mongoError: {rc: 20448, msg: '发起人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10412}, mongoError: {rc: 20412, msg: '朋友分组名至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10414}, mongoError: {rc: 20414, msg: '朋友分组名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10450}, mongoError: {rc: 20450, msg: '发起人必须是objectId'}} //server端使用
    },



}

module.exports={
    add_friend,
}