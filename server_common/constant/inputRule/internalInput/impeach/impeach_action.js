/**
 * Created by ada on 2017-06-09.
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

// console.log(`internal serverDataType =========>${JSON.stringify(serverDataType)}`)
/*        field有enum才需要require        */
//const enumValue=require('../../../../model/mongo/structure/enumValue')
const collNameForFK=require('../../../../constant/enum/collEnum').collNameForFK
//console.log(`internal inputrule =========>${JSON.stringify(collNameForFK)}`)
/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').maxNumber

const baseJSErrorCode=103450
const baseMongoErrorCode=203450

const impeach_action= {
/*    impeachId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10590}, mongoError: {rc: 20590, msg: '举报不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxImageNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10592}, mongoError: {rc: 20592, msg: '举报必须是objectId'}} //server端使用
    },*/
    //处理人
    creatorId: {
        [otherRuleFiledName.CHINESE_NAME]: '状态改变人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '状态改变人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '状态改变人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '状态改变人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '状态改变人必须是objectId'}} //server端使用
    },
    //处理人所在coll（通过enum限定可取的coll name）
    creatorColl: {
        [otherRuleFiledName.CHINESE_NAME]: '状态改变人表',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '状态改变人表不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '状态改变人表不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        // [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10596}, mongoError: {rc: 20596, msg: '状态改变人表必须是objectId'}} //server端使用
        [ruleFiledName.ENUM]:{define:collNameForFK.impeach_state.dealerColl,error:{rc:baseJSErrorCode+6,msg:'受罚子类型不正确'},mongoError:{rc:baseMongoErrorCode+6,msg:'受罚子类型不正确'}},//server端使用
    },
/*    state:{
        [otherRuleFiledName.CHINESE_NAME]: '状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10598}, mongoError: {rc: 20598, msg: '处理人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        [ruleFiledName.FORMAT]: {define: enumValue.ImpeachType, error: {rc: 10600}, mongoError: {rc: 20600, msg: '处理人必须是objectId'}} //server端使用
    },*/






}

module.exports={
    impeach_action,
}