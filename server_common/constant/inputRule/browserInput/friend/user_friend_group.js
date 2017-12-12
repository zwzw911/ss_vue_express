/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')*/
/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const user_friend_group= {
    friendGroupName: {
        'chineseName': '朋友分组名',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10410}, mongoError: {rc: 20410, msg: '朋友分组名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10412}, mongoError: {rc: 20412, msg: '朋友分组名至少1个字符'}},
        'maxLength': {define: 20, error: {rc: 10414}, mongoError: {rc: 20414, msg: '朋友分组名的长度不能超过20个字符'}},
        // 'format': {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },


    friendsInGroup:{
        'chineseName': '好友分组',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10420}, mongoError: {rc: 20420, msg: '好友分组不能为空'}},//必须存在，可以为空数组
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'arrayMaxLength': {define: maxNumber.friend.maxFriendsNumberPerGroup, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含${maxNumber.friend.maxFriendsNumberPerGroup}个好友`}},
        'format': {define: regex.objectId, error: {rc: 10424}, mongoError: {rc: 20424, msg: '好友必须是objectId'}} //server端使用
    },


}

module.exports={
    user_friend_group
}