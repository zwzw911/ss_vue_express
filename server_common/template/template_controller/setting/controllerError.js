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


    /*              create                          */
    // impeachNotExistCantCreateComment:{rc:51005,msg:`举报不存在`},
    notImpeachCreatorCantCreateComment:{rc:51005,msg:`无权对他人举报进行评论`},

    /*              update                          */
    notImpeachCreatorCantUpdateComment:{rc:51005,msg:`无权对他人举报进行评论`},

}

module.exports={
    controllerError,
}