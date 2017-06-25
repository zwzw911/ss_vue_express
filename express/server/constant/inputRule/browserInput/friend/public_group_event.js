/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*        field有enum才需要require        */
const mongoEnum=require('../../../enum/mongoStore')

const public_group_event= {
    publicGroupId: {
        'chineseName': '群',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 30000, msg: '群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '群必须是objectId'}} //server端使用
    },

    eventType: {
        'chineseName': '群事件类型',
        'type': serverDataType.ENUM,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '群事件类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:Object.values(mongoEnum.PublicGroupEventType.DB),error:{rc:10028},mongoError:{rc:20028,msg:'未知群事件类型'}},//server端使用
    },


    targetId: {
        'chineseName': '事件接收者',
        'type': serverDataType.OBJECT_ID,
        'require': {define: false, error: {rc: 10000}, mongoError: {rc: 20000, msg: '事件接收者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '事件接收者必须是objectId'}} //server端使用
    },

    status: {
        'chineseName': '事件状态',
        'type': serverDataType.ENUM,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '事件状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:Object.values(mongoEnum.EventStatus.DB),error:{rc:10028},mongoError:{rc:20028,msg:'未知事件状态'}},//server端使用
    },





}

module.exports={
    public_group_event,
}