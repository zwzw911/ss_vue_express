/**
 * Created by wzhan039 on 2017-06-09.
 *  server自动生成的数据，例如cDate等，可能也需要验证，防止程序错误
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

const user= {

    //转换过的password，最终要存入db
    password: {
        'chineseName': '密码',
        'type':serverDataType.STRING,
        'require': {define: true, error: {rc: 10724},mongoError:{rc:20724,msg:'密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            'minLength':{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         'maxLength':{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        'format':{define:regex.sha256,error:{rc:10726},mongoError:{rc:20726,msg:'密码必须由64个字符组成'}} //加密密码采用sha256，减少CPU负荷
    },

/*    photoPathId: {
        'chineseName': '头像存储路径',
        'type': serverDataType.OBJECT_ID,
        'require': {define: false, error: {rc: 10728}, mongoError: {rc: 20728, msg: '头像存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10718}, mongoError: {rc: 20718, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10720}, mongoError: {rc: 20720, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10730}, mongoError: {rc: 20730, msg: '头像存储路径格式不正确'}} //server端使用
    },

    photoHashName: {
        'chineseName': '头像hash名',
        'type': serverDataType.STRING,
        'require': {define: false, error: {rc: 10732}, mongoError: {rc: 20732, msg: '头像hash名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10718}, mongoError: {rc: 20718, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10720}, mongoError: {rc: 20720, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.hashedThumbnail, error: {rc: 10734}, mongoError: {rc: 20734, msg: '头像hash名由27~28个字符组成'}} //server端使用. md5
    },*/

    photoDataUrl:{
        'chineseName': '用户头像',
        'type':serverDataType.STRING,
        'require': {define: false, error: {rc: 10728},mongoError:{rc:20728,msg:'用户头像不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            'minLength':{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         'maxLength':{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        'format':{define:regex.dataUrlThumbnail,error:{rc:10730},mongoError:{rc:20730,msg:'用户头像格式不正确'}} //加密密码采用sha256，减少CPU负荷
    },
}

module.exports={
    user,
}