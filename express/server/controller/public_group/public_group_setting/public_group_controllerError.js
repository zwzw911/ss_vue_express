/**
 * Created by ada on 2017/9/1.
 */
'use strict'


const controllerError={
    //51400～51440
    /*              dispatch                           */
    dispatch:{
        post:{
            notLoginCantCreatePublicGroup:{rc:51400,msg:`尚未登录，无法创建群`},
            userInPenalizeCantCreatePublicGroup:{rc:51402,msg:`您被禁止创建群`},
        },
        put:{
            notLoginCantUpdatePublicGroup:{rc:51404,msg:`尚未登录，无法更新群`},
            userInPenalizeCantUpdatePublicGroup:{rc:51406,msg:`您被禁止对群更新`},

            notLoginCantRemoveMember:{rc:51406,msg:`尚未登录，无法移除群成员`},
            notLoginCantExitPublicGroup:{rc:51407,msg:`尚未登录，无法离群`},
            notLoginCantManageAdminMember:{rc:51408,msg:`尚未登录，无法添加移除管理员`},
        },
        'delete':{
            notLoginCantDeletePublicGroup:{rc:51408,msg:`尚未登录，无法删除群`},
            userInPenalizeCantDeletePublicGroup:{rc:51410,msg:`您被禁止删除群`},
        },
    },
    //51440～51470
    /**              logic                           **/
    create:{
        unExpectedInputFiled:{rc:51440,msg:`输入字段有误`},
        userNoDefaultFolder:{rc:51442,msg:`无默认目录`},
    },
    update:{
        unExpectedInputFiled:{rc:51450,msg:`输入字段有误`},
        notUserGroupAdminCantUpdate:{rc:51452,msg:{'client':"无法更新他人数据",server:`recordId对应数据的owner不是当前用户`}},
    },
    'delete':{
        notGroupCreatorCantDelete:{rc:51460,msg:'无法删除他人的公共群'},
        // cantDeleteDefaultGroup:{rc:51462,msg:'不能删除默认分组'},
        cantDeleteGroupContainMember:{rc:51464,msg:'公共群非空，无法删除'},
    },


    //51470～51500
    /**     misc        **/

    creatorAddRemoveAdmin:{
        notFindGroup:{rc:51470,msg:'指定群不存在'},
        notCreatorCantAddRemoveAdmin:{rc:51472,msg:{client:'无权操作群',server:'当前用户非群创建者，无权添加删除群管理员'}},
        canOnlyContain1Field:{rc:51473,msg:{client:'输入错误',server:'只能对单个字段ADMINS_ID进行操作'}},
        cantAddRemoveSameUser:{rc:51474,msg:{client:'输入错误',server:'不能同时添加删除管理员'}},

        notPublicGroupMemberCantBeAdmin:{rc:51475,msg:{client:'输入错误',server:'不是群成员，不能添加为群管理员'}},
        alreadyAdmin:{rc:51476,msg:{client:'输入错误',server:'已经是群管理员，无法继续添加'}},

        cantDeletePublicGroupCreator:{rc:51477,msg:{client:'输入错误',server:'不能删除群创建者'}},

        missField:{rc:51478,msg:{client:'输入错误',server:'输入参数中没有设置要操作的字段'}},
        groupMemberReachMax:{rc:51479,msg:{client:'群成员到达上限',server:'群管理员达到上限，无法继续批准新管理员加入'}},
    },

    adminRemoveMember:{
        notFindGroup:{rc:51480,msg:'指定群不存在'},
        notAdminCantRemoveMember:{rc:51482,msg:{client:'无权操作群',server:'当前用户非admin，无权对群进行操作'}},
        canOnlyContain1Field:{rc:51483,msg:{client:'输入错误',server:'只能对单个字段MEMBERS_ID进行操作'}},
        missField:{rc:51484,msg:{client:'输入错误',server:'输入参数中没有设置要操作的字段'}},
        wrongKeyExist:{rc:51486,msg:{client:'输入错误',server:'输入参数中有多余的key'}},
        missMandatoryKey:{rc:51487,msg:{client:'输入错误',server:'输入参数中缺少必须key：remove'}},
        cantRemoveAdmin:{rc:51488,msg:{client:'输入错误',server:'无权删除群管理员'}},
        removeMemberDuplicate:{rc:51489,msg:{client:'输入错误',server:'无权删除群管理员'}},
    },

    requestExit:{
        notFindGroup:{rc:51490,msg:'指定群不存在'},
        creatorCantExitPublicGroup:{rc:51492,msg:'群创建者不能离开群'}
    },   


}

module.exports={
    controllerError,
}