/**
 * Created by wzhan039 on 2017-06-09.
 * 所有正则常量定义
 */
    'use strict'
// ~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-  转义正则特殊字符
const regex={
    singleSpecialChar:/^[A-Za-z0-9~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]$/,
    email:/^([\w\u4e00-\u9fa5\-]+\.)*[\w\u4e00-\u9fa5\-]+@([\w\u4e00-\u9fa5\-]+\.)+[A-Za-z]+$/,//^[\w\u4e00-\u9fa5]+@[\w-]+(\.[\w-]+)+$
    sessionId:/\w+/,
    ip:/^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/,
    sha1Hash:/^[0-9a-f]{40}$/,
    sha256:/^[0-9a-f]{64}$/,
    sha512:/^[0-9a-f]{128}$/,

    objectId:/^[0-9a-f]{24}$/,//mongodb objectid
    
    userName:/^[\u4E00-\u9FFF\w]{2,20}$/,//2-20个汉字/英文/数字
    salt:/^[0-9a-zA-Z]{1,10}$/,
    password:/^[A-Za-z0-9~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,
    // encryptedPassword:/^[0-9a-f]{40}$/,
    //strictPassword:/^(?=.*[0-9])(?=.*[A-Za-z])(?=.*[\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?><\,\./;'\\\[\]])[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?><\,\./;'\\\[\]]{6,20}$/,//字母数字，特殊符号
    //strictPassword:/^(?=.*[0-9])(?=.*[A-Za-z])(?=.*[~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-])[A-Za-z0-9~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,//字母数字，特殊符号
    //loosePassword:/^(?=.*[0-9])(?=.*[A-Za-z])[A-Za-z0-9]{2,20}$/,//宽松密码设置，字母数字
    //loosePassword:/^[A-Za-z0-9]{2,20}$/,//宽松密码设置，字母数字
    account:/^(([\w\u4e00-\u9fa5\-]+\.)*[\w\u4e00-\u9fa5\-]+@([\w\u4e00-\u9fa5\-]+\.)+[A-Za-z]+|1\d{10})$/,//mail或者手机
    mobilePhone:/^1\d{10}$/, //11位的手机号
    // account:/[(\w+\.)*\w+@(\w+\.)+[A-Za-z]+|^1\d{10}$]/,
    imageName:/^[\u4E00-\u9FFF\w]{1,250}\.(jpg|png|jpeg)$/,
    hashImageName:/[0-9a-f]{40}\.(jpg|png|jpeg)/,
    hashAttachmentName:/[0-9a-f]{40}\.(txt|7z|log)/,
    folderName:/^[\u4E00-\u9FFF\w]{1,255}$/,
    fileName:/^[\u4E00-\u9FFF\w]{1,250}\.[a-z]{3,4}$/,
    tagName:/^[\u4E00-\u9FFF\w]{2,20}$/,//查询关键字，中文，英文
    pageNum:/^\d{1,4}$/,
    hashName:/^[0-9a-f]{40}\.\w{3,4}$/, //hash名+后缀
    captcha:/^[a-zA-Z0-9]{4}$/,
    // hashedThumbnail:/^[0-9a-f]{32}\.(jpg|jpeg|png)$/, //md5，非重要数据，节省空间
    dataUrlThumbnail:/^data:image\/(png|jpg|jpeg);base64,/,
    originalThumbnail:/^[\u4E00-\u9FFF\w]{2,20}\.(jpg|jpeg|png)$/,//
    // number采用isNaN判断，而无需正则
    // number:/^-?\d{1,}$/,//只能对字符正常工作，如果是纯数值会出错（1.0会true）; 无法处理巨大数字，因为会被parseFloat转换成科学计数法(1.23e+45}，从而无法用统一的regex处理

    // thumbnail:/^[0-9a-f]{40}\.[jpg|jpeg|png]$/,


    randomString:{
        basic:/^[0-9A-Z]{4,}$/,
        normal:/^[0-9a-zA-Z]{4,}$/,
        complicated:/^[0-9a-zA-Z~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]{4,}$/, //只有\[]

    },

    encodeHtmlChar:/[\s"&'<>]|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g,//把某些特殊字符转换成&xxx格式，传到client

    lua:{
        paramsConvert:/([{,])"(\w+)"/g, //传入lua脚本的参数固定为一个JSON转换的字符；因为lua无法处理引号(双或者单)括起的key，所以需要通过正则替换。对象===>JSON.stringify()===>字符===>正则去除双引号（stringify都为双引号）转换后的字符
    },

    //正则中的特殊字符+单双引号+反引号（因为要放在字符串中，不转义会造成字符串中断）
    regSpecialChar:/([\'\"\`\.\|\[\]\~\\\*\?\+\^\$\(\)\=\>\<\!])/g,
    regSpecialChar1:/(\\)/g,
}

module.exports= {
	regex,
}