/**
 * Created by wzhan039 on 2017-07-05.
 */
'use strict'


// const e_method=require('../enum/nodeEnum').Method

const securityError={
    intervalError:{
        rejectReq(ttl){return {rc:41000,msg:`请求过于频繁，请在${ttl}秒后再试`}},
    },
    
}

const systemError={
    noDefinedStorePath:{rc:41100,msg:{client:`系统错误，请联系管理员`,server:`没有定义存储头像的目录`}},
    storePathReachLowThreshold({storePathName, storePath}){
        return {rc:41102,msg:{client:`系统错误，请联系管理员`,server:`存储路径${storePathName}:${storePath}已经达到下限值`}}
    },
    storePathReachHighThreshold({storePathName, storePath}){
        return {rc:41104,msg:{client:`系统错误，请联系管理员`,server:`存储路径${storePathName}:${storePath}已经达到上限值`}}
    },
    noAvailableStorePathForUerPhoto:{rc:41106,msg:{client:`系统错误，请联系管理员`,server:`用户头像无可用存储路径`}},

    noDefinedResourceProfile:{rc:41108,msg:{client:`系统错误，请联系管理员`,server:`没有定义资源配置`}},
    userNoDefaultResourceProfile:{rc:41110,msg:{client:`系统错误，请联系管理员`,server:`没有为用户定义默认的资源配置`}},

    noMatchRESTAPI:{rc:41112,msg:{client:`错误，链接不存在`,server:`没有对应的路由`}},
}

//41200~41300
const dataTypeError={
    ifFieldDataTypeObjectId: {
        ruleTypeNotDefine: {rc: 41200, msg: {client: `参数错误`, server: '字段rule中，没有定义数据类型'}},
    }
}

const crypt={
    unknownHashType:{rc:41410,msg:`未知hash类型`},
    unknownCryptType:{rc:41412,msg:`未知加密类型`},
}

const gmImage={
    /*                      getter                          */
    size:{rc:41500,msg:{client:`读取图片信息失败`,server:`读取图片长宽大小失败`}},
    orientation:{rc:41502,msg:{client:`读取图片信息失败`,server:'读取图片方向失败'}},
    format:{rc:41504,msg:{client:`读取图片信息失败`,server:'读取图片格式失败'}},
    depth:{rc:41506,msg:'读取图片颜色深度失败'},
    color:{rc:41508,msg:'读取图片颜色数量失败'},
    res:{rc:41510,msg:'读取图片解析度失败'},
    fileSize:{rc:41512,msg:'读取图片大小失败'},
    identify:{rc:41514,msg:'读取图片信息失败'},
    unknownGetter:{rc:41516,msg:{client:'内部错误，读取读取图片信息失败',server:'未知Getter类型'}},

    /*                   方法                           */
    resize:{rc:41518,msg:"更改图片大小失败"},
    resizeUserThumbNail:{rc:41520,msg:"更改头像大小失败"},
    unknownCommand:{rc:41522,msg:"未知图片方法"},

    parseFileSize:{rc:41530,msg:'解析图片文件大小失败'},
    parseFileSizeNum:{rc:41532,msg:`图片文件大小不正确`},

    unknownUnit:{rc:41534,msg:`图片文件大小的单位不正确`},

    invalidateFormat:{rc:41536,msg:'图片格式不支持'},

    convertImageTypeFail:{rc:41538,msg:'无法转换图片格式'},
}

