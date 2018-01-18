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

const impeach_comment= {
    //从session中获得
    authorId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论作者', //普通用户
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10570}, mongoError: {rc: 20570, msg: '评论作者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10571}, mongoError: {rc: 20571, msg: '评论作者必须是objectId'}} //server端使用
    },
    adminAuthorId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论作者',      //admin用户
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10572}, mongoError: {rc: 20572, msg: '评论作者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10573}, mongoError: {rc: 20573, msg: '评论作者必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachImagesId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论图片',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10574}, mongoError: {rc: 20574, msg: '评论图片不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeachAttachment.maxImageNumber, error: {rc: 10576}, mongoError: {rc: 20576, msg: `评论中最多插入${maxNumber.impeachAttachment.maxImageNumber}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10578}, mongoError: {rc: 20578, msg: '评论图片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachAttachmentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '评论附件',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10580}, mongoError: {rc: 20580, msg: '评论附件不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeachAttachment.maxAttachmentNumber, error: {rc: 10582}, mongoError: {rc: 20582, msg: `评论中最多添加${maxNumber.impeachAttachment.maxAttachmentNumber}个附件`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10584}, mongoError: {rc: 20584, msg: '评论附件必须是objectId'}} //server端使用
    },

    documentStatus:{
        [otherRuleFiledName.CHINESE_NAME]: '记录状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10586}, mongoError: {rc: 20586, msg: '记录状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        // 'arrayMaxLength': {define: maxNumber.impeachAttachment.maxAttachmentNumber, error: {rc: 10582}, mongoError: {rc: 20582, msg: `评论中最多添加${maxNumber.impeachAttachment.maxAttachmentNumber}个附件`}},
        [ruleFiledName.ENUM]:{define:enumValue.DocumentStatus,error:{rc:10588},mongoError:{rc:20588,msg:'document状态不是预定义的值'}} //加密密码采用sha256，减少CPU负荷
    },
}

module.exports={
    impeach_comment,
}