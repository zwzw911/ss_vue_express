/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*              dispatch                           */
    //create
    notLoginCantCreateImpeachComment:{rc:51000,msg:`尚未登录，无法对举报进行评论`},
    currentUserForbidToCreateImpeachComment:{rc:51004,msg:`您被禁止对举报进行评论`},
    //update
    notLoginCantUpdateImpeachComment:{rc:51001,msg:`尚未登录，无法更新举报评论`},
    currentUserForbidToUpdateImpeachComment:{rc:51005,msg:`您被禁止对举报评论进行更新`},

    /*              logic                           */
    //create
    // impeachNotExistCantCreateComment:{rc:51005,msg:`举报不存在`},
    notImpeachCreatorCantCreateComment:{rc:51005,msg:`无权对他人举报进行评论`},

    // update
    notImpeachCreatorCantUpdateComment:{rc:51005,msg:`无权对他人举报进行评论`},

    //upload
    notImpeachCreatorCantUploadFile:{rc:50716,msg:`无权为他人举报评论上传文件`},
    imageFormatNotSupport:{rc:50717,msg:`只支持JPG/PNG格式的图片`},
    imageResolutionNotSupport:{rc:50718,msg:`图片的分辨率过高`},

    resourceRangeNotExpected:{rc:50720,msg:{'client':"内部错误，请联系管理员",server:`非期望的resourceRange`}},
    ImpeachImageNumExceed:{rc:50722,msg:{'client':"举报对话中插入的图片数量过多，请删除部分图片后再试"}},
    ImpeachImageSizeExceed:{rc:50722,msg:{'client':"举报对话中插入的图片过大,请删除部分图片后再试"}},
    wholeImpeachImageNumExceed:{rc:50724,msg:{'client':"您在整个举报已经举报对话中插入的图片数量过多，无法继续添加"}},
    wholeImpeachImageSizeExceed:{rc:50724,msg:{'client':"您在整个举报已经举报对话中插入的图片尺寸过大，无法继续添加"}},
}

module.exports={
    controllerError,
}