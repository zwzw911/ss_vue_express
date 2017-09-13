/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*        field有enum才需要require        */
const mongoEnum=require('../../../enum/mongoEnum')

const public_group_interaction= {


    publicGroupId: {
        'chineseName': '群',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10390}, mongoError: {rc: 20390, msg: '群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'format': {define: regex.objectId, error: {rc: 10392}, mongoError: {rc: 20392, msg: '群必须是objectId'}} //server端使用
    },

    content: {
        'chineseName': '群发言内容',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10394}, mongoError: {rc: 20394, msg: '群发言内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 15, error: {rc: 10396}, mongoError: {rc: 20396, msg: '群发言内容至少15个字符'}},
        'maxLength': {define: 1000, error: {rc: 10398}, mongoError: {rc: 20398, msg: '群发言内容的长度不能超过1000个字符'}},
        // 'format': {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },










}

module.exports={
    public_group_interaction,
}