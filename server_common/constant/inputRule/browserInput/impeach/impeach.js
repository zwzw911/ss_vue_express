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
// const mongoEnum=require('../../../enum/mongo')
//const enumValue=require('../../../../model/mongo/structure/enumValue')
const enumValue=require('../../../../constant/genEnum/enumValue')

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

/*              可以在限定条件（unsubmit）更新              */
const impeach= {
    title: {
        [otherRuleFiledName.CHINESE_NAME]: '举报名',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10500, msg: '举报名不能为空'}, mongoError: {rc: 20500, msg: '举报名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: 10502, msg: '举报名至少2个字符'}, mongoError: {rc: 20502, msg: '举报名至少2个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: 10504, msg: '举报名的长度不能超过50个字符'}, mongoError: {rc: 20504, msg: '举报名的长度不能超过50个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    content: {
        [otherRuleFiledName.CHINESE_NAME]: '举报内容',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10506, msg: '举报内容不能为空'}, mongoError: {rc: 20506, msg: '举报内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 5, error: {rc: 10508, msg: '举报内容至少5个字符'}, mongoError: {rc: 20508, msg: '举报内容至少5个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 1999, error: {rc: 10510, msg: '举报内容的长度不能超过1999个字符'}, mongoError: {rc: 20510, msg: '举报内容的长度不能超过1999个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },


    impeachedArticleId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报的文档',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10512, msg: '举报的文档不能为空'}, mongoError: {rc: 20512, msg: '举报的文档不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10514, msg: '举报的文档必须是objectId'}, mongoError: {rc: 20514, msg: '举报的文档必须是objectId'}} //server端使用
    },

    impeachedCommentId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报的评论',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10516, msg: '举报的评论不能为空'}, mongoError: {rc: 20516, msg: '举报的评论不能为空'}},//默认为空对象
            // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
            //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10518, msg: '举报的评论必须是objectId'}, mongoError: {rc: 20518, msg: '举报的评论必须是objectId'}} //server端使用
    }
}




/*    //处理人
    dealerId:{
        [otherRuleFiledName.CHINESE_NAME]: '处理人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '处理人不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '处理人必须是objectId'}} //server端使用
    },*/

/*    impeachStatus: {
        [otherRuleFiledName.CHINESE_NAME]: '文档状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10546}, mongoError: {rc: 20546, msg: '文档状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ENUM]:{define:Object.values(mongoEnum.ImpeachStatus.DB),error:{rc:10548},mongoError:{rc:20548,msg:'文档状态不正确'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.ImpeachStatus,error:{rc:10548},mongoError:{rc:20548,msg:'文档状态不正确'}},//server端使用
    },*/





module.exports={
    impeach
}