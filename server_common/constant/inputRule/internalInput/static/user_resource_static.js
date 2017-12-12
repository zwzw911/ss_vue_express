/**
 * Created by wzhan039 on 2017-12-06.
 * 对用户的分类资源 进行统计
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex
const enumValue=require('../../../../constant/genEnum/enumValue')
const resource_profile_static= {
    //
    userId: {
        'chineseName': '用户',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 11210}, mongoError: {rc: 21210, msg: '用户不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 11212}, mongoError: {rc: 21212, msg: '用户必须是objectId'}} //server端使用
    },
    resourceType: {
        'chineseName': '统计资源类别',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 11214}, mongoError: {rc: 21214, msg: '统计资源类别不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'enum':{define:enumValue.ResourceType,error:{rc:10020},mongoError:{rc:20020,msg:'用户权限不正确'}},
    },
    uploadedFileNum: {
        'chineseName': '上传文件数量',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 11218}, mongoError: {rc: 21218, msg: '上传文件数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        // 'format': {define: regex.objectId, error: {rc: 11216}, mongoError: {rc: 21216, msg: '资源设定必须是objectId'}} //server端使用
    },
    uploadedFileSizeInMb: {
        'chineseName': '上传文件占用空间',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 11220}, mongoError: {rc: 21220, msg: '上传文件占用空间不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        // 'format': {define: regex.objectId, error: {rc: 11216}, mongoError: {rc: 21216, msg: '资源设定必须是objectId'}} //server端使用
    },

}

module.exports={
    resource_profile_static
}