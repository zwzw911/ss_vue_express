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
/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber
const user_public_group= {
    userId: {
        'chineseName': '用户',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10430}, mongoError: {rc: 20430, msg: '用户不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10432}, mongoError: {rc: 20432, msg: '用户必须是objectId'}} //server端使用
    },


    currentJoinGroup: {
        'chineseName': '用户所处群',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10434}, mongoError: {rc: 20434, msg: '用户所处群不能为空'}},//若尚未加入任何群，字段为空
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '群管理员至少有一个成员'}},
        'arrayMaxLength': {define: maxNumber.friend.maxGroupUserCanJoinIn, error: {rc: 10436}, mongoError: {rc: 20436, msg: `用户最多加入${maxNumber.friend.maxGroupUserCanJoinIn}个群`}},
        'format': {define: regex.objectId, error: {rc: 10438}, mongoError: {rc: 20438, msg: '用户所处群必须是objectId'}} //server端使用
    },

}

module.exports={
    user_public_group,
}