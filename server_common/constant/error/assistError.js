/**
 * Created by wzhan039 on 2017-07-05.
 */
'use strict'


const e_method=require('../enum/nodeEnum').Method

const crypt={
    unknownHashType:{rc:40400,msg:`未知hash类型`},
    unknownCroptType:{rc:40402,msg:`未知加密类型`},
}

const gmImage={
    /*                      getter                          */
    size:{rc:40500,msg:{client:`读取图片信息失败`,server:`读取图片长宽大小失败`}},
    orientation:{rc:40502,msg:{client:`读取图片信息失败`,server:'读取图片方向失败'}},
    format:{rc:40504,msg:{client:`读取图片信息失败`,server:'读取图片格式失败'}},
    depth:{rc:40506,msg:'读取图片颜色深度失败'},
    color:{rc:40508,msg:'读取图片颜色数量失败'},
    res:{rc:40510,msg:'读取图片解析度失败'},
    fileSize:{rc:40512,msg:'读取图片大小失败'},
    identify:{rc:40514,msg:'读取图片信息失败'},
    unknownGetter:{rc:40516,msg:{client:'内部错误，读取读取图片信息失败',server:'未知Getter类型'}},

    /*                   方法                           */
    resize:{rc:40518,msg:"更改图片大小失败"},
    resizeUserThumbNail:{rc:40520,msg:"更改头像大小失败"},
    unknownCommand:{rc:40522,msg:"未知图片方法"},

    parseFileSize:{rc:40530,msg:'解析图片文件大小失败'},
    parseFileSizeNum:{rc:40532,msg:`图片文件大小不正确`},

    unknownUnit:{rc:40534,msg:`图片文件大小的单位不正确`},

    invalidateFormat:{rc:40536,msg:'图片格式不支持'},

    convertImageTypeFail:{rc:40538,msg:'无法转换图片格式'},
}

const upload={
    parameterNotDefine:function(parameter){
        return {rc:40600,msg:`参数${parameter}没有定义`}
    },
    fileNameCantEmpty:function(parameter){
        return {rc:40601,msg:`参数${parameter}不能为空`}
    },
    uploadFolderNotExist:function(uploadFolder){
        return {rc:40602,msg:`上传目录${uploadFolder}不存在`}
    },
    maxSizeNotInt:function(maxSize){
        return {rc:40604,msg:`文件最大尺寸${maxSize}不是整数`}
    },
    maxSizeNotPositive:function(maxSize){
        return {rc:40606,msg:`文件最大尺寸${maxSize}不是正数`}
    },
    maxFileNumNotInt:function(maxFileNum){
        return {rc:40608,msg:`最大上传文件数量${maxFileNum}不是整数`}
    },
    maxFileNumNotPositive:function(maxFileNum){
        return {rc:40610,msg:`最大上传文件数量${maxFileNum}不是正数`}
    },
    exceedMaxFileSize:function(){
        return {rc:40612,msg:`上传文件尺寸超过最大定义`}
    },
    uploadedFileUndefined:function(){
        return {rc:40613,msg:`上传文件数量为空`}
    },
    uploadedFileNumIsZero:function(){
        return {rc:40614,msg:`上传文件数量为0`}
    },
}

const shaLua={
    readLuaFileFail(file){
        return {rc:40700,msg:`读取文件${file}失败`}
    },
    cacheScriptContentFail(file){
        return {rc:40702,msg:`缓存脚本${file}失败`}
    },
/*    readStatsFail(path){
        return {rc:40704,msg:`读取路径${path}的stat失败`}
    }*/
}

//40800~40900
const misc={
    /*          checkInterval_async             */
    sessionIdWrong:{rc:40800,msg:{client:'请求格式不正确',server:'session格式不正确'}},
    IPWrong:{rc:40802,msg:{client:'请求格式不正确',server:'IP格式不正确'}},
    unknownRequestIdentify:{rc:40824,msg:{client:'无法识别请求id',server:'请求既无IP也无sessionId'}},
    forbiddenReq:{rc:40816,msg:{client:'请求被禁止',server:'请求被禁止'}},
    between2ReqCheckFail:{rc:40818,msg:{client:'请求过于频繁，请稍候再尝试',server:'两次请求间隔小于预订值'}},
    exceedMaxTimesInDuration:{rc:40820,msg:{client:'请求过于频繁，请稍候再尝试',server:'定义的时间段内，请求次数超出最大值'}},
    tooMuchReq:{rc:40822,msg:{client:'请求过于频繁，请稍候再尝试',server:'request过于频繁'}},

    /*            generateRandomString          */
    unknownRandomStringType:{rc:40830,msg:{client:'内部错误',server:'随机字符串类型未知'}},

    /*              restTimeInDay               */
    unknownTimeUnit:{rc:40840,msg:{client:'内部错误',server:'时间单位未知'}},

    /*              checkUserState              */
    notExpectedUserState:{rc:40852,msg:{client:'内部错误',server:'用户状态不对'}},

    /*              sendVerificationCodeByEmail_async               */
    sendMailError(err){return {rc:40854,msg:{client:'邮件发送出错',server:`邮件发送错误:${JSON.stringify(err)}`}}}

}

//40900~41000
const awesomeCaptcha={
    unknownHashType:{rc:40400,msg:`未知hash类型`},
    unknownCryptType:{rc:40402,msg:`未知加密类型`},
}




module.exports={
    crypt,
    gmImage,
    awesomeCaptcha,
    upload,
    shaLua,
    misc,

}