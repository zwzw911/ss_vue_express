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


/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')*/
/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').userGroupFriend.max

const user_friend_group= {
    friendGroupName: {
        [otherRuleFiledName.CHINESE_NAME]: '朋友分组名',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10410}, mongoError: {rc: 20410, msg: '朋友分组名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10412}, mongoError: {rc: 20412, msg: '朋友分组名至少1个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10414}, mongoError: {rc: 20414, msg: '朋友分组名的长度不能超过20个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },


    friendsInGroup:{
        [otherRuleFiledName.CHINESE_NAME]: '好友分组',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_ARRAY],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_ARRAY]:false}, error: {rc: 10420}, mongoError: {rc: 20420, msg: '好友分组不能为空'}},//必须存在，可以为空数组
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.maxUserPerGroup, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含${maxNumber.maxUserPerGroup}个好友`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10424}, mongoError: {rc: 20424, msg: '好友必须是objectId'}} //server端使用
    },


}

module.exports={
    user_friend_group
}