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
const enumValue=require('../../../../constant/genEnum/enumValue')

/*        field有enum才需要require        */
const mongoEnum=require('../../../enum/mongoEnum')
/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const baseJSErrorCode=103250
const baseMongoErrorCode=203250

const impeach_comment= {
    //从session中获得
    authorId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论作者', //普通用户
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode, msg: '评论作者不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '评论作者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '评论作者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '评论作者必须是objectId'}} //server端使用
    },
    adminAuthorId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论作者',      //admin用户
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+4, msg: '评论作者不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '评论作者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+6, msg: '评论作者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+6, msg: '评论作者必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachImagesId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论图片',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+8, msg: '评论图片不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '评论图片不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeachAttachment.maxImageNumber, error: {rc: baseJSErrorCode+10, msg: `评论中最多插入${maxNumber.impeachAttachment.maxImageNumber}个图片`}, mongoError: {rc: baseMongoErrorCode+10, msg: `评论中最多插入${maxNumber.impeachAttachment.maxImageNumber}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+12, msg: '评论图片必须是objectId'}, mongoError: {rc: baseMongoErrorCode+12, msg: '评论图片必须是objectId'}} //server端使用
    },

    imagesNum: {
        [otherRuleFiledName.CHINESE_NAME]: '图片总数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+14, msg: '图片总数量不能为空'}, mongoError: {rc: baseMongoErrorCode+14, msg: '图片总数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        // [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:10536,msg:'未知举报的对象'},mongoError:{rc:20536,msg:'未知举报的对象'}},//server端使用
    },
    imagesSizeInMb: {
        [otherRuleFiledName.CHINESE_NAME]: '图片总大小',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+16, msg: '图片总大小不能为空'}, mongoError: {rc: baseMongoErrorCode+16, msg: '图片总大小不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        // [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:10536,msg:'未知举报的对象'},mongoError:{rc:20536,msg:'未知举报的对象'}},//server端使用
    },

    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachAttachmentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论附件',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+18, msg: '评论附件不能为空'}, mongoError: {rc: baseMongoErrorCode+18, msg: '评论附件不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeachAttachment.maxAttachmentNumber, error: {rc: baseJSErrorCode+20, msg: `评论中最多添加${maxNumber.impeachAttachment.maxAttachmentNumber}个附件`}, mongoError: {rc: baseMongoErrorCode+20, msg: `评论中最多添加${maxNumber.impeachAttachment.maxAttachmentNumber}个附件`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+22, msg: '评论附件必须是objectId'}, mongoError: {rc: baseMongoErrorCode+22, msg: '评论附件必须是objectId'}} //server端使用
    },

    //impeachComment只能有一次create和update的机会（create后台默认创建一个模板，update相当于创建并提交此评论）
    documentStatus:{
        [otherRuleFiledName.CHINESE_NAME]: '记录状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:true}, error: {rc: baseJSErrorCode+24, msg: '记录状态不能为空'}, mongoError: {rc: baseMongoErrorCode+24, msg: '记录状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        // 'arrayMaxLength': {define: maxNumber.impeachAttachment.maxAttachmentNumber, error: {rc: 10582}, mongoError: {rc: 20582, msg: `评论中最多添加${maxNumber.impeachAttachment.maxAttachmentNumber}个附件`}},
        [ruleFiledName.ENUM]:{define:enumValue.DocumentStatus,error:{rc:baseJSErrorCode+26,msg:'document状态不是预定义的值'},mongoError:{rc:baseMongoErrorCode+26,msg:'document状态不是预定义的值'}} //加密密码采用sha256，减少CPU负荷
    },


}

module.exports={
    impeach_comment,
}