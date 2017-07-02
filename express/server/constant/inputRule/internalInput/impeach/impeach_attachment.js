/**
 * Created by wzhan039 on 2017-06-16.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*              upload file define          */
const uploadFileDefine=require('../../../../constant/config/globalConfiguration').uploadFileDefine

const impeach_attachment= {
    name: {
        'chineseName': '举报附件名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 30000, msg: '举报附件名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 4, error: {rc: 10002}, mongoError: {rc: 30002, msg: '举报附件名称至少4个字符'}},
        // 'maxLength': {define: 255, error: {rc: 10004}, mongoError: {rc: 30004, msg: '举报附件的长度不能超过255个字符'}},
        'format': {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '举报附件必须由4-255个字符组成'}} //server端使用
    },
    hashName: {
        'chineseName': '举报附件名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 30000, msg: '举报附件名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 4, error: {rc: 10002}, mongoError: {rc: 30002, msg: '文档图片名称至少4个字符'}},
        // 'maxLength': {define: 255, error: {rc: 10004}, mongoError: {rc: 30004, msg: '文档名的长度不能超过255个字符'}},
        'format': {define: regex.hashAttachmentName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '举报附件的hash名必须由43~44个字符组成'}} //server端使用
    },
    authorId: {
        'chineseName': '附件上传者',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '附件上传者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '附件上传者必须是objectId'}} //server端使用
    },
    // in byte
    size:{
        'chineseName': '附件大小',
        'type': serverDataType.INT,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '附件大小不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '图片大小至少6个字符'}},
        'max': {define: uploadFileDefine.impeach_attachment.maxSizeInByte, error: {rc: 10004}, mongoError: {rc: 20004, msg: `附件大小不能超过${uploadFileDefine.impeach_attachment.maxSizeInMB}MB`}},
        // 'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '存储路径必须是objectId'}} //server端使用
    },
    pathId: {
        'chineseName': '存储路径',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '存储路径必须是objectId'}} //server端使用
    },


    /*articleId: {
        'chineseName': '附件文档',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '附件文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '文档必须是objectId'}} //server端使用
    },*/


}

module.exports={
    impeach_attachment
}