/**
 * Created by ada on 2017-12-24.
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
const enumValue=require('../../../../constant/genEnum/enumValue')
/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').maxNumber

const add_friend= {
    receiver: {
        [otherRuleFiledName.CHINESE_NAME]: '添加的好友',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10440, msg: '添加好友不能为空'}, mongoError: {rc: 20440, msg: '添加好友不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 1, error: {rc: 10412}, mongoError: {rc: 20412, msg: '朋友分组名至少1个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10414}, mongoError: {rc: 20414, msg: '朋友分组名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10442, msg: '好友必须是objectId'}, mongoError: {rc: 20442, msg: '好友必须是objectId'}} //server端使用
    },


    status:{
        [otherRuleFiledName.CHINESE_NAME]: '当前请求所处状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:true}, error: {rc: 10444, msg: '状态不能为空'}, mongoError: {rc: 20444, msg: '状态不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'arrayMaxLength': {define: maxNumber.friend.maxFriendsNumberPerGroup, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含${maxNumber.friend.maxFriendsNumberPerGroup}个好友`}},
        [ruleFiledName.ENUM]: {define: enumValue.AddFriendStatus, error: {rc: 10446, msg: '状态未定义'}, mongoError: {rc: 20446, msg: '状态未定义'}} //server端使用
    },


}

module.exports={
    add_friend,
}