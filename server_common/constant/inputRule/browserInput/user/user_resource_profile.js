/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../constant/genEnum//enumValue')

const user_resource_profile= {
    userId: {
        'chineseName': '用户',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10760}, mongoError: {rc: 20760, msg: '用户不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        'minLength': {define: 2, error: {rc: 10702}, mongoError: {rc: 20702, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10704}, mongoError: {rc: 20704, msg: '用户名的长度不能超过20个字符'}},*/
        'format': {define: regex.objectId, error: {rc: 10762}, mongoError: {rc: 20762, msg: '用户格式不正确'}} //server端使用
    },
    resource_profile_id: {
        'chineseName': '资源配置',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10764}, mongoError: {rc: 20764, msg: '资源配置不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
/*        'minLength': {define: 2, error: {rc: 10710}, mongoError: {rc: 20710, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10712}, mongoError: {rc: 20712, msg: '用户名的长度不能超过20个字符'}},*/
        'format': {define: regex.objectId, error: {rc: 10766}, mongoError: {rc: 20766, msg: '资源配置格式不正确'}} //server端使用
    },



    duration:{
        'chineseName': '资源配置有效期',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 10768}, mongoError: {rc: 20768, msg: '资源配置有效期不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'min': {define: 0, error: {rc: 10770}, mongoError: {rc: 20770, msg: '源配置有效期最短1天'}},
        'max': {define: 365, error: {rc: 10772}, mongoError: {rc: 20772, msg: '源配置有效期最长1年'}},
},


}

module.exports={
    user_resource_profile,
}