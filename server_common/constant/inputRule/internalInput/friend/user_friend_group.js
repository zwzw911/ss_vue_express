/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongoEnum')
/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').maxNumber
const user_friend_group= {
    ownerUserId: {
        'chineseName': '用户',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10416}, mongoError: {rc: 20416, msg: '文档目录不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10418}, mongoError: {rc: 20418, msg: '文档目录必须是objectId'}} //server端使用
    },

}

module.exports={
    user_friend_group,
}