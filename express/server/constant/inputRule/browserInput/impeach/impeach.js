/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../model/mongo/structure/enumValue')

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const impeach= {
    title: {
        'chineseName': '举报名',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10500}, mongoError: {rc: 20500, msg: '举报名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 2, error: {rc: 10502}, mongoError: {rc: 20502, msg: '举报名至少2个字符'}},
        'maxLength': {define: 50, error: {rc: 10504}, mongoError: {rc: 20504, msg: '举报名的长度不能超过50个字符'}},
        // 'format': {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    content: {
        'chineseName': '举报内容',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10506}, mongoError: {rc: 20506, msg: '举报内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 5, error: {rc: 10508}, mongoError: {rc: 20508, msg: '举报内容至少5个字符'}},
        'maxLength': {define: 1999, error: {rc: 10510}, mongoError: {rc: 20510, msg: '举报内容的长度不能超过1999个字符'}},
        // 'format': {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    impeachImagesId: {
        'chineseName': '举报图片',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: true, error: {rc: 10512}, mongoError: {rc: 20512, msg: '举报图片不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxImageNumber, error: {rc: 10514}, mongoError: {rc: 20514, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10516}, mongoError: {rc: 20516, msg: '举报图片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachAttachmentsId: {
        'chineseName': '举报附件',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: true, error: {rc: 10518}, mongoError: {rc: 20518, msg: '举报附件不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10520}, mongoError: {rc: 20520, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        'format': {define: regex.objectId, error: {rc: 10522}, mongoError: {rc: 20522, msg: '举报附件片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    impeachCommentsId: {
        'chineseName': '留言',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: true, error: {rc: 10524}, mongoError: {rc: 20524, msg: '举报留言不能为空'}},//默认为空对象
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'arrayMaxLength': {define: maxNumber.impeach.maxCommentNumber, error: {rc: 10526}, mongoError: {rc: 20526, msg: `最多添加${maxNumber.impeach.maxCommentNumber}个举报`}},
        'format': {define: regex.objectId, error: {rc: 10528}, mongoError: {rc: 20528, msg: '举报留言片必须是objectId'}} //server端使用
    },

    impeachType: {
        'chineseName': '举报的对象',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10530}, mongoError: {rc: 20530, msg: '举报的对象不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'enum':{define:Object.values(mongoEnum.ImpeachType.DB),error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
        'enum':{define:enumValue.ImpeachType,error:{rc:10532},mongoError:{rc:20532,msg:'未知举报的对象'}},//server端使用
    },

    impeachedArticleId:{
        'chineseName': '举报的文档',
        'type': serverDataType.OBJECT_ID,
        'require': {define: false, error: {rc: 10534}, mongoError: {rc: 20534, msg: '举报的文档不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10536}, mongoError: {rc: 20536, msg: '举报的文档必须是objectId'}} //server端使用
    },

    impeachedCommentId:{
        'chineseName': '举报的评论',
        'type': serverDataType.OBJECT_ID,
        'require': {define: false, error: {rc: 10538}, mongoError: {rc: 20538, msg: '举报的评论不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10540}, mongoError: {rc: 20540, msg: '举报的评论必须是objectId'}} //server端使用
    },

    //被举报人（冗余字段，skip通过impeachedArticleId或者impeachedCommentId推导的过程）
    impeachedUserId:{
        'chineseName': '被举报人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10542}, mongoError: {rc: 20542, msg: '被举报人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10544}, mongoError: {rc: 20544, msg: '被举报人必须是objectId'}} //server端使用
    },



/*    //处理人
    dealerId:{
        'chineseName': '处理人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '处理人不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '处理人必须是objectId'}} //server端使用
    },*/

    impeachStatus: {
        'chineseName': '文档状态',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10546}, mongoError: {rc: 20546, msg: '文档状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'enum':{define:Object.values(mongoEnum.ImpeachStatus.DB),error:{rc:10548},mongoError:{rc:20548,msg:'文档状态不正确'}},//server端使用
        'enum':{define:enumValue.ImpeachStatus,error:{rc:10548},mongoError:{rc:20548,msg:'文档状态不正确'}},//server端使用
    },



}

module.exports={
    impeach
}