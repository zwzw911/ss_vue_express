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

const public_group= {
    creatorId: {
        'chineseName': '群创建者',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10356}, mongoError: {rc: 20356, msg: '群创建者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '朋友分组名至少1个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 30004, msg: '朋友分组名的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10358}, mongoError: {rc: 20358, msg: '群创建者必须是objectId'}} //server端使用
    },


}

module.exports={
    public_group
}