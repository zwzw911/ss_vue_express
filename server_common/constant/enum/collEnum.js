/**
 * Created by ada on 2017/9/18.
 * 对于某些外键字段，需要而外的field来确定链接的是那个coll，此时需要判断用户输入的是否为限定的coll中的一种
 */
'use strict'

const collNameForFK={
    "impeach_state":{
        "dealerColl":["user","admin_user"],
        "ownerColl":["user","admin_user"],
    },
}

module.exports={
    collNameForFK,
}