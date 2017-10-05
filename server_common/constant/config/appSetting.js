/**
 * Created by ada on 2016-09-30.
 */

const e_env=require('../enum/nodeEnum').Env

    //true：req.ip是最近的一个IP（最近的代理服务器IP）；req.ips是数组，从源头开始，到最近代理的IP；
    //fasle：req.ip(s)返回undefined和[]。此时需要req.connection.remoteAddress
const appSetting={
    [e_env.DEV]:{
        'trust_proxy':false,
        hostDomain:'127.0.0.1',

        mongoSwitchForNormal:'127.0.0.1:27017',//mongo switch的ip
        mongoSwitchForAdmin:'127.0.0.1:27017',//mongo switch的ip

        redisIPForNormal:'127.0.0.1',
        redisPortForNormal:'6379',

    },
    [e_env.PROD]:{
        'trust_proxy':true,
        hostDomain:'172.24.251.56',

        mongoSwitchForNormal:'127.0.0.1:27017',//mongo switch的ip
        mongoSwitchForAdmin:'127.0.0.1:27017',//mongo switch的ip

        redisIPForNormal:'127.0.0.1',
        redisPortForNormal:'6379',
    }
}

const currentEnv=e_env.DEV
const currentAppSetting=appSetting[currentEnv]



//maxAge:ms;  负数（-1）：临时cookie，关闭网页就删除cookie；0：立刻删除；正整数：多少毫秒后失效
// secure:false, cookie是否只能在https上传输。false，可在http上传
//path: URL必须符合才能使用cookie。例如，如果设置path为/test/,则URL必须为/test才能使用。设为/，所有URL均可使用。
//domain：域名，必须以.作为开头（或者直接就是IP？？），则所有以此设置为结尾的URL都可使用cookie。domian_path限定了访问cookie的路径

const generalCookieSetting={
    path:'/', //域名下所有URL都可以使用session
    domain:currentAppSetting['hostDomain'], //可以使用session的域名（可以是IP,127.0.0.1)
    //maxAge:900000, // 整数，ms。默认15分钟
    secure:false, //只用https
    httpOnly:true, //通过http传递cookie
}

module.exports={
    currentEnv,
    currentAppSetting,
    generalCookieSetting,

}