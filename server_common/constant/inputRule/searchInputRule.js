/**
 * 搜索使用的inputRule略有不同，需要手工产生一份新的。直接从inputRule中copy后修改
 * 例如，user name有format，限定字数是2-20，但是对于搜索来说，可以是1-20个字符
 *
 * **/
 
"use strict"

const searchInputRule={
    'user': {
        'name': {
            'chineseName': "昵称",
            'dataType': "string",
            // 'applyRange': ["create", "update_scalar"],
            // 'placeHolder': ["昵称，由2-20个字符组成"],
            // 'searchRange': ["all"],
            // 'require': {
            //     "define": {"create": true, "update_scalar": false},
            //     "error": {"rc": 104100, "msg": "昵称不能为空"},
            //     "mongoError": {"rc": 204100, "msg": "昵称不能为空"}
            // },
            'maxLength': {
                "define": 20,
                "error": {"rc": 104102, "msg": "昵称最多20个字符"},
                // "mongoError": {"rc": 204102, "msg": "昵称的长度不能超过20个字符"}
            },
            'format': {
                "define": /^[\u4E00-\u9FFF\w]{1,20}$/,
                "error": {"rc": 104104, "msg": "昵称格式不正确"},
                // "mongoError": {"rc": 204104, "msg": "昵称必须由2-20个字符组成"}
            },
        },
        'account':{
            //暂时只支持手机号查询
            'chineseName':"账号",
            'dataType':"string",
            // 'applyRange':["create","update_scalar"],
            // 'placeHolder':["请输入您的手机号","请输入您的电子邮件地址"],
            // 'require':{"define":{"create":true,"update_scalar":false},"error":{"rc":104106,"msg":"账号不能为空"},"mongoError":{"rc":204106,"msg":"账号不能为空"}},
            'format':{
                "define":/1\d{0,10}$/,"error":{"rc":104108,"msg":"账号必须是手机号"},
                // "mongoError":{"rc":204108,"msg":"账号必须是手机号或者email"}
                },
        },
    },
    'user_friend_group': {
        'friendGroupName': {
            'chineseName': "朋友分组名",
            'dataType': "string",
            // 'applyRange':["create","update_scalar"],
            // 'require':{"define":{"create":true,"update_scalar":false},"error":{"rc":102600,"msg":"朋友分组名不能为空"},"mongoError":{"rc":202600,"msg":"朋友分组名不能为空"}},
            'minLength': {
                "define": 1,
                "error": {"rc": 102602, "msg": "朋友分组名至少1个字符"},
                // "mongoError": {"rc": 202602, "msg": "朋友分组名至少1个字符"}
            },
            'maxLength': {
                "define": 20,
                "error": {"rc": 102604, "msg": "朋友分组名的长度不能超过20个字符"},
                // "mongoError": {"rc": 202604, "msg": "朋友分组名的长度不能超过20个字符"}
            },
        },
    }
}
module.exports={
    searchInputRule,
}
