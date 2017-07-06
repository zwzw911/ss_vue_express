/**
 * Created by wzhan039 on 2017-07-05.
 */
'use strict'
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
    unknownGetter:{rc:50516,msg:{client:'内部错误，读取读取图片信息失败',server:'未知Getter类型'}},

    /*                   方法                           */
    resize:{rc:69620,msg:"更改图片大小失败"},
    invalidateFormat:{rc:40505,msg:'图片格式不支持'},
}

const awesomeCaptcha={
    unknownHashType:{rc:40400,msg:`未知hash类型`},
    unknownCroptType:{rc:40402,msg:`未知加密类型`},
}



module.exports={
    crypt,
    gmImage,
    awesomeCaptcha,
}