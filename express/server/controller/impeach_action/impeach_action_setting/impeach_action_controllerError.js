/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*                 dispatch                     */
    notLoginCantChangeAction:{rc:50900,msg:`尚未登录，无法更改举报状态`},
    userInPenalizeNoImpeachCreate:{rc:50902,msg:`用户被处罚，无法操作举报`},
    /*              create(for user)                          */
    // relatedImpeachAlreadyDeleted:{rc:50904,msg:`举报已经被删除，无法更改举报状态`},//直接通过fk check来检测
    impeachAlreadyDone:{rc:50906,msg:`举报已经处理完毕，无法继续操作`},
    notCreatorOfImpeach:{rc:50908,msg:`非举报创建人，无法更改举报状态`},

    invalidActionForUser:{rc:50910,msg:`操作不正确`},
    forbidActionForUser:{rc:50912,msg:`操作不允许`},
    forbidInputOwnerId:{rc:50914,msg:{client:`输入错误`,server:`普通用户不允许设置处理人`}},
    invalidActionBaseOnCurrentAction:{rc:50916,msg:`操作错误`},





/*    cantCreateSinceNoPreviousState:{rc:50906,msg:`举报没有任何状态记录`},
    firstStateMustBeNew:{rc:50908,msg:`举报的初始状态错误`},
    impeachEndedNoMoreStateChangeAllow:{rc:50909,msg:`举报处理已结束`},
    NEWStateNotAllow:{rc:50910,msg:`举报状态错误`},//NEW是自动创建，无法通过API创建
    adminHasNoPriorityChangeToInputState:{rc:50911,msg:`无权更改状态`},//adminUser无权更改为输入的状态*/

}

module.exports={
    controllerError,
}