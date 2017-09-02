/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*        field有enum才需要require        */
const mongoEnum=require('../../../enum/mongo')

const enumValue=require('../../../../model/mongo/structure/enumValue')

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const impeach= {
    //举报人
    creatorId:{
        'chineseName': '举报人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10550}, mongoError: {rc: 20550, msg: '举报人不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10552}, mongoError: {rc: 20552, msg: '举报人必须是objectId'}} //server端使用
    },
    impeachType: {
        'chineseName': '举报的对象',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10530}, mongoError: {rc: 20530, msg: '举报的对象不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'enum':{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        'enum':{define:enumValue.ImpeachType,error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
    },
    //被举报人，创建时通过article/comment查询获得（冗余字段，skip通过impeachedArticleId或者impeachedCommentId推导的过程）
    impeachedUserId:{
        'chineseName': '被举报人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10542}, mongoError: {rc: 20542, msg: '被举报人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10544}, mongoError: {rc: 20544, msg: '被举报人必须是objectId'}} //server端使用
    },
    impeachImagesId: {
        'chineseName': '举报图片',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10512}, mongoError: {rc: 20512, msg: '举报图片不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxImageNumber, error: {rc: 10514}, mongoError: {rc: 20514, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10516}, mongoError: {rc: 20516, msg: '举报图片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachAttachmentsId: {
        'chineseName': '举报附件',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10518}, mongoError: {rc: 20518, msg: '举报附件不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10520}, mongoError: {rc: 20520, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        'format': {define: regex.objectId, error: {rc: 10522}, mongoError: {rc: 20522, msg: '举报附件片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachCommentsId: {
        'chineseName': '留言',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10524}, mongoError: {rc: 20524, msg: '举报留言不能为空'}},//默认为空对象
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxCommentNumber, error: {rc: 10526}, mongoError: {rc: 20526, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}},
        'format': {define: regex.objectId, error: {rc: 10528}, mongoError: {rc: 20528, msg: '举报留言片必须是objectId'}} //server端使用
    },
}

module.exports={
    impeach
}