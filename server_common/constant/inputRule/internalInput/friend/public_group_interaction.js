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

const public_group_interaction= {
    creatorId: {
        'chineseName': '发言者',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10400}, mongoError: {rc: 20400, msg: '发言者不能为空'}},//只有发言被删除的时候，才会
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10402}, mongoError: {rc: 20402, msg: '发言者必须是objectId'}} //server端使用
    },

    deleteById: {
        'chineseName': '删除者',
        'type': serverDataType.OBJECT_ID,
        'require': {define: false, error: {rc: 10404}, mongoError: {rc: 20404, msg: '删除者不能为空'}},//只有在删除发言，才会加上发言删除者
        'format': {define: regex.objectId, error: {rc: 10406}, mongoError: {rc: 20406, msg: '删除者必须是objectId'}} //server端使用
    },




}

module.exports={
    public_group_interaction,
}