const upload={
    parameterNotDefine:function(parameter){
        return {rc:41600,msg:`参数${parameter}没有定义`}
    },
    fileNameCantEmpty:function(parameter){
        return {rc:41601,msg:`参数${parameter}不能为空`}
    },
    uploadFolderNotExist:function(uploadFolder){
        return {rc:41602,msg:`上传目录${uploadFolder}不存在`}
    },
    maxSizeNotInt:function(maxSize){
        return {rc:41604,msg:`文件最大尺寸${maxSize}不是整数`}
    },
    maxSizeNotPositive:function(maxSize){
        return {rc:41606,msg:`文件最大尺寸${maxSize}不是正数`}
    },
    maxFileNumNotInt:function(maxFileNum){
        return {rc:41608,msg:`最大上传文件数量${maxFileNum}不是整数`}
    },
    maxFileNumNotPositive:function(maxFileNum){
        return {rc:41610,msg:`最大上传文件数量${maxFileNum}不是正数`}
    },
    exceedMaxFileSize:function(){
        return {rc:41612,msg:`上传文件尺寸超过最大定义`}
    },
    uploadedFileUndefined:function(){
        return {rc:41613,msg:`上传文件数量为空`}
    },
    uploadedFileNumIsZero:function(){
        return {rc:41614,msg:`上传文件数量为0`}
    },
}

const shaLua={
    readLuaFileFail(file){
        return {rc:41700,msg:`读取文件${file}失败`}
    },
    cacheScriptContentFail(file){
        return {rc:41702,msg:`缓存脚本${file}失败`}
    },
/*    readStatsFail(path){
        return {rc:41704,msg:`读取路径${path}的stat失败`}
    }*/
}

//41800~41900
const misc={
    /*          checkInterval_async             */

    unknownRequestIdentify:{rc:41824,msg:{client:'无法识别请求id',server:'请求既无IP也无sessionId'}},
    forbiddenReq:{rc:41816,msg:{client:'请求被禁止',server:'请求被禁止'}},
    between2ReqCheckFail:{rc:41818,msg:{client:'请求过于频繁，请稍候再尝试',server:'两次请求间隔小于预订值'}},
    exceedMaxTimesInDuration:{rc:41820,msg:{client:'请求过于频繁，请稍候再尝试',server:'定义的时间段内，请求次数超出最大值'}},
    tooMuchReq:{rc:41822,msg:{client:'请求过于频繁，请稍候再尝试',server:'request过于频繁'}},

    /*            generateRandomString          */
    unknownRandomStringType:{rc:41830,msg:{client:'内部错误',server:'随机字符串类型未知'}},

    /*              restTimeInDay               */
    unknownTimeUnit:{rc:41841,msg:{client:'内部错误',server:'时间单位未知'}},

    /*              checkUserState              */
    notExpectedUserState:{rc:41852,msg:{client:'内部错误',server:'用户状态不对'}},

    /*              sendVerificationCodeByEmail_async               */
    sendMailError(err){return {rc:41854,msg:{client:'邮件发送出错',server:`邮件发送错误:${JSON.stringify(err)}`}}},
    /*              getSessionId_async                               */


    sessionIdNotExist:{rc:41856,msg:{client:`非法请求`,server:`请求中无session`}},
    sessionIdFormatWrong:{rc:41857,msg:{client:'请求格式不正确',server:'session格式不正确'}},
    /*              getIP_async                               */
    IPNotExist:{rc:41858,msg:{client:`非法请求`,server:`请求中无IP`}},
    IPFormatWrong:{rc:41859,msg:{client:'请求格式不正确',server:'IP格式不正确'}},
    /*              dataUrl2File_async                          */
    dataUrlNotValidImage:{rc:41862,msg:{client:'图片格式不正确',server:'dataUrl无法通过正则获得图片格式'}},
    /*              convertFileSize                         */
    unknownUnit:{rc:41864,msg:'转换文件大小的单位未知'},
}

//41900~41000
const awesomeCaptcha={
    genCaptchaBufferFail:{rc:41900,msg:{client:`生成图形字符失败`,server:`canvas调用toBuffer失败`}},
    genCaptchaDataUrlFail:{rc:41902,msg:{client:`生成图形字符失败`,server:`canvas调用toDataURL失败`}},
}




module.exports={
    securityError,
    systemError,
    dataTypeError,
    crypt,
    gmImage,
    awesomeCaptcha,
    upload,
    shaLua,
    misc,

}