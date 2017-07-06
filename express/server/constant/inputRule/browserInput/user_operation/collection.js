/**
 * Created by wzhan039 on 2080-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber
/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')*/

const collection= {
    name: {
        'chineseName': '收藏夹名',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10860}, mongoError: {rc: 20860, msg: '收藏夹名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10862}, mongoError: {rc: 20862, msg: '收藏夹名至少1个字符'}},
        'maxLength': {define: 50, error: {rc: 10864}, mongoError: {rc: 20864, msg: '收藏夹名的字符数不能超过50个字符'}},
        // 'format': {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    articlesId: {
        'chineseName': '收藏文档',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10866}, mongoError: {rc: 20866, msg: '收藏文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10136}, mongoError: {rc: 20136, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.user_operation.maxArticlePerCollection, error: {rc: 10868}, mongoError: {rc: 20868, msg: `最多收藏${maxNumber.user_operation.maxArticlePerCollection}篇文档`}},
        'format': {define: regex.objectId, error: {rc: 10870}, mongoError: {rc: 20870, msg: '文档必须是objectId'}} //server端使用
    },
    topicsId: {
        'chineseName': '收藏系列',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10872}, mongoError: {rc: 20872, msg: '系列不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10136}, mongoError: {rc: 20136, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.user_operation.maxTopicPerCollection, error: {rc: 10874}, mongoError: {rc: 20874, msg: `最多收藏${maxNumber.user_operation.maxTopicPerCollection}个系列`}},
        'format': {define: regex.objectId, error: {rc: 10876}, mongoError: {rc: 20876, msg: '系列必须是objectId'}} //server端使用
    },
}

module.exports={
    collection
}