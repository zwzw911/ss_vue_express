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
const enumValue=require('../../../../constant/genEnum/enumValue')

const collNameForFK=require('../../../../constant/enum/collEnum').collNameForFK
// console.log(`browser inputrule =========>${JSON.stringify(collNameForFK.impeach_state.ownerColl)}`)
/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').maxNumber

const impeach_action= {
    impeachId: {
        'chineseName': '举报',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10590}, mongoError: {rc: 20590, msg: '举报不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxImageNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多插入${maxNumber.impeach.maxImageNumber}个图片`}},
        'format': {define: regex.objectId, error: {rc: 10592}, mongoError: {rc: 20592, msg: '举报必须是objectId'}} //server端使用
    },
    //admin处理人（考虑到分配问题，所以需要放在browser中）.
    //如果没有设置，说明ownerId为creatorId
    adminOwnerId: {
        'chineseName': '处理人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: false, error: {rc: 10594}, mongoError: {rc: 20594, msg: '处理人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        'format': {define: regex.objectId, error: {rc: 10596}, mongoError: {rc: 20596, msg: '处理人必须是objectId'}} //server端使用
    },
    //处理人所在coll（通过enum限定可取的coll name）
/*    ownerColl: {
        'chineseName': '处理人表',
        'type': serverDataType.STRING,
        'require': {define: false, error: {rc: 10598}, mongoError: {rc: 20598, msg: '分配人不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        'enum':{define:collNameForFK.impeach_state.ownerColl,error:{rc:10092},mongoError:{rc:20092,msg:'受罚子类型不正确'}},//server端使用
        // 'enum': {define: regex.objectId, error: {rc: 10600}, mongoError: {rc: 20600, msg: '分配人必须是objectId'}} //server端使用
    },*/
    action:{
        'chineseName': '操作',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10598}, mongoError: {rc: 20598, msg: '操作不能为空'}},//默认为空对象
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        //'arrayMaxLength': {define: maxNumber.impeach.maxAttachmentNumber, error: {rc: 10004}, mongoError: {rc: 20004, msg: `最多添加${maxNumber.impeach.maxAttachmentNumber}个附件`}},
        // 'format': {define: enumValue.objectId, error: {rc: 10600}, mongoError: {rc: 20600, msg: '处理人必须是objectId'}} //server端使用
        'enum':{define:enumValue.ImpeachAllAction,error:{rc:10092},mongoError:{rc:20092,msg:'未知操作'}},//server端使用
    },






}

module.exports={
    impeach_action,
}