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

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber
/*        field有enum才需要require        */
const mongoEnum=require('../../../enum/mongoEnum')

const baseJSErrorCode=102350
const baseMongoErrorCode=202350

const public_group= {
    creatorId: {
        [otherRuleFiledName.CHINESE_NAME]: '群创建者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '群创建者不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '群创建者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '朋友分组名至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 30004, msg: '朋友分组名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '群创建者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '群创建者必须是objectId'}} //server端使用
    },
/**     通过join_public_group_rquest间接管理  **/
    membersId: {
        [otherRuleFiledName.CHINESE_NAME]: '群成员',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_ARRAY],

        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_ARRAY]:false}, error: {rc: baseJSErrorCode+6, msg: '群成员不能为空'}, mongoError: {rc: baseMongoErrorCode+6, msg: '群成员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ARRAY_MIN_LENGTH]: {define: 1, error: {rc: baseJSErrorCode+8, msg: '群至少有一个成员'}, mongoError: {rc: baseMongoErrorCode+8, msg: '群至少有一个成员'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.friend.maxMemberNumberPerPublicGroup, error: {rc: baseJSErrorCode+10, msg: `群最多有${maxNumber.friend.maxMemberNumberPerPublicGroup}个成员`}, mongoError: {rc: baseMongoErrorCode+10, msg: `群最多有${maxNumber.friend.maxMemberNumberPerPublicGroup}个成员`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+12, msg: '群成员必须是objectId'}, mongoError: {rc: baseMongoErrorCode+12, msg: '群成员必须是objectId'}} //server端使用
    },
/**     通过其他url进行处理，而不是通过update处理       **/
    adminsId: {
        [otherRuleFiledName.CHINESE_NAME]: '群管理员',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_ARRAY],

        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_ARRAY]:false}, error: {rc: baseJSErrorCode+14, msg: '群管理员不能为空'}, mongoError: {rc: baseMongoErrorCode+14, msg: '群管理员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ARRAY_MIN_LENGTH]: {define: 1, error: {rc: baseJSErrorCode+16, msg: '群管理员至少有一个成员'}, mongoError: {rc: baseMongoErrorCode+16, msg: '群管理员至少有一个成员'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.friend.maxAdministratorPerPublicGroup, error: {rc: baseJSErrorCode+18, msg: `群最多有${maxNumber.friend.maxAdministratorPerPublicGroup}个群管理员`}, mongoError: {rc: baseMongoErrorCode+18, msg: `群最多有${maxNumber.friend.maxAdministratorPerPublicGroup}个群管理员`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+20, msg: '群管理员必须是objectId'}, mongoError: {rc: baseMongoErrorCode+20, msg: '群管理员必须是objectId'}} //server端使用
    },
}

module.exports={
    public_group
}