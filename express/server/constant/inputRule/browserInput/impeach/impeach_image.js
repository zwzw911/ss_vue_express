/**
 * Created by wzhan039 on 2017-06-16.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*              upload file define          */
// const uploadFileDefine=require('../../../config/globalConfiguration').uploadFileDefine
/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../model/mongo/structure/enumValue')

const impeach_image= {
    referenceId: {
        'chineseName': '举报对象',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10634}, mongoError: {rc: 20634, msg: '举报对象不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10636}, mongoError: {rc: 20636, msg: '举报对象必须是objectId'}} //server端使用
    },

    referenceColl: {
        'chineseName': '举报对象类型',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10638}, mongoError: {rc: 20638, msg: '举报对象类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'enum':{define:enumValue.ImpeachImageReferenceColl,error:{rc:10539},mongoError:{rc:20539,msg:'举报对象的类型未知'}},//server端使用
    },

}

module.exports={
    impeach_image
}