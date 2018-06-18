/**
 * Created by wzhan039 on 2017-06-16.
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


/*              upload file define          */
// const uploadFileDefine=require('../../../config/globalConfiguration').uploadFileDefine
/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../constant/genEnum//enumValue')

const baseJSErrorCode=103300
const baseMongoErrorCode=203300

const impeach_comment_image= {
    impeachCommentId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报处理',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+0, msg: '举报处理不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '举报处理不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '举报处理必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '举报处理必须是objectId'}} //server端使用
    },

/*    referenceColl: {
        [otherRuleFiledName.CHINESE_NAME]: '举报对象类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10638, msg: '举报对象类型不能为空'}, mongoError: {rc: 20638, msg: '举报对象类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.ENUM]:{define:enumValue.ImpeachImageReferenceColl,error:{rc:10539,msg:'举报对象的类型未知'},mongoError:{rc:20539,msg:'举报对象的类型未知'}},//server端使用
    },*/

}

module.exports={
    impeach_comment_image
}