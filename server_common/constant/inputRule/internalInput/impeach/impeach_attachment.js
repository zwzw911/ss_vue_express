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
const uploadFileDefine=require('../../../../constant/config/globalConfiguration').uploadFileDefine
const e_uploadFileDefinitionFieldName=require(`../../../../constant/enum/nodeEnum`).UploadFileDefinitionFieldName

const baseJSErrorCode=103650
const baseMongoErrorCode=203650

const impeach_attachment= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '举报附件名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '举报附件名称不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '举报附件名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 4, error: {rc: 10002}, mongoError: {rc: 30002, msg: '举报附件名称至少4个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 255, error: {rc: 10004}, mongoError: {rc: 30004, msg: '举报附件的长度不能超过255个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.fileName, error: {rc: baseJSErrorCode+2, msg: '举报附件必须由4-255个字符组成'}, mongoError: {rc: baseMongoErrorCode+2, msg: '举报附件必须由4-255个字符组成'}} //server端使用
    },
    hashName: {
        [otherRuleFiledName.CHINESE_NAME]: '举报附件名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '举报附件名称不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '举报附件名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 4, error: {rc: 10002}, mongoError: {rc: 30002, msg: '文档图片名称至少4个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 255, error: {rc: 10004}, mongoError: {rc: 30004, msg: '文档名的长度不能超过255个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.md5AttachmentName, error: {rc: baseJSErrorCode+6, msg: '举报附件的hash名必须由27~28个字符组成'}, mongoError: {rc: baseMongoErrorCode+6, msg: '举报附件的hash名必须由27~28个字符组成'}} //server端使用
    },
    authorId: {
        [otherRuleFiledName.CHINESE_NAME]: '附件上传者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+8, msg: '附件上传者不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '附件上传者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+10, msg: '附件上传者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+10, msg: '附件上传者必须是objectId'}} //server端使用
    },
    // in byte
    sizeInMb:{
        [otherRuleFiledName.CHINESE_NAME]: '附件大小',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10662, msg: '附件大小不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '附件大小不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '图片大小至少6个字符'}},
        'max': {define: uploadFileDefine.impeach.attachment[e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB], error: {rc: baseJSErrorCode+14, msg: `附件大小不能超过${uploadFileDefine.impeach.attachment.maxSizeInMB}MB`}, mongoError: {rc: baseMongoErrorCode+14, msg: `附件大小不能超过${uploadFileDefine.impeach.attachment.maxSizeInMB}MB`}},
        // [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '存储路径必须是objectId'}} //server端使用
    },
    pathId: {
        [otherRuleFiledName.CHINESE_NAME]: '存储路径',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+16, msg: '存储路径不能为空'}, mongoError: {rc: baseMongoErrorCode+16, msg: '存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+18, msg: '存储路径必须是objectId'}, mongoError: {rc: baseMongoErrorCode+18, msg: '存储路径必须是objectId'}} //server端使用
    },

/*    impeachId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10634}, mongoError: {rc: 20634, msg: '举报不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10636}, mongoError: {rc: 20636, msg: '举报必须是objectId'}} //server端使用
    },*/
    /*articleId: {
        [otherRuleFiledName.CHINESE_NAME]: '附件文档',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '附件文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '文档必须是objectId'}} //server端使用
    },*/


}

module.exports={
    impeach_attachment
}