/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*                 dispatch                     */
    notLoginCantChangeState:{rc:51000,msg:`尚未登录，无法更改举报状态`},

    /*              create                          */
    notLoginCantCreateUser:{rc:51000,msg:`尚未登录，无法创建新用户`},


}

module.exports={
    controllerError,
}