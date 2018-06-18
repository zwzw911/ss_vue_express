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
// const mongoEnum=require('../../../enum/mongoEnum')

const enumValue=require('../../../../constant/genEnum/enumValue')

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const baseJSErrorCode=103150
const baseMongoErrorCode=203150

const impeach= {
    //举报人
    creatorId:{
        [otherRuleFiledName.CHINESE_NAME]: '举报人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '举报人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '举报人不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '举报人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '举报人必须是objectId'}} //server端使用
    },
    impeachType: {
        [otherRuleFiledName.CHINESE_NAME]: '举报的对象',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '举报的对象不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '举报的对象不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:baseJSErrorCode+6,msg:'未知举报的对象'},mongoError:{rc:baseMongoErrorCode+6,msg:'未知举报的对象'}},//server端使用
    },
    //被举报人，创建时通过article/comment查询获得（冗余字段，skip通过impeachedArticleId或者impeachedCommentId推导的过程）
    impeachedUserId:{
        [otherRuleFiledName.CHINESE_NAME]: '被举报人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+8, msg: '被举报人不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '被举报人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+10, msg: '被举报人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+10, msg: '被举报人必须是objectId'}} //server端使用
    },
    impeachImagesId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报图片',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+12, msg: '举报图片不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '举报图片不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxImageNumber, error: {rc: baseJSErrorCode+14, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}, mongoError: {rc: baseMongoErrorCode+14, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+16, msg: '举报图片必须是objectId'}, mongoError: {rc: baseMongoErrorCode+16, msg: '举报图片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachAttachmentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报附件',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+18, msg: '举报附件不能为空'}, mongoError: {rc: baseMongoErrorCode+18, msg: '举报附件不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: baseJSErrorCode+20, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}, mongoError: {rc: baseMongoErrorCode+20, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+22, msg: '举报附件片必须是objectId'}, mongoError: {rc: baseMongoErrorCode+22, msg: '举报附件片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachCommentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '留言',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+24, msg: '举报留言不能为空'}, mongoError: {rc: baseMongoErrorCode+24, msg: '举报留言不能为空'}},//默认为空对象
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxCommentNumber, error: {rc: baseJSErrorCode+26, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}, mongoError: {rc: baseMongoErrorCode+26, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+28, msg: '举报留言片必须是objectId'}, mongoError: {rc: baseMongoErrorCode+28, msg: '举报留言片必须是objectId'}} //server端使用
    },
    currentState: {
        [otherRuleFiledName.CHINESE_NAME]: '当前处理状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+30, msg: '当前状态不能为空'}, mongoError: {rc: baseMongoErrorCode+30, msg: '当前状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.ImpeachState,error:{rc:baseJSErrorCode+32,msg:'未知当前状态'},mongoError:{rc:baseMongoErrorCode+32,msg:'未知当前状态'}},//server端使用
    },
    //currentAdminOwnerId只能是admin；如果为空，隐式指明当前owner为creatorId（普通用户）
    currentAdminOwnerId: {
        [otherRuleFiledName.CHINESE_NAME]: '当前处理人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+34, msg: '当前处理人不能为空'}, mongoError: {rc: baseMongoErrorCode+34, msg: '当前处理人不能为空'}},//默认为空对象
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'arrayMaxLength': {define: maxNumber.impeach.maxCommentNumber, error: {rc: 10526}, mongoError: {rc: 20526, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+36, msg: '当前处理人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+36, msg: '当前处理人必须是objectId'}} //server端使用
    },
    //记录图片的数量和大小
    imagesNum: {
        [otherRuleFiledName.CHINESE_NAME]: '图片总数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+38, msg: '图片总数量不能为空'}, mongoError: {rc: baseMongoErrorCode+38, msg: '图片总数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        // [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:10536,msg:'未知举报的对象'},mongoError:{rc:20536,msg:'未知举报的对象'}},//server端使用
    },
    imagesSizeInMb: {
        [otherRuleFiledName.CHINESE_NAME]: '图片总大小',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+40, msg: '图片总大小不能为空'}, mongoError: {rc: baseMongoErrorCode+40, msg: '图片总大小不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        // [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:10536,msg:'未知举报的对象'},mongoError:{rc:20536,msg:'未知举报的对象'}},//server端使用
    },
    //记录附件的数量和大小
    attachmentsNum: {
        [otherRuleFiledName.CHINESE_NAME]: '附件总数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+42, msg: '附件总数量不能为空'}, mongoError: {rc: baseMongoErrorCode+42, msg: '附件总数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        // [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:10536,msg:'未知举报的对象'},mongoError:{rc:20536,msg:'未知举报的对象'}},//server端使用
    },
    attachmentsSizeInMb: {
        [otherRuleFiledName.CHINESE_NAME]: '附件总大小',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+44, msg: '附件总大小不能为空'}, mongoError: {rc: baseMongoErrorCode+44, msg: '附件总大小不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        // [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:10536,msg:'未知举报的对象'},mongoError:{rc:20536,msg:'未知举报的对象'}},//server端使用
    },
}

module.exports={
    impeach
}