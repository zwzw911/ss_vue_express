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

const topic= {
    name: {
        'chineseName': '系列名',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10830}, mongoError: {rc: 20830, msg: '系列名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10832}, mongoError: {rc: 20832, msg: '系列名至少1个字符'}},
        'maxLength': {define: 50, error: {rc: 10834}, mongoError: {rc: 20834, msg: '系列名的字符数不能超过50个字符'}},
        // 'format': {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    desc: {
        'chineseName': '系列描述',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10836}, mongoError: {rc: 20836, msg: '系列描述不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10838}, mongoError: {rc: 20838, msg: '系列描述至少1个字符'}},
        'maxLength': {define: 140, error: {rc: 10840}, mongoError: {rc: 20840, msg: '系列描述包含的字符数不能超过50个字符'}},
        // 'format': {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },

    articlesId: {
        'chineseName': '系列文档',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10842}, mongoError: {rc: 20842, msg: '系列文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10136}, mongoError: {rc: 20136, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.user_operation.maxArticlePerTopic, error: {rc: 10844}, mongoError: {rc: 20844, msg: `最多设置${maxNumber.user_operation.maxArticlePerTopic}篇文档`}},
        'format': {define: regex.objectId, error: {rc: 10846}, mongoError: {rc: 20846, msg: '文档必须是objectId'}} //server端使用
    },

}

module.exports={
    topic
}