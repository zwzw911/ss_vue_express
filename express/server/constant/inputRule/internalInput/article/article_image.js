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

const article_image= {
    name: {
        'chineseName': '文档图片名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10260}, mongoError: {rc: 20260, msg: '文档图片名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 4, error: {rc: 10262}, mongoError: {rc: 20262, msg: '文档图片名称至少4个字符'}},
        // 'maxLength': {define: 255, error: {rc: 10264}, mongoError: {rc: 20264, msg: '文档名的长度不能超过255个字符'}},
        'format': {define: regex.imageName, error: {rc: 10266}, mongoError: {rc: 20266, msg: '文档名必须由4-255个字符组成'}} //server端使用
    },
    hashName: {
        'chineseName': '文档图片名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10268}, mongoError: {rc: 20268, msg: '文档图片名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 4, error: {rc: 10002}, mongoError: {rc: 30002, msg: '文档图片名称至少4个字符'}},
        // 'maxLength': {define: 255, error: {rc: 10004}, mongoError: {rc: 30004, msg: '文档名的长度不能超过255个字符'}},
        'format': {define: regex.hashImageName, error: {rc: 10270}, mongoError: {rc: 20270, msg: 'hash文档名必须由44个字符组成'}} //server端使用
    },
    pathId: {
        'chineseName': '存储路径',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10272}, mongoError: {rc: 20272, msg: '存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10274}, mongoError: {rc: 20274, msg: '存储路径必须是objectId'}} //server端使用
    },
    // in byte
    size:{
        'chineseName': '图片大小',
        'type': serverDataType.INT,
        'require': {define: true, error: {rc: 10276}, mongoError: {rc: 20276, msg: '图片大小不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '图片大小至少6个字符'}},
        'max': {define: uploadFileDefine.article_image.maxSizeInByte, error: {rc: 10278}, mongoError: {rc: 20278, msg: `图片大小不能超过${uploadFileDefine.article_image.maxSizeInMB}MB`}},
        // 'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '存储路径必须是objectId'}} //server端使用
    },
    authorId: {
        'chineseName': '图片上传者',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10280}, mongoError: {rc: 20280, msg: '图片上传者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10282}, mongoError: {rc: 20282, msg: '图片上传者必须是objectId'}} //server端使用
    },
    articleId: {
        'chineseName': '文档',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10284}, mongoError: {rc: 20284, msg: '文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10286}, mongoError: {rc: 20286, msg: '文档必须是objectId'}} //server端使用
    },


}

module.exports={
    article_image
}