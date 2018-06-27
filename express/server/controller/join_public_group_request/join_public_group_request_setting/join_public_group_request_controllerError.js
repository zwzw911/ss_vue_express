/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    // 52000～52040
    dispatch:{
        'post':{
            notLoginCantCreateJoinRequest:{rc:52000,msg:`尚未登录，无法加入任何群`},
            userInPenalizeCantCreateJoinRequest:{rc:52002,msg:`您被禁止加入群`},
            //upload
            // notLoginCantUploadImageForImpeachComment:{rc:52007,msg:`尚未登录，无法为举报评论添加图片`},
        },
        'put':{
            //update
            notLoginCantUpdateJoinRequest:{rc:52004,msg:`尚未登录，无法处理入群请求`},
            userInPenalizeCantUpdateJoinRequest:{rc:52006,msg:`您被禁止处理入群请求`},
        },
    },
    /*              dispatch                           */
    //create



    /*              create                          */
    // impeachNotExistCantCreateComment:{rc:51005,msg:`举报不存在`},
    create:{
        publicGroupNotAllowJoin:{rc:52040,msg:'群不允许任何人加入'},
        requestAlreadyExist:{rc:52041,msg:'入群请求已经存在，无法继续请求'},
        alreadyInPublicGroup:{rc:52042,msg:'已经是群成员'},
        // notImpeachCreatorCantCreateComment:{rc:52008,msg:`无权对他人举报进行评论`},
    },

    // impeachNotSubmitNoNeedToAddComment:{rc:52009,msg:`举报尚未提交，请直接修改举报`},

    /*              update                          */
    update:{
        // notImpeachCreatorCantUpdateComment:{rc:52012,msg:`无权更改他人举报评论`},
        // impeachCommentAlreadyCommitCantBeUpdate:{rc:52014,msg:`举报评论无法被修改`},
        notPublicGroupAdminMemberCantHandleJoinRequest:{rc:52050,msg:'非群管理员，无法处理入群请求'}
    },
    // impeachCommentNotExist:{rc:52010,msg:`举报评论不存在`},
    

}

module.exports={
    controllerError,
}