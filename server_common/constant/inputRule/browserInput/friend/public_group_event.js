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

const baseJSErrorCode=102400
const baseMongoErrorCode=202400

/*                  事件只能创建，不能修改                     */
const public_group_event= {
    publicGroupId: {
        [otherRuleFiledName.CHINESE_NAME]: '群',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '群不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '群必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '群必须是objectId'}} //server端使用
    },

    eventType: {
        [otherRuleFiledName.CHINESE_NAME]: '群事件类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '群事件类型不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '群事件类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.PublicGroupEventType.DB),error:{rc:10366},mongoError:{rc:20366,msg:'未知群事件类型'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.PublicGroupEventType,error:{rc:baseJSErrorCode+6,msg:'未知群事件类型'},mongoError:{rc:baseMongoErrorCode+6,msg:'未知群事件类型'}},//server端使用
    },


    targetId: {
        [otherRuleFiledName.CHINESE_NAME]: '事件接收者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+8, msg: '事件接收者不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '事件接收者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+10, msg: '事件接收者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+10, msg: '事件接收者必须是objectId'}} //server端使用
    },

    status: {
        [otherRuleFiledName.CHINESE_NAME]: '事件状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+12, msg: '事件状态不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '事件状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.EventStatus.DB),error:{rc:10374},mongoError:{rc:20374,msg:'未知事件状态'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.PublicGroupEventType,error:{rc:baseJSErrorCode+14,msg:'未知事件状态'},mongoError:{rc:baseMongoErrorCode+14,msg:'未知事件状态'}},//server端使用
    },





}

module.exports={
    public_group_event,
}