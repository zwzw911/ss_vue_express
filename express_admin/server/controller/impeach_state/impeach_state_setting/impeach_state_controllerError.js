/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    /*                 dispatch                     */
    notLoginCantChangeState:{rc:50900,msg:`尚未登录，无法更改举报状态`},

    /*              create                          */
    //notLoginCantCreateUser:{rc:50902,msg:`尚未登录，无法创建新用户`},
    relatedImpeachAlreadyDeleted:{rc:50903,msg:`举报已经被删除，无法更改举报状态`},
    notCreatorOfImpeach:{rc:50904,msg:`非举报创建人，无法更改举报状态`},
    cantCreateSinceNoPreviousState:{rc:50906,msg:`举报没有任何状态记录`},
    firstStateMustBeNew:{rc:50908,msg:`举报的初始状态错误`},
    impeachEndedNoMoreStateChangeAllow:{rc:50909,msg:`举报处理已结束`},
    NEWStateNotAllow:{rc:50910,msg:`举报状态错误`},//NEW是自动创建，无法通过API创建
    adminHasNoPriorityChangeToInputState:{rc:50911,msg:`无权更改状态`},//adminUser无权更改为输入的状态
    invalidStateBaseOnCurrentState:{rc:50912,msg:`举报状态错误`},
}

module.exports={
    controllerError,
}