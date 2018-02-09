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

const impeach= {
    //举报人
    creatorId:{
        [otherRuleFiledName.CHINESE_NAME]: '举报人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10530, msg: '举报人不能为空'}, mongoError: {rc: 20530, msg: '举报人不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10532, msg: '举报人必须是objectId'}, mongoError: {rc: 20532, msg: '举报人必须是objectId'}} //server端使用
    },
    impeachType: {
        [otherRuleFiledName.CHINESE_NAME]: '举报的对象',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10534, msg: '举报的对象不能为空'}, mongoError: {rc: 20534, msg: '举报的对象不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.ImpeachType,error:{rc:10536,msg:'未知举报的对象'},mongoError:{rc:20536,msg:'未知举报的对象'}},//server端使用
    },
    //被举报人，创建时通过article/comment查询获得（冗余字段，skip通过impeachedArticleId或者impeachedCommentId推导的过程）
    impeachedUserId:{
        [otherRuleFiledName.CHINESE_NAME]: '被举报人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10542, msg: '被举报人不能为空'}, mongoError: {rc: 20542, msg: '被举报人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10544, msg: '被举报人必须是objectId'}, mongoError: {rc: 20544, msg: '被举报人必须是objectId'}} //server端使用
    },
    impeachImagesId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报图片',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10546, msg: '举报图片不能为空'}, mongoError: {rc: 20546, msg: '举报图片不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxImageNumber, error: {rc: 10548, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}, mongoError: {rc: 20548, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10550, msg: '举报图片必须是objectId'}, mongoError: {rc: 20550, msg: '举报图片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachAttachmentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报附件',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10552, msg: '举报附件不能为空'}, mongoError: {rc: 20552, msg: '举报附件不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10554, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}, mongoError: {rc: 20554, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10556, msg: '举报附件片必须是objectId'}, mongoError: {rc: 20556, msg: '举报附件片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachCommentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '留言',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10558, msg: '举报留言不能为空'}, mongoError: {rc: 20558, msg: '举报留言不能为空'}},//默认为空对象
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxCommentNumber, error: {rc: 10560, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}, mongoError: {rc: 20560, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10562, msg: '举报留言片必须是objectId'}, mongoError: {rc: 20562, msg: '举报留言片必须是objectId'}} //server端使用
    },
    currentState: {
        [otherRuleFiledName.CHINESE_NAME]: '当前状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10564, msg: '当前状态不能为空'}, mongoError: {rc: 20564, msg: '当前状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.ImpeachState,error:{rc:10566,msg:'未知当前状态'},mongoError:{rc:20566,msg:'未知当前状态'}},//server端使用
    },
    //currentAdminOwnerId只能是admin；如果为空，隐式指明当前owner为creatorId（普通用户）
    currentAdminOwnerId: {
        [otherRuleFiledName.CHINESE_NAME]: '当前处理人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10568, msg: '当前处理人不能为空'}, mongoError: {rc: 20568, msg: '当前处理人不能为空'}},//默认为空对象
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'arrayMaxLength': {define: maxNumber.impeach.maxCommentNumber, error: {rc: 10526}, mongoError: {rc: 20526, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10570, msg: '当前处理人必须是objectId'}, mongoError: {rc: 20570, msg: '当前处理人必须是objectId'}} //server端使用
    },
}

module.exports={
    impeach
}