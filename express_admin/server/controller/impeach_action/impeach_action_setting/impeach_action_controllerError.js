/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*                 dispatch                     */
    notLoginCantChangeAction:{rc:51200,msg:`尚未登录，无法更改举报状态`},
    // userInPenalizeNoImpeachCreate:{rc:51202,msg:`用户被处罚，无法操作举报`},
    /*              create(for user)                          */
    actionNoRelatedPriority:{rc:51204,msg:{client:`操作错误，请联系管理员`,server:`操作没有对应的权限`}},
    userHasNoPriorityToThisOption:{rc:51204,msg:{client:`操作错误，请联系管理员`,server:`用户无权进行当前操作`}},
    ownerIdMustExists:{rc:51206,msg:{client:`未指定举报处理人`,server:`必须指定举报的下一个处理人`}},
    noPreviousActionRecords:{rc:51208,msg:{client:`操作记录出错，请联系管理员`,server:`adminUser进行操作的时候，必须已经存在user所做的操作记录`}},
    relatedImpeachAlreadyDeleted:{rc:51204,msg:`举报已经被删除，无法更改举报状态`},
    impeachAlreadyDone:{rc:51206,msg:`举报已经处理完毕，无法继续操作`},
    // notCreatorOfImpeach:{rc:51208,msg:`非举报创建人，无法更改举报状态`},
    forbidToTakeActionForCurrentImpeach:{rc:51208,msg:`未被分配处理当前举报，无法进行任何处理`},

    invalidActionForAdminUser:{rc:51210,msg:`操作不正确`},
    // forbidActionForUser:{rc:51212,msg:`操作不允许`},

    invalidActionBaseOnCurrentAction:{rc:51216,msg:`操作错误`},





/*    cantCreateSinceNoPreviousState:{rc:51206,msg:`举报没有任何状态记录`},
    firstStateMustBeNew:{rc:51208,msg:`举报的初始状态错误`},
    impeachEndedNoMoreStateChangeAllow:{rc:51209,msg:`举报处理已结束`},
    NEWStateNotAllow:{rc:51210,msg:`举报状态错误`},//NEW是自动创建，无法通过API创建
    adminHasNoPriorityChangeToInputState:{rc:51211,msg:`无权更改状态`},//adminUser无权更改为输入的状态*/

}

module.exports={
    controllerError,
}