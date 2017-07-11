/**
 * Created by Ada on 2017/7/10.
 */
'use strict'


const general={
    setError:{rc:32000,msg:'保存数据出错'},
    getError:{rc:32002,msg:'读取数据出错'},
    keyNotExist:{rc:32004,msg:'redis中没有找到对应的键'},
    existsFail:{rc:32006,msg:'执行exists命令出错'},
    rpushFail:{rc:32008,msg:'执行rpush命令出错'},
    llenFail:{rc:32010,msg:'执行llen命令出错'},
    lindexFail:{rc:32012,msg:'执行lindex命令出错'},
    lpopFail:{rc:32014,msg:'执行lpop命令出错'},
    ttlFail:{rc:320116,msg:'执行ttl命令出错'},
    luaFail:{rc:32018,msg:'脚本执行失败'},
}

const luaError={
    luaParamNotObject(sha){return {rc:32030,msg:`lua脚本${sha}的参数必须是object`}},
    luaExecFail(sha){return {rc:32030,msg:`lua脚本${sha}执行失败`}},
}
const captcha={
    getError:{rc:32010,msg:'读取验证码出错'},
    saveError:{rc:32012,msg:'保存验证码出错'},
    delError:{rc:32013,msg:'删除验证码出错'},
    expire:{rc:32014,msg:'验证码超时，请重新输入'},
    notExist:{rc:32016,msg:'验证码超时或者不存在'}
}

const adminLogin={
    notLogin:{rc:32020,msg:'尚未登录'},
    userPasswordNotExist:{rc:32022,msg:'用户名密码不存在'},
    getNameFail:{rc:32024,msg:'读取用户名出错'},
    getPasswordFail:{rc:32025,msg:'读取密码出错'},
}

const intervalCheckBaseIP={
    listIsEmpty:{rc:32030,msg:'list为空'},
    /*        userPasswordNotExist:{rc:32022,msg:'用户名密码不存在'},
     getNameFail:{rc:32024,msg:'读取用户名出错'},
     getPasswordFail:{rc:32025,msg:'读取密码出错'},*/
}

const globalSetting={
    hgetFail:{rc:32040,msg:'hget命令出错'},
}

module.exports={
    general,
    luaError,
}