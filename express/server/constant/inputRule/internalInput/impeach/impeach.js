/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')
/!*              获得 某些设置值            *!/
const maxNumber=require('../../../config/globalConfiguration').maxNumber*/

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
    //被举报人，创建时通过article/comment查询获得（冗余字段，skip通过impeachedArticleId或者impeachedCommentId推导的过程）
    impeachedUserId:{
        'chineseName': '被举报人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10542}, mongoError: {rc: 20542, msg: '被举报人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10544}, mongoError: {rc: 20544, msg: '被举报人必须是objectId'}} //server端使用
    },
}

module.exports={
    impeach
